import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { softboxTexture, coveTexture, contactShadowTexture, envRoomTexture } from './textures';

/**
 * 影棚环境与背景。
 *
 * 分两部分：
 *
 * 1. `createStudioEnvironment()` —— 搭一个"渐变房间 + 柔光箱阵列"的小场景，
 *    用 PMREM 烘焙成 IBL 环境贴图。产品摄影的质感来自大面积柔光箱在
 *    金属与玻璃上投出的**矩形柔和高光条**；而渐变房间（顶亮底暗）让金属
 *    表面获得一个真实的"顶光"反射，比纯色房间更像真实影棚。
 *
 * 2. `createStudio()` —— 无缝影棚罩（infinity cove：地板 + 圆角转角 + 背墙
 *    一体成型，无可见接缝）+ 一块软接触阴影，组成一个组。整体按主体尺寸
 *    缩放/定位，让主体像被"摆"在专业摄影棚里。
 */

interface Softbox {
  /** 面板尺寸（场景单位） */
  w: number;
  h: number;
  /** 面板中心 */
  pos: [number, number, number];
  /** 线性 RGB 染色（1,1,1 为中性白） */
  tint: [number, number, number];
  /** HDR 增益。>1 才能让金属出现明亮高光——PMREM 期间色调映射是关闭的，
   *  半浮点目标能留住 >1 的亮度，所以这里可以安全地给到 2 以上。 */
  gain: number;
}

/**
 * 柔光箱阵列。位置即灯光方向——场景里的 RectAreaLight 与投影平行光
 * 都按同一组坐标摆放，保证"看到的反射"和"投出的阴影"是同一盏灯。
 */
const SOFTBOXES: Softbox[] = [
  // 主光：左前上方，大而暖，负责主体绝大部分造型
  { w: 8.5, h: 10.5, pos: [-9.5, 7.5, 11], tint: [1.0, 0.985, 0.95], gain: 2.6 },
  // 补光：右侧更宽更柔，冷白，把暗部细节捞回来但不抢主光
  { w: 12, h: 14, pos: [12.5, 3.5, 6.5], tint: [0.9, 0.95, 1.0], gain: 0.9 },
  // 轮廓光：背后竖条，冷蓝，把主体从背景里"切"出来
  { w: 3, h: 17, pos: [1.5, 6.5, -14], tint: [0.82, 0.9, 1.0], gain: 2.1 },
  // 顶光：长条顶灯，给水平棱边一道细高光（手机/机身的"亮边"来源）
  { w: 4, h: 19, pos: [-2.5, 12.5, 1.5], tint: [1, 1, 1], gain: 1.25 },
  // 地面反弹：下方大面板，模拟影棚白色地台的反光，避免阴影面死黑
  { w: 30, h: 30, pos: [0, -9, 0], tint: [1.0, 0.97, 0.92], gain: 0.55 },
  // 前置反光板：左前下方。竖立物体的正面玻璃只会反射"水平线以下"的景物
  // （入射角等于反射角，相机在上方时反射光就指向下），所以正面要亮，
  // 必须在下面放一块板——这是影棚给手机/手表拍正面时的标准做法。
  // 位置要卡在正面法线的镜像方向上，否则玻璃上什么都不会出现。
  { w: 16, h: 11, pos: [-12, -6, 13], tint: [1.0, 0.99, 0.97], gain: 1.6 },
  // 侧踢光：右侧细条，给机身侧棱补一道轮廓，避免右侧发闷
  { w: 2.5, h: 14, pos: [13, 5, -4], tint: [0.95, 0.97, 1.0], gain: 1.4 },
];

/** 主光在世界坐标中的位置（与 SOFTBOXES[0] 同方向） */
export const KEY_LIGHT_POS = new THREE.Vector3(-9.5, 7.5, 11);
export const FILL_LIGHT_POS = new THREE.Vector3(12.5, 3.5, 6.5);
export const RIM_LIGHT_POS = new THREE.Vector3(1.5, 6.5, -14);

