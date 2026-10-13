import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import type { Layer, Subject } from './types';
import { domeEquirectTexture } from './textures';
import { createStudioEnvironment, createStudio, KEY_LIGHT_POS, FILL_LIGHT_POS, RIM_LIGHT_POS } from './studio';

interface BuiltLayer {
  def: Layer;
  root: THREE.Group;
  /** 装配态世界位置（基线） */
  basePos: THREE.Vector3;
  explodedPos: THREE.Vector3;
  meshes: THREE.Mesh[];
}

export interface ViewerCallbacks {
  onPick?: (layerId: string | null) => void;
  onHover?: (layerId: string | null) => void;
}

export class TeardownViewer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private subjectRoot = new THREE.Group();
  private built: BuiltLayer[] = [];
  private subject: Subject | null = null;

  private explodeT = 0;
  private explodeTarget = 0;
  private explodeScale = 1;

  private hovered: string | null = null;
  private isolated: string | null = null;
  private hidden = new Set<string>();

  private sectionEnabled = false;
  private clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private localClipping = true;

  private labelLayer: HTMLDivElement;
  private labels: {
    el: HTMLDivElement;
    layerId: string;
    anchor: THREE.Vector3;
    parent: THREE.Object3D;
    /** 屏幕像素坐标，每帧更新 */
    sx: number;
    sy: number;
    /** 是否在视口内 */
    onScreen: boolean;
  }[] = [];
  private labelVisible = true;
  /** 'dot' 只显示圆点（默认，不遮挡）；'full' 展开文字；'none' 完全隐藏 */
  private labelMode: 'dot' | 'full' | 'none' = 'dot';
  /** 当前激活层的 id —— 只有它的标注展开文字 */
  private labelFocus: string | null = null;

  private clock = new THREE.Clock();
  private cb: ViewerCallbacks;
  private container: HTMLElement;
  private composer: EffectComposer;
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.Texture | null = null;
  private studio = createStudio();
  private keyLight!: THREE.DirectionalLight;
  private bokehPass: BokehPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private gradePass: ShaderPass | null = null;
  private photoGrade = true;
  /** 上一次重算影棚/阴影时的 explodeT，-1 表示需要重算 */
  private studioFittedAt = -1;
  /** pointermove 只置位，射线检测在帧循环里做（见 pick()） */
  private pointerDirty = false;
  /** updateLabels 的缓存键，用来跳过没变化的帧 */
  private labelCacheKey = '';
  /** 可见性变化时自增，用于打脏 labelCacheKey */
  private labelsVersion = 0;

  constructor(container: HTMLElement, labelLayer: HTMLDivElement, cb: ViewerCallbacks = {}) {
    this.container = container;
    this.labelLayer = labelLayer;
    this.cb = cb;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 阴影不每帧重画：静态场景下相机转动根本不改变阴影，而画一遍阴影等于把
    // 整个场景再渲染一次（星舰 652 个网格时这是最大的一笔固定开销）。
    // 需要时由 invalidateShadows() 置 needsUpdate，渲染一帧后自动清零。
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.localClippingEnabled = true;
    // PBR Neutral：Khronos 给产品可视化做的色调映射，高光滚降接近真实相机，
    // 不会像 ACES 那样把金属高光压成橙色
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // IBL 环境光：影棚柔光箱烘焙而成，金属/玻璃能有质感的前提
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();
    // RectAreaLight 需要一次性注入 LTC 查找表，否则柔光箱不亮
    RectAreaLightUniformsLib.init();

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.01, 8000);
    this.camera.position.set(3, 2, 5);

    // 后期管线（顺序即数据流，都在线性 HDR 域里做，最后统一色调映射）：
    //   Render → Bokeh 景深 → Bloom 高光溢出 → Output(色调映射+sRGB)
    //   → Grade 暗角/颗粒/色差 → SMAA
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // 景深：焦点始终锁在轨道中心（即主体），光圈收到很浅，
    // 只让远处背景与爆炸开的远端层轻微化开——这是"照片感"最直接的一处
    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 20,
      aperture: 0.0016,
      maxblur: 0.021,
    });
    this.composer.addPass(this.bokehPass);

    // 高光溢出：阈值拉高，只让金属/玻璃上的亮斑轻微晕开
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.16, 0.6, 0.9);
    this.composer.addPass(this.bloomPass);

    this.composer.addPass(new OutputPass());
    this.composer.addPass(this.createGradePass(w, h));

    const smaa = new SMAAPass(w, h);
    smaa.setSize(w, h);
    this.composer.addPass(smaa);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 0.9;

    this.setupEnvironment();
    this.setupLights();
    this.setupStudio();

    this.scene.add(this.subjectRoot);

    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerleave', () => {
      this.setHover(null);
    });
    addEventListener('resize', this.onResize);

    this.renderer.setAnimationLoop(() => this.tick());
  }

  // ---------- 场景基础 ----------

  /** IBL 环境：影棚柔光箱烘焙而来，是金属质感的关键 */
  private setupEnvironment() {
    this.envRT = createStudioEnvironment(this.pmrem);
    this.scene.environment = this.envRT;
    // environmentIntensity 整体调节环境光强弱（0.85：亮但不吃主光）
    (this.scene as unknown as { environmentIntensity: number }).environmentIntensity = 1.0;
    // 兜底背景：用户大幅拉远、相机穿出球罩时，看到的是同色系渐变而不是黑屏
    this.scene.background = domeEquirectTexture();
  }

  private setupLights() {
    // 半球光只留很弱一层，主控权交给 IBL + 柔光箱，避免"平光"观感
    const hemi = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.22);
    this.scene.add(hemi);

    const dist = 30;

    // 主光：与 IBL 里那块大柔光箱同方向同色，负责投影
    const key = new THREE.DirectionalLight(0xfff6ec, 2.5);
    key.position.copy(KEY_LIGHT_POS).normalize().multiplyScalar(dist);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    this.scene.add(key);
    this.keyLight = key;
    // target 加进场景图，位置变化才会被自动更新
    this.scene.add(key.target);

    // 柔光箱本体：RectAreaLight 只在标准/物理材质上生效，
    // 它让金属表面出现真实的矩形高光条——这是"影棚感"的核心
    const keyArea = new THREE.RectAreaLight(0xfff8f0, 7, 8.5, 10.5);
    keyArea.position.copy(KEY_LIGHT_POS);
    keyArea.lookAt(0, 0, 0);
    this.scene.add(keyArea);

    const fillArea = new THREE.RectAreaLight(0xe6efff, 3.0, 12, 14);
    fillArea.position.copy(FILL_LIGHT_POS);
    fillArea.lookAt(0, 0, 0);
    this.scene.add(fillArea);

    const rimArea = new THREE.RectAreaLight(0xd6e6ff, 5.5, 3, 17);
    rimArea.position.copy(RIM_LIGHT_POS);
    rimArea.lookAt(0, 0, 0);
    this.scene.add(rimArea);
  }

  /** 影棚背景组：球形渐变罩 + 地台 + 参考网格 */
  private setupStudio() {
    this.scene.add(this.studio.group);
  }

  /** 后期最后一环：暗角 + 胶片颗粒 + 镜头色差 + 轻微 S 曲线。
   *  跑在 OutputPass 之后（已是 sRGB 显示域）——颗粒和暗角本就该在显示空间加，
   *  跟相机成像链路一致。 */
  private createGradePass(w: number, h: number): ShaderPass {
    const pass = new ShaderPass({
      name: 'PhotoGrade',
      uniforms: {
        tDiffuse: { value: null as THREE.Texture | null },
        uResolution: { value: new THREE.Vector2(w, h) },
        uTime: { value: 0 },
        uVignette: { value: 0.26 },
        uGrain: { value: 0.013 },
        uChroma: { value: 0.0013 },
        uContrast: { value: 0.2 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uVignette;
        uniform float uGrain;
        uniform float uChroma;
        uniform float uContrast;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 d = uv - 0.5;
          float r2 = dot( d, d );

          // 镜头色差：越靠边缘分离越明显（真实镜片的横向像差）
          vec2 off = d * uChroma * ( 0.35 + r2 * 2.4 );
          vec3 col;
          col.r = texture2D( tDiffuse, uv + off ).r;
          col.g = texture2D( tDiffuse, uv ).g;
          col.b = texture2D( tDiffuse, uv - off ).b;

          // 轻微 S 曲线，压掉数码味的"发灰"
          vec3 curved = col * col * ( 3.0 - 2.0 * col );
          col = mix( col, curved, uContrast );

          // 暗角
          float vig = 1.0 - uVignette * smoothstep( 0.16, 0.78, r2 * 1.75 );
          col *= vig;

          // 胶片颗粒：暗部更明显，与亮度相关
          float n = fract( sin( dot( uv * uResolution + uTime, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
          float lum = dot( col, vec3( 0.299, 0.587, 0.114 ) );
          col += ( n - 0.5 ) * uGrain * ( 1.25 - 0.8 * lum );

          gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
        }
      `,
    });
    this.gradePass = pass;
    return pass;
  }

  // ---------- 主体装载 ----------

  load(subject: Subject) {
    this.subject = subject;
    this.disposeSubject();

    // 背景由影棚球罩 + 等距渐变兜底提供，不再用纯色
    this.explodeScale = subject.explodeScale ?? 1;

    subject.layers.forEach((def) => {
      const root = new THREE.Group();
      root.name = def.id;
      root.add(def.build());

      const basePos = root.position.clone();
      const dir = def.explodeDir.clone().normalize();
      const dist = dir.length() * this.explodeScale * (def.explodeScale ?? 1);
      const explodedPos = basePos.clone().add(dir.multiplyScalar(dist));

      const meshes: THREE.Mesh[] = [];
      // 材质克隆按 (层, 原始材质) 共享。两个作用：
      // 1) 星舰 652 个网格如果每个都克隆一份，就是 652 个材质实例，纯浪费；
      // 2) 所有网格用的都是"本次加载独有的克隆"，切换主体时可以安全 dispose——
      //    materials.ts 里的原始材质是全局缓存，直接拿去 dispose 会坑到别的主题。
      const matCache = new Map<THREE.Material, THREE.Material>();
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const mesh = o as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.layerId = def.id;
          meshes.push(mesh);
          const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          let cloned = matCache.get(src);
          if (!cloned) {
            cloned = src.clone();
            cloned.clippingPlanes = [];
            cloned.clipShadows = true;
            matCache.set(src, cloned);
          }
          mesh.material = cloned;
        }
      });

      // 热点标注：默认只显示圆点，悬停/选中才展开文字，避免遮挡模型
      def.hotspots?.forEach((h, hi) => {
        const el = document.createElement('div');
        el.className = 'hotspot-label';
        el.dataset.layerId = def.id;
        el.dataset.hotspot = h.id;
        el.innerHTML = `<span class="hs-dot"></span><span class="hs-text">${h.title}</span>`;
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          this.focusLayer(def.id);
          this.cb.onPick?.(def.id);
        });
        // hover 展开文字
        el.addEventListener('pointerenter', () => {
          el.classList.add('expanded');
        });
        el.addEventListener('pointerleave', () => {
          if (this.labelFocus !== `${def.id}:${h.id}`) el.classList.remove('expanded');
        });
        this.labelLayer.appendChild(el);
        this.labels.push({
          el, layerId: def.id, anchor: h.anchor.clone(), parent: root,
          sx: 0, sy: 0, onScreen: false,
        });
        void hi;
      });

      this.subjectRoot.add(root);
      this.built.push({ def, root, basePos, explodedPos, meshes });
    });

    this.hidden.clear();
    this.isolated = null;
    this.explodeT = 0;
    this.explodeTarget = 0;
    this.labelCacheKey = '';
    this.labelsVersion = 0;
    this.pointerDirty = false;

    this.camera.position.set(...subject.camera.position);
    this.controls.target.set(...subject.camera.target);
    this.controls.minDistance = 0.05;
    this.controls.maxDistance = 9000;
    this.controls.update();

    // 影棚与阴影范围按主体实际尺寸自适应。
    // 球罩要同时罩住装配态和完全爆炸态——只按装配态算的话，一拉爆炸滑块
    // 零件就穿到背景罩外面，直接露出 scene.background 的纯色。
    this.subjectRoot.updateMatrixWorld(true);
    const boxA = new THREE.Box3().setFromObject(this.subjectRoot);
    this.explodeT = 1;
    this.applyExplode();
    this.subjectRoot.updateMatrixWorld(true);
    const boxB = new THREE.Box3().setFromObject(this.subjectRoot);
    this.explodeT = 0;
    this.applyExplode();
    const box = boxA.union(boxB);

    const camDistance = this.camera.position.distanceTo(this.controls.target);
    this.studio.fit(box, camDistance);
    this.fitShadowCamera(boxA);
    this.studioFittedAt = -1;
    this.invalidateShadows();

    this.applyExplode();
    this.updateLabels();
  }

  /** 爆炸动画停下后按当前包围盒重算阴影范围（零件散开后不该丢阴影） */
  private maybeRefitStudio() {
    if (Math.abs(this.explodeTarget - this.explodeT) > 0.0005) {
      this.studioFittedAt = -1;
      return;
    }
    if (this.studioFittedAt === this.explodeT || !this.built.length) return;
    this.studioFittedAt = this.explodeT;
    this.subjectRoot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.subjectRoot);
    this.fitShadowCamera(box);
    this.invalidateShadows();
  }

  /** 阴影相机只覆盖主体（而不是整个影棚），范围越小阴影越实 */
  private fitShadowCamera(box: THREE.Box3) {
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const r = size.length() * 0.5;
    const d = Math.max(r * 1.2, 0.4);
    const cam = this.keyLight.shadow.camera;
    cam.left = -d;
    cam.right = d;
    cam.top = d;
    cam.bottom = -d;
    cam.near = 1;
    cam.far = 30 + r * 3 + 20;
    cam.updateProjectionMatrix();
    // 灯光朝向主体中心，保证爆炸后移位的主体仍在阴影范围内
    this.keyLight.target.position.copy(center);
    this.keyLight.target.updateMatrixWorld();
  }

  /**
   * 卸载当前主体。几何体和材质都要显式 dispose——
   * 四个主体来回切几次，不释放的话显存和 GPU 缓冲会一直堆着
   * （星舰 5.7 万三角面 + 652 个网格，不是小数目）。
   * 材质是跨层共享的克隆，用 Set 去重后再扔。
   */
  private disposeSubject() {
    const mats = new Set<THREE.Material>();
    this.built.forEach((b) => {
      b.root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mm = Array.isArray(m.material) ? m.material : [m.material];
          mm.forEach((x) => x && mats.add(x));
        }
        const line = o as THREE.LineSegments;
        if (line.isLineSegments) {
          line.geometry?.dispose();
          const lm = Array.isArray(line.material) ? line.material : [line.material];
          lm.forEach((x) => x && mats.add(x));
        }
      });
    });
    mats.forEach((m) => m.dispose());
    this.subjectRoot.clear();
    this.built = [];
    this.labels.forEach((l) => l.el.remove());
    this.labels = [];
  }

  // ---------- 交互控制 ----------

  setExplode(t: number) {
    this.explodeTarget = Math.max(0, Math.min(1, t));
  }

  getExplodeTarget() {
    return this.explodeTarget;
  }

  /** 阴影贴图改为手动更新后，任何会改变投影内容的操作都要调这个 */
  private invalidateShadows() {
    this.renderer.shadowMap.needsUpdate = true;
  }

  toggleLayer(layerId: string) {
    if (this.hidden.has(layerId)) this.hidden.delete(layerId);
    else this.hidden.add(layerId);
    if (this.hidden.has(layerId) && this.isolated === layerId) this.isolated = null;
    this.refreshVisibility();
    this.invalidateShadows();
  }

  isHidden(layerId: string) {
    return this.hidden.has(layerId);
  }

  isolate(layerId: string | null) {
    this.isolated = layerId;
    this.refreshVisibility();
    this.invalidateShadows();
  }

  getIsolated() {
    return this.isolated;
  }

  focusLayer(layerId: string) {
    const b = this.built.find((x) => x.def.id === layerId);
    if (!b) return;
    const box = new THREE.Box3().setFromObject(b.root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() * 0.5, 0.001);
    const dist = radius / Math.tan((this.camera.fov * Math.PI) / 360) * 2.1;
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    this.camera.position.copy(center).add(dir.multiplyScalar(dist));
    this.controls.target.copy(center);
    this.controls.update();
  }

  resetView() {
    if (!this.subject) return;
    this.camera.position.set(...this.subject.camera.position);
    this.controls.target.set(...this.subject.camera.target);
    this.controls.update();
  }

  setSection(enabled: boolean, axis: 'x' | 'y' | 'z' = 'x', position = 0) {
    this.sectionEnabled = enabled;
    const n = axis === 'x' ? new THREE.Vector3(-1, 0, 0) : axis === 'y' ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 0, -1);
    this.clipPlane.set(n, position);
    this.refreshClipping();
  }

  private refreshClipping() {
    const planes: THREE.Plane[] = this.sectionEnabled ? [this.clipPlane] : [];
    this.built.forEach((b) => {
      b.meshes.forEach((m) => {
        const mm = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material;
        mm.clippingPlanes = planes;
        mm.needsUpdate = true;
      });
    });
    // BokehPass 会用 MeshDepthMaterial 把场景再画一遍取深度，那个材质是它自己
    // 持有的，不收这里的 clippingPlanes——不手动同步的话，剖切模式下景深会把
    // 已经切掉的几何体也算进深度，焦外范围整个错掉。
    if (this.bokehPass) {
      this.bokehPass.materialDepth.clippingPlanes = planes;
      this.bokehPass.materialDepth.needsUpdate = true;
    }
    this.invalidateShadows();
  }

  toggleLabels(v: boolean) {
    this.setLabelMode(v ? 'dot' : 'none');
  }

  /**
   * 只更新"选中态发生变化"的两个层的自发光，而不是全场景遍历。
   * pointermove 触发的 hover 切换很频繁，星舰 652 个网格全遍历一遍会掉帧。
   */
  private refreshVisibility() {
    this.built.forEach((b) => {
      b.root.visible = this.isolated ? b.def.id === this.isolated : !this.hidden.has(b.def.id);
    });
    this.applyEmissive(this.hovered);
    this.applyEmissive(this.isolated);
    this.labelsVersion++;
    this.updateLabels();
  }

  /** 给某一层（及其历史高亮层）恢复/加强自发光 */
  private applyEmissive(layerId: string | null) {
    if (!layerId) return;
    const b = this.built.find((x) => x.def.id === layerId);
    if (!b) return;
    const on = this.hovered === layerId || this.isolated === layerId;
    b.meshes.forEach((m) => {
      const mm = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
      if (mm.userData.baseEmissive === undefined) {
        mm.userData.baseEmissive = mm.emissiveIntensity ?? 0;
        mm.userData.baseEmissiveHex = mm.emissive ? mm.emissive.getHex() : 0x000000;
      }
      const base = (mm.userData.baseEmissive as number) ?? 0;
      if (on && mm.emissive && base > 0) {
        mm.emissiveIntensity = base * 2.4;
        mm.emissive.setHex(0xffffff);
      } else {
        mm.emissiveIntensity = base;
        mm.emissive.setHex(mm.userData.baseEmissiveHex as number);
      }
    });
  }

  private setHover(id: string | null) {
    if (this.hovered === id) return;
    const prev = this.hovered;
    this.hovered = id;
    this.applyEmissive(prev);
    this.applyEmissive(id);
    this.cb.onHover?.(id);
  }

  // ---------- 拾取 ----------

  /**
   * pointermove 只记坐标，真正的射线检测放到帧循环里做。
   * 高精度鼠标的 pointermove 频率可以远高于显示刷新率，每次都 intersectObjects
   * 等于白算好几遍——星舰 652 个网格时这一项是交互卡顿的主因。
   */
  private onPointerMove = (ev: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointerDirty = true;
  };

  private pick() {
    if (!this.pointerDirty) return;
    this.pointerDirty = false;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.subjectRoot.children, true);
    const hit = hits.find((h) => (h.object as THREE.Mesh).userData.layerId);
    this.setHover(hit ? ((hit.object as THREE.Mesh).userData.layerId as string) : null);
    this.renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  }

  private onPointerDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.subjectRoot.children, true);
    const hit = hits.find((h) => (h.object as THREE.Mesh).userData.layerId);
    this.cb.onPick?.(hit ? ((hit.object as THREE.Mesh).userData.layerId as string) : null);
  };

  // ---------- 帧循环 ----------

  private applyExplode() {
    this.built.forEach((b) => {
      b.root.position.lerpVectors(b.basePos, b.explodedPos, this.explodeT);
    });
  }

  /**
   * 标注锚点每帧都重算 + 写 DOM transform，会持续触发 layout。
   * 相机没动、爆炸没动、可见性没变时就整个跳过——静止观察时这是纯白工。
   */
  private updateLabels() {
    if (!this.subject) return;
    this.camera.updateMatrixWorld();
    const e = this.camera.matrixWorld.elements;
    const key =
      `${e[0].toFixed(4)},${e[5].toFixed(4)},${e[10].toFixed(4)},` +
      `${e[12].toFixed(3)},${e[13].toFixed(3)},${e[14].toFixed(3)}|` +
      `${this.explodeT.toFixed(3)}|${this.labels.length}|${this.labelsVersion}`;
    if (key === this.labelCacheKey) return;
    this.labelCacheKey = key;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    const v = new THREE.Vector3();

    // 第一遍：算屏幕坐标 + 可见性
    for (const l of this.labels) {
      if (!l.el.isConnected) { l.onScreen = false; continue; }
      if (!l.parent.visible) {
        l.el.style.display = 'none';
        l.onScreen = false;
        continue;
      }
      v.copy(l.anchor);
      l.parent.localToWorld(v);
      const world = v.clone();
      v.project(this.camera);
      const behind = world.sub(this.camera.position).dot(camDir) <= 0;
      if (behind || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) {
        l.el.style.display = 'none';
        l.onScreen = false;
        continue;
      }
      l.sx = (v.x * 0.5 + 0.5) * w;
      l.sy = (-v.y * 0.5 + 0.5) * h;
      l.onScreen = true;
      l.el.style.display = '';
      l.el.style.transform = `translate(-50%,-50%) translate(${l.sx}px, ${l.sy}px)`;
    }

    // 第二遍：去重 —— 同层多个热点若屏幕距离过近，隐藏次要的，避免文字糊成一片
    const MIN_DIST = 34;
    const shown: { x: number; y: number }[] = [];
    for (const l of this.labels) {
      if (!l.onScreen) continue;
      let clash = false;
      for (const s of shown) {
        if (Math.abs(s.x - l.sx) < MIN_DIST && Math.abs(s.y - l.sy) < MIN_DIST) {
          clash = true;
          break;
        }
      }
      if (clash) {
        // 激活层和正在 hover 的优先显示
        const isFocus = this.labelFocus?.startsWith(l.layerId + ':');
        if (isFocus) { /* 焦点不隐藏 */ } else {
          l.el.classList.add('occluded');
          continue;
        }
      }
      shown.push({ x: l.sx, y: l.sy });
      l.el.classList.remove('occluded');
    }

    // 应用标注模式
    if (this.labelMode === 'none') {
      this.labelLayer.style.display = 'none';
    } else {
      this.labelLayer.style.display = '';
      const showText = this.labelMode === 'full';
      this.labels.forEach((l) => {
        if (!l.el.isConnected) return;
        const isFocus = this.labelFocus?.startsWith(l.layerId + ':');
        l.el.classList.toggle('text-on', showText || !!isFocus);
      });
    }
  }

  /** 设置标注模式：dot=只圆点（默认）/ full=展开全部文字 / none=隐藏 */
  setLabelMode(mode: 'dot' | 'full' | 'none') {
    this.labelMode = mode;
    this.labelVisible = mode !== 'none';
    // 模式变化只影响 DOM 显隐，不打脏缓存键的话要等下一次相机移动才生效
    this.labelsVersion++;
    this.updateLabels();
  }

  getLabelMode() {
    return this.labelMode;
  }

  /** 设置当前展开文字的热点（`layerId:hotspotId`） */
  setLabelFocus(key: string | null) {
    this.labelFocus = key;
    this.labels.forEach((l) => {
      if (!l.el.isConnected) return;
      if (key && l.layerId === key.split(':')[0]) l.el.classList.add('expanded');
      else if (!l.el.matches(':hover')) l.el.classList.remove('expanded');
    });
  }

  private tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    let moved = false;
    if (Math.abs(this.explodeTarget - this.explodeT) > 0.0005) {
      const k = 1 - Math.pow(0.0015, dt);
      this.explodeT += (this.explodeTarget - this.explodeT) * k;
      this.applyExplode();
      moved = true;
    }
    // 阴影手动更新：几何在动（爆炸动画中）才需要重画阴影贴图
    if (moved) this.renderer.shadowMap.needsUpdate = true;
    this.controls.update();
    this.pick();
    this.maybeRefitStudio();
    // 景深焦点始终跟着轨道中心走，缩放/旋转时主体保持清晰
    if (this.bokehPass) {
      (this.bokehPass.uniforms as Record<string, { value: number }>)['focus'].value =
        this.camera.position.distanceTo(this.controls.target);
    }
    if (this.gradePass) {
      this.gradePass.uniforms['uTime'].value = (this.gradePass.uniforms['uTime'].value + dt * 1.0) % 100;
    }
    this.updateLabels();
    this.composer.render();
  }

  /**
   * 摄影棚影调开关。
   *
   * 开 = 景深 + 高光溢出 + 暗角/颗粒/色差，照片观感。
   * 关 = 只留 Render + Output + SMAA。这不只是"关滤镜"——BokehPass 会用
   * MeshDepthMaterial 把整个场景再渲染一遍来取深度，星舰 652 个网格时这一遍
   * 就是双倍绘制调用。关掉它是真实的性能回退，不是换个样子。
   */
  setPhotoGrade(on: boolean) {
    this.photoGrade = on;
    if (this.bokehPass) this.bokehPass.enabled = on;
    if (this.bloomPass) this.bloomPass.enabled = on;
    if (this.gradePass) this.gradePass.enabled = on;
  }

  getPhotoGrade() {
    return this.photoGrade;
  }

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    if (this.gradePass) this.gradePass.uniforms['uResolution'].value.set(w, h);
  };

  /**
   * 导出当前画面为 PNG data URL。
   * scale>1 时临时把渲染分辨率放大再截——最终成品是一张更锐利的图，
   * 截完立刻还原，不影响交互时的帧率。
   */
  screenshot(scale = 2): string {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const base = Math.min(devicePixelRatio, 2);
    const oldPR = this.renderer.getPixelRatio();
    const pr = Math.min(base * scale, 4);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(pr);
    this.composer.render();
    const url = this.renderer.domElement.toDataURL('image/png');
    this.renderer.setPixelRatio(oldPR);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(oldPR);
    return url;
  }
}