/**
 * 带径向淡出的反光地台着色器。
 *
 * 标准 Reflector 是一块"硬边镜子"——边缘直接截断，放在产品下面会露出一圈
 * 突兀的圆形亮边，看着像廉价 demo。这里在顶点里额外传一份平面 UV（vPlaneUv），
 * 片元里按到圆心的距离做 smoothstep 淡出：正中心保留最强反射，边缘渐隐到 0，
 * 无缝融进影棚罩地面。
 *
 * 注意：刻意**不**包含 tonemapping/colorspace 的 fragment include——
 * 整个画面最后由 EffectComposer 的 OutputPass 统一做一次色调映射，
 * 反射贴图里只存线性 HDR 颜色，否则会被二次色调映射压暗。
 */
const REFLECTOR_FADE_SHADER = {
  name: 'ReflectorFade',
  uniforms: {
    color: { value: null as THREE.Color | null },
    tDiffuse: { value: null as THREE.Texture | null },
    textureMatrix: { value: null as THREE.Matrix4 | null },
    uFade: { value: 0.55 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vPlaneUv;
    #include <common>
    void main() {
      vUv = textureMatrix * vec4( position, 1.0 );
      vPlaneUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    uniform float uFade;
    varying vec4 vUv;
    varying vec2 vPlaneUv;
    float blendOverlay( float b, float l ) {
      return b < 0.5 ? ( 2.0 * b * l ) : ( 1.0 - 2.0 * ( 1.0 - b ) * ( 1.0 - l ) );
    }
    vec3 blendOverlay( vec3 b, vec3 l ) {
      return vec3( blendOverlay( b.r, l.r ), blendOverlay( b.g, l.g ), blendOverlay( b.b, l.b ) );
    }
    void main() {
      vec4 base = texture2DProj( tDiffuse, vUv );
      vec3 col = blendOverlay( base.rgb, color );
      // 正中心 d=0 反射最强，边缘 d=1 渐隐
      float d = length( vPlaneUv - 0.5 ) * 2.0;
      float fade = 1.0 - smoothstep( 0.42, 0.96, d );
      gl_FragColor = vec4( col, fade * uFade );
    }
  `,
};

/**
 * 烘焙影棚 IBL。返回环境贴图；调用方负责 `scene.environment = tex`。
 */
export function createStudioEnvironment(pmrem: THREE.PMREMGenerator): THREE.Texture {
  const scene = new THREE.Scene();

  // 房间：顶亮底暗的渐变球壳。尺寸要足够大，装下所有柔光箱且不穿墙。
  // 它给金属一个真实的"顶光"反射，是 IBL 里最容易被忽略、却最提真实感的一层。
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(40, 48, 32),
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: envRoomTexture(),
    })
  );
  scene.add(room);

  const tex = softboxTexture();
  const origin = new THREE.Vector3(0, 0, 0);
  for (const s of SOFTBOXES) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(s.w, s.h),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: new THREE.Color().setRGB(s.tint[0] * s.gain, s.tint[1] * s.gain, s.tint[2] * s.gain),
      })
    );
    m.position.set(s.pos[0], s.pos[1], s.pos[2]);
    m.lookAt(origin);
    scene.add(m);
  }

  // sigma 0.02：几乎不额外模糊，保留柔光箱的矩形轮廓
  const rt = pmrem.fromScene(scene, 0.02, 0.1, 200);

  room.geometry.dispose();
  (room.material as THREE.Material).dispose();
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o !== room) {
      (o as THREE.Mesh).geometry.dispose();
      ((o as THREE.Mesh).material as THREE.Material).dispose();
    }
  });

  return rt.texture;
}

export interface Studio {
  group: THREE.Group;
  /** 按主体包围盒定位 + 缩放：地台落在主体最低点，罩半径包住整个拍摄范围 */
  fit(box: THREE.Box3, camDistance: number): void;
  dispose(): void;
}

/**
 * 无缝影棚罩（infinity cove）几何。
 *
 * 剖面（y-z 平面）：地板（前后延伸）→ 四分之一圆弧转角 → 竖直背墙，一体成型。
 * 用一个平滑渐变贴图让转角"消失"，肉眼看不到接缝。UV 的 v 沿剖面从地板远端
 * 走到背墙顶端，正好对应渐变方向。
 */
function buildCove(): THREE.Mesh {
  const Ff = 1.6; // 地板向相机方向（+z）延伸
  const Fb = 2.4; // 地板向背墙方向（-z）延伸
  const R = 0.9; // 转角半径
  const W = 3.4; // 背墙高度
  const L = 4.0; // 宽度（沿 x）
  const A = 28; // 转角细分

  // 剖面采样点 [y, z]
  const prof: [number, number][] = [];
  const floorSteps = 6;
  for (let i = 0; i <= floorSteps; i++) {
    const t = i / floorSteps;
    prof.push([0, Ff + (-Fb - Ff) * t]); // 从 +Ff 到 -Fb
  }
  for (let k = 1; k <= A; k++) {
    const th = (k / A) * (Math.PI / 2);
    prof.push([R * Math.sin(th), -R + R * Math.cos(th)]);
  }
  const wallSteps = 6;
  for (let i = 1; i <= wallSteps; i++) {
    prof.push([R + W * (i / wallSteps), -R]);
  }

  const rows = prof.length;
  const cols = 56;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < rows; i++) {
    const [y, z] = prof[i];
    for (let j = 0; j < cols; j++) {
      const x = -L / 2 + L * (j / (cols - 1));
      positions.push(x, y, z);
      uvs.push(j / (cols - 1), i / (rows - 1));
    }
  }
  // 缠绕方向保证法线指向罩内（朝向主体/相机）：地板法线 +y，背墙法线 +z
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const m = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      map: coveTexture(),
      color: 0xffffff,
      side: THREE.FrontSide,
      toneMapped: true,
    })
  );
  m.name = 'cove';
  return m;
}

/**
 * 影棚背景组。内部几何都按单位尺寸建模，靠 group.scale 缩放到目标尺寸，
 * 这样四个尺寸差了一两个数量级的主体（芯片 / 手机 / 无人机 / 火箭）能共用一套。
 */
export function createStudio(): Studio {
  const group = new THREE.Group();
  group.name = 'studio';

  const cove = buildCove();
  group.add(cove);

  // 反光地台：一块带径向淡出的镜像盘，让主体在磨砂白地面上投出一道
  // 柔和的产品倒影——这是"产品摄影"最标志性的观感之一。
  // 圆形盘半径=1，靠 group.scale 缩放到主体脚印；位置略高于罩面避免 z-fighting。
  const reflector = new Reflector(new THREE.CircleGeometry(1, 80), {
    color: 0x7f7f7f,
    textureWidth: 1024,
    textureHeight: 1024,
    clipBias: 0.003,
    shader: REFLECTOR_FADE_SHADER,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.y = 0.004;
  reflector.renderOrder = 1;
  reflector.name = 'reflector-floor';
  const refMat = reflector.material as THREE.ShaderMaterial;
  refMat.transparent = true;
  refMat.depthWrite = false;
  group.add(reflector);

  // 接触阴影：地面上一块软径向暗斑，把主体"按"在地面上（柔和 AO 接地感）。
  // 用 MeshBasic（不吃光）保证阴影浓淡稳定，blend 在罩面之上。
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: contactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  shadow.renderOrder = 2;
  shadow.name = 'contact-shadow';
  group.add(shadow);

  return {
    group,
    fit(box: THREE.Box3, camDistance: number) {
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const extent = Math.max(size.x, size.y, size.z);
      // 半径要同时满足：包住主体、包住相机到主体的距离（否则相机会穿到罩外）
      const r = Math.max(extent * 3.2, camDistance * 1.7, 14);
      group.position.set(center.x, box.min.y - 0.004, center.z);
      group.scale.setScalar(r);

      // 反光盘：半径略大于主体脚印，倒影才不会在边缘被切平
      const footprint = Math.max(size.x, size.z) * 0.5;
      const rr = (footprint * 2.0) / r;
      reflector.scale.set(rr, rr, rr);
      reflector.position.set(0, 0.004, 0);

      // 接触阴影大小随主体脚印（×1.9，略大于主体以获得自然衰减）
      const s = (footprint * 1.9) / r;
      shadow.scale.set(s, s, s);
      shadow.position.set(0, 0.006, 0);
    },
    dispose() {
      (cove.geometry as THREE.BufferGeometry).dispose();
      (cove.material as THREE.Material).dispose();
      reflector.dispose();
      (shadow.geometry as THREE.BufferGeometry).dispose();
      (shadow.material as THREE.Material).dispose();
    },
  };
}
