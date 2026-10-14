import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, steelMaterial, glassMaterial, panelGlassMaterial, pcbMaterial, dieMaterial, metalMaterial, carbonMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * iPhone 18 Pro —— 按公开规格与行业拆解惯例做参数化分层建模
 * 场景单位：1 = 10 mm（机身厚度 8.8mm → 0.88，高 149.6mm → 14.96，宽 71.5mm → 7.15）
 * 整机比例严格按 真机尺寸，避免"看起来差不多但比例失真"。
 */
const MM = 0.1; // 1mm = 0.1 单位 => 机身 14.96 x 7.15 x 0.88

const W = 71.5 * MM;   // 宽
const H = 149.6 * MM;  // 高
const T = 8.8 * MM;    // 厚（Pro 版本）

function roundedBox(w: number, h: number, d: number, r: number, seg = 4): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2 + r;
  const y = -h / 2 + r;
  const rr = Math.min(r, w / 2, h / 2);
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, y);
  shape.lineTo(w / 2, h / 2 - rr);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
  shape.lineTo(-w / 2 + rr, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
  shape.lineTo(-w / 2, -h / 2 + rr);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const bevel = Math.min(rr * 0.9, d / 2 - 0.005);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(d - bevel * 2, 0.01),
    bevelEnabled: bevel > 0.01,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: seg,
    curveSegments: 12,
  });
  geo.center();
  return geo;
}

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function iPhone18Pro(): Subject {
  const layers: Layer[] = [];

  // ============ 1. Ceramic Shield 前盖（陶瓷盾） ============
  layers.push({
    id: 'cover',
    name: '陶瓷盾前盖',
    group: '外观',
    explodeDir: U(0, 0, 1.6),
    build() {
      const g = new THREE.Group();
      const geo = roundedBox(W, H, 0.13, 0.75, 5);
      const glass = panelGlassMaterial(0x0d1218, 0.93);
      const m = new THREE.Mesh(geo, glass);
      g.add(m);

      // 灵动岛（Dynamic Island 缩小 35%：厚度 20.7mm → 13.5mm）
      const di = new THREE.Mesh(
        roundedBox(1.25, 0.42, 0.1, 0.2, 4),
        mat({ color: 0x0a0d10, metalness: 0.1, roughness: 0.25 })
      );
      di.position.set(0, H / 2 - 1.15, 0.09);
      g.add(di);

      // 前摄开孔
      const cam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.1, 24),
        mat({ color: 0x11161c, metalness: 0.5, roughness: 0.15 })
      );
      cam.rotation.x = Math.PI / 2;
      cam.position.set(0, H / 2 - 1.15, 0.1);
      g.add(cam);

      addEdges(g, 0x94a3b8, 0.12);
      g.position.z = 0.36;
      return g;
    },
    hotspots: [
      {
        id: 'ceramic',
        title: '陶瓷盾（Ceramic Shield 2）',
        anchor: U(-W / 2 + 1.1, H / 2 - 2.6, 0.12),
        body: `苹果第二代陶瓷盾前玻璃。苹果宣称抗跌落能力比上一代提升一倍以上——关键在于**晶体结构内的离子交换**，摔落后表面产生压应力层，阻止裂纹扩展。

厚度约 0.55mm，边缘与不锈钢中框通过胶层贴合。前摄开孔与灵动岛区域做了一体化成型，避免二次贴合气泡。`,
        stats: [
          { label: '厚度', value: '≈0.55 mm' },
          { label: '抗跌落', value: '较上代 +100%（官方）' },
          { label: '表面处理', value: '离子交换增强' },
        ],
      },
      {
        id: 'island',
        title: '缩小 35% 的灵动岛',
        anchor: U(1.0, H / 2 - 1.15, 0.12),
        body: `把 Face ID 泛光照明器（flood illuminator）移到屏下之后，动态岛得以横向压缩。

**厚度从 20.7mm 缩到 13.5mm**，面积减少约 35%。注意这里的关键：屏下 Face ID 本身**还没成熟**，真正做到"整块屏幕下"要等 iPhone 19 世代。V3/iPhone 18 这一代是把泛光器藏进屏内，换来更干净的前面。`,
        stats: [
          { label: '灵动岛厚度', value: '20.7 → 13.5 mm' },
          { label: '面积缩减', value: '≈35%' },
          { label: '屏下 Face ID', value: '本代未实现' },
        ],
      },
    ],
  });

  // ============ 2. LTPO+ OLED 显示面板 ============
  layers.push({
    id: 'display',
    name: 'LTPO+ OLED 面板',
    group: '显示',
    explodeDir: U(0, 0, 1.0),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const panel = new THREE.Mesh(
        roundedBox(W - 0.06, H - 0.06, 0.075, 0.72, 4),
        mat({ color: 0x0b0f14, metalness: 0.3, roughness: 0.18 })
      );
      g.add(panel);

      // 像素发光层示意：sub-pixel 网格纹理（非浏览器环境降级为纯色）
      const tex = createSubpixelTexture();
      if (tex) {
        const emissiveLayer = new THREE.Mesh(
          new THREE.PlaneGeometry(W - 0.24, H - 0.24),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })
        );
        emissiveLayer.position.z = 0.045;
        g.add(emissiveLayer);
      }

      // 触控层（单独标注区域）
      const touch = new THREE.Mesh(
        new THREE.PlaneGeometry(W - 0.2, H - 0.2),
        mat({ color: 0x1a2c3a, metalness: 0.1, roughness: 0.6, opacity: 0.35 })
      );
      touch.position.z = 0.055;
      g.add(touch);

      addEdges(g, 0x64748b, 0.12);
      g.position.z = 0.24;
      return g;
    },
    hotspots: [
      {
        id: 'ltpoplus',
        title: 'LTPO+ 1–120Hz',
        anchor: U(W / 2 - 0.9, 0, 0.1),
        body: `LTPO（Low-Temperature Polycrystalline Oxide）背板本身不算新东西，但 **"+" 这个后缀有实质变化**：它把刷新率调节粒度做得更细，在 1Hz 到 120Hz 之间做更平滑的档位切换。

Pro Max 配这块屏 + A20 Pro 的能效提升，Apple 口径的混合使用续航可能超过 40 小时，超过 Galaxy S26 Ultra。这是**续航提升里最容易被低估的一环**——很多人以为电池变大是全部，实际屏幕占日常功耗的相当比例。

6.3 英寸（Pro）/ 6.9 英寸（Pro Max）。`,
        stats: [
          { label: 'Pro 尺寸', value: '6.3 英寸' },
          { label: 'Pro Max 尺寸', value: '6.9 英寸' },
          { label: '刷新率', value: '1–120Hz LTPO+' },
          { label: '技术', value: 'OLED，LTPO 背板' },
        ],
      },
    ],
  });

  // ============ 3. 摄像头凸台（三摄模组） ============
  layers.push({
    id: 'camera',
    name: '三摄模组 + 摄像头凸台',
    group: '光学',
    explodeDir: U(-1.0, 0.55, 0.55),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 凸台底座
      const plateau = new THREE.Mesh(
        roundedBox(3.9, 3.9, 0.34, 0.55, 4),
        mat({ color: 0x6e6a66, metalness: 0.8, roughness: 0.32 })
      );
      plateau.position.set(-W / 2 + 2.2, H / 2 - 2.2, -0.18);
      g.add(plateau);

      const lensDefs: [number, number, number, string][] = [
        [-0.72, 0.72, 0.62, '主摄'],
        [0.72, 0.72, 0.52, '超广角'],
        [-0.72, -0.72, 0.46, '长焦'],
      ];

      lensDefs.forEach(([lx, ly, lr, name], i) => {
        const lens = new THREE.Group();

        // 镜筒
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(lr, lr * 1.06, 0.5, 40),
          metalMaterial(0x8a8f96, 0.24)
        );
        barrel.rotation.x = Math.PI / 2;
        lens.add(barrel);

        // 镜片（多层玻璃）
        for (let k = 0; k < 3; k++) {
          const lensGlass = new THREE.Mesh(
            new THREE.CylinderGeometry(lr * (0.82 - k * 0.14), lr * (0.82 - k * 0.14), 0.05, 40),
            glassMaterial(k === 0 ? 0x7f9db8 : 0x5f7f9a, 0.5)
          );
          lensGlass.rotation.x = Math.PI / 2;
          lensGlass.position.z = 0.12 + k * 0.1;
          lens.add(lensGlass);
        }

        // 可变光圈：iFixit 拆解确认是 6 片聚合物叶片，电磁驱动，独立于 OIS
        // 叶片薄如发丝，靠销钉与槽位滑动，叠出 f/1.48–f/4.0 四档
        const irisGroup = new THREE.Group();
        const BLADES = 6;
        const bladeShape = new THREE.Shape();
        // 单片叶片形状：一端为枢轴，一端收成弧形刃口
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(lr * 0.5, 0.02);
        bladeShape.lineTo(lr * 0.46, lr * 0.2);
        bladeShape.quadraticCurveTo(lr * 0.2, lr * 0.3, 0.02, lr * 0.26);
        bladeShape.lineTo(0, 0);
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
          depth: 0.006, bevelEnabled: false, curveSegments: 8,
        });

        for (let b = 0; b < BLADES; b++) {
          const a = (b / BLADES) * Math.PI * 2;
          const blade = new THREE.Mesh(
            bladeGeo,
            mat({ color: 0x232326, metalness: 0.35, roughness: 0.42, side: THREE.DoubleSide })
          );
          // 每片绕枢轴旋转并向内平移，叠出六边形光孔
          blade.position.set(Math.cos(a) * lr * 0.36, Math.sin(a) * lr * 0.36, 0.22 + b * 0.004);
          blade.rotation.z = a + Math.PI / 2;
          blade.scale.setScalar(0.92);
          irisGroup.add(blade);
        }
        // 光圈框
        const irisRing = new THREE.Mesh(
          new THREE.TorusGeometry(lr * 0.44, 0.018, 8, 32),
          mat({ color: 0x141416, metalness: 0.7, roughness: 0.3 })
        );
        irisRing.position.z = 0.218;
        irisGroup.add(irisRing);
        lens.add(irisGroup);

        // 电磁驱动线圈（每叶片一组）
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(lr * 0.48, 0.014, 6, 24),
          metalMaterial(0xc8a050, 0.34)
        );
        coil.position.z = 0.2;
        lens.add(coil);

        // CMOS 传感器（可变光圈主摄）
        if (i === 0) {
          const sensor = new THREE.Mesh(
            new THREE.BoxGeometry(lr * 0.8, lr * 0.8, 0.03),
            dieMaterial(0x1a3f6b, 0x66a8ff)
          );
          sensor.position.z = -0.1;
          lens.add(sensor);
        }

        lens.position.set(-W / 2 + 2.2 + lx, H / 2 - 2.2 + ly, -0.05);
        g.add(lens);
      });

      addEdges(g, 0x94a3b8, 0.12);
      g.position.z = 0.0;
      return g;
    },
    hotspots: [
      {
        id: 'varaperture',
        title: '可变光圈 · 6 叶片（iFixit 实测）',
        anchor: U(-W / 2 + 1.48, H / 2 - 1.48, 0.3),
        body: `这是 <b>iFixit 2026 年 9 月 20 日拆解确认的核心发现</b>，也是苹果第一部带机械可变光圈的 iPhone。

<b>结构</b>：6 片聚合物复合叶片，每片<b>薄如人发</b>、刃口处不到 1 毫米，靠<b>电磁铁驱动</b>，通过销钉与槽位滑动改变开孔大小。驱动<b>独立于光学防抖（OIS）系统</b>。

<b>档位</b>：f/1.48、f/1.8、f/2.8、f/4.0 四档。相对上一代固定的 f/1.48，最大光圈到 f/4.0 进光量差约 <b>7.3 倍</b>。

<b>但 iFixit 的评价很直接</b>：维修性灾难。他们加热并撬开镜头堆栈时，<b>有一片叶子飞过了整个房间</b>。叶片在销钉上几乎没有公差配合，胶又是黏性的——光圈一旦卡死，<b>零件级维修不可能，只能整个主摄模组更换</b>（iPhone 17 Pro 该模组售价 $249）。

<b>摄影师视角的保留意见</b>：iFixit 认为在 1/1.3 英寸级传感器 + 6.8mm 焦距上，这四档光圈给的是真实可控的曝光，但<b>给不了同光圈下全画幅那种背景虚化</b>——他们的实拍显示 f/1.48 下背景依然清晰可读。

Pro Max 有望独占<b>三星三层堆叠式图像传感器</b>（像素层下再叠读出电路）。`,
        stats: [
          { label: '叶片数', value: '6 片（聚合物复合）' },
          { label: '档位', value: 'f/1.48 / 1.8 / 2.8 / 4.0' },
          { label: '驱动', value: '电磁铁，独立于 OIS' },
          { label: '叶片厚度', value: '刃口 <1mm（薄如发丝）' },
          { label: '维修性', value: '零件级不可修，整模组更换' },
          { label: '前代模组价', value: '$249（17 Pro）' },
        ],
      },
    ],
  });

  // ============ 4. A20 Pro 主板（2nm + WMCM） ============
  layers.push({
    id: 'board',
    name: 'A20 Pro 主板（2nm WMCM）',
    group: '计算',
    explodeDir: U(0.75, -0.9, 0.3),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const board = new THREE.Mesh(
        new RoundedBoxGeometry(4.4, 6.4, 0.11, 2, 0.05),
        pcbMaterial(0xffffff)
      );
      board.position.set(-0.15, 0.15, 0);
      g.add(board);

      // A20 Pro — WMCM 晶圆级多芯片模块
      // CPU / GPU / NPU 与 RAM 同晶圆集成
      const wmcm = new THREE.Mesh(
        roundedBox(1.45, 1.45, 0.1, 0.05, 2),
        dieMaterial(0x134a44, 0x6ff0d4)
      );
      wmcm.position.set(-0.5, 1.55, 0.11);
      g.add(wmcm);

      // die 上的功能分区（视觉示意）
      const zones: [number, number, number, number, number][] = [
        [-0.3, 0.3, 0.8, 0.62, 0x2a7f6e],
        [0.35, 0.3, 0.62, 0.62, 0x2a6f8f],
        [-0.3, -0.3, 0.8, 0.58, 0x6f5f2a],
        [0.35, -0.3, 0.62, 0.58, 0x4a2f6f],
      ];
      zones.forEach(([zx, zy, zw, zh, c]) => {
        const z = new THREE.Mesh(
          new THREE.BoxGeometry(zw, zh, 0.012),
          mat({ color: c, metalness: 0.7, roughness: 0.35, emissive: c, emissiveIntensity: 0.22 })
        );
        z.position.set(-0.5 + zx, 1.55 + zy, 0.165);
        g.add(z);
      });

      // NAND 存储
      const nand = new THREE.Mesh(
        roundedBox(0.9, 1.15, 0.07, 0.04, 2),
        dieMaterial(0x2a2a30, 0x9aa0a8)
      );
      nand.position.set(1.35, 1.7, 0.09);
      g.add(nand);

      // 被动元件群
      for (let i = 0; i < 46; i++) {
        const c = new THREE.Mesh(
          new THREE.BoxGeometry(0.08 + Math.random() * 0.1, 0.05 + Math.random() * 0.06, 0.035),
          mat({ color: [0x1a1a1a, 0xb8a06a, 0x8a8f96][i % 3], metalness: 0.5, roughness: 0.5 })
        );
        c.position.set(
          -2.05 + Math.random() * 4.0,
          -2.9 + Math.random() * 5.6,
          0.075
        );
        g.add(c);
      }

      // 屏蔽罩（部分区域）
      const shield = new THREE.Mesh(
        roundedBox(1.3, 1.05, 0.09, 0.06, 2),
        metalMaterial(0x9aa1a8, 0.34)
      );
      shield.position.set(1.3, -0.55, 0.1);
      g.add(shield);

      // B2B 连接器（排线接口）
      const conn = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 2.6, 0.06),
        mat({ color: 0x2c2f33, metalness: 0.4, roughness: 0.6 })
      );
      conn.position.set(2.05, 0.1, 0.09);
      g.add(conn);

      addEdges(g, 0x6ee7b7, 0.12);
      g.position.z = 0.02;
      return g;
    },
    hotspots: [
      {
        id: 'a20pro',
        title: 'A20 Pro · 2nm · 侧边封装（iFixit 实测）',
        anchor: U(-0.65, 2.35, 0.2),
        body: `苹果首款 2nm 芯片，台积电代工，<b>WMCM（晶圆级多芯片模块）</b>封装。相对 A19：性能约 +18%，能效比优化约 30%。

<b>iFixit 拆解最重要的发现：封装方式变了</b>。上一代是把内存<b>堆叠在</b>发热硅片<b>上方</b>，这一代 A20 Pro 改为把 die 与内存<b>并排放置（side-by-side）</b>——记忆体不再位于芯片的直接热路径上。

<b>这个改动是整个散热设计成立的前提</b>：内存移开热路径后，处理器就能<b>直接贴住均热板（vapor chamber）</b>。iFixit 观察到，导热材料把 SoC 压在均热板上，而这块均热板的面积<b>覆盖了机身相当大一部分</b>——苹果称表面积是 17 Pro 方案的<b>约 3 倍</b>。

<b>但这个选择有代价</b>：NAND 存储现在<b>埋在双层主板夹层里</b>。任何涉及存储级或主板深层的维修，都得先分离夹层——更多热量、更多工时、更多风险。而且<b>数据是加密到那颗 NAND 上的</b>，数据恢复也变难。

同样值得注意的是主板的整体重排：<b>A20 Pro 现在在双层主板的外层</b>。

WMCM 的收益是真实的：把 RAM 集成到与 CPU/GPU/NPU 同一片晶圆，省下独立 RAM 封装层的厚度和主板面积——这正是"厚度几乎没变但电池能做大"的空间来源。`,
        stats: [
          { label: '工艺', value: '台积电 2nm（N2）' },
          { label: '性能 / 能效', value: '+18% / +30%（vs A19）' },
          { label: '封装', value: 'WMCM 晶圆级多芯片' },
          { label: '关键变化', value: 'die 与内存并排（非堆叠）' },
          { label: '均热板', value: '表面积约 3×（vs 17 Pro）' },
          { label: '代价', value: 'NAND 埋入主板夹层，数据恢复更难' },
          { label: 'RAM', value: '12GB LPDDR5（同晶圆）' },
        ],
      },
    ],
  });

  // ============ 5. 电池 ============
  layers.push({
    id: 'battery',
    name: '电池（iFixit 实测）',
    group: '能源',
    explodeDir: U(0.8, 0.85, 0),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const cell = new THREE.Mesh(
        new RoundedBoxGeometry(4.2, 6.6, 0.3, 3, 0.12),
        metalMaterial(0xc8ccd0, 0.36)
      );
      cell.position.set(1.5, -0.2, 0);
      g.add(cell);

      // 电芯分层纹理（表示卷绕/叠片结构）
      for (let i = 0; i < 5; i++) {
        const layer = new THREE.Mesh(
          new THREE.PlaneGeometry(4.05, 6.45),
          mat({ color: i % 2 ? 0xb0b5ba : 0xd2d6da, metalness: 0.4, roughness: 0.55, opacity: 0.5 })
        );
        layer.position.set(1.5, -0.2, -0.11 + i * 0.055);
        g.add(layer);
      }

      // 电池标识
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.5),
        mat({ color: 0x1f2937, metalness: 0.1, roughness: 0.85 })
      );
      label.position.set(1.5, 0.9, 0.16);
      g.add(label);

      addEdges(g, 0x94a3b8, 0.12);
      g.position.z = -0.09;
      return g;
    },
    hotspots: [
      {
        id: 'battery',
        title: '史上最大 iPhone 电池',
        anchor: U(3.6, -0.2, 0.18),
        body: `<b>iFixit 拆解实测读数</b>（2026-09-20 发布，仅适用于 eSIM 版机型）：

- <b>iPhone 18 Pro：4288 mAh / 16.76 Wh</b> —— 比 17 Pro 的 4252mAh 只涨 <b>0.8%</b>
- <b>iPhone 18 Pro Max：5567 mAh / 21.751 Wh</b> —— 比 17 Pro Max 的 5088mAh 涨 <b>9.4%</b>

覆盖范围：美国、加拿大、墨西哥、日本、沙特、阿联酋、卡塔尔、阿曼、巴林、科威特。<b>带实体 SIM 卡槽的欧洲/其他地区版本电池略小</b>——卡槽要占空间。

<b>拆解里电池是个亮点</b>：苹果沿用上一代的<b>螺丝固定金属电池托盘</b>。拆掉托盘和电池共 13 颗螺丝，不用跟强力胶较劲。电芯用<b>电释放胶</b>，12V 下约 90 秒就能干净取下。

<b>注意续航口径</b>：容量不等于续航。真实使用仍只有苹果自己的播放时长说法，Pro/Pro Max 容量差距在实机上远小于 9.4% 带来的直觉。

折叠的 Ultra 更特殊：折叠屏拆成两半，电池做成<b>双电芯</b>分布在机身两侧，总容量 5400–5800mAh。`,
        stats: [
          { label: 'Pro（eSIM 实测）', value: '4288 mAh / 16.76 Wh' },
          { label: 'Pro Max（eSIM 实测）', value: '5567 mAh / 21.751 Wh' },
          { label: 'Pro 增幅', value: '+0.8%（vs 4252）' },
          { label: 'Pro Max 增幅', value: '+9.4%（vs 5088）' },
          { label: '带卡槽版本', value: '略小（Pro 4056 / Pro Max 5391）' },
          { label: '拆解方式', value: '13 颗螺丝 + 电释放胶（12V/90s）' },
        ],
      },
    ],
  });

  // ============ 6. 液冷散热系统 ============
  layers.push({
    id: 'cooling',
    name: '液冷散热模组',
    group: '热管理',
    explodeDir: U(0, -1.1, 0.25),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 均热板
      const vapor = new THREE.Mesh(
        roundedBox(4.3, 6.5, 0.07, 0.15, 3),
        metalMaterial(0xb0b8c0, 0.22)
      );
      vapor.position.set(1.5, -0.2, -0.22);
      g.add(vapor);

      // 铜制热管：沿机身长轴（Y）排布。圆柱默认轴就是 Y，
      // 之前写 rotation.x = π/2 会把管道转到指向镜头，6.3 单位长的管子
      // 直接戳出机身前后各 31mm——整机包围盒的 z 跨度被它撑到 6.3。
      for (let i = 0; i < 3; i++) {
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.075, 0.075, 6.3, 16),
          metalMaterial(0xd08c4a, 0.28)
        );
        pipe.position.set(0.2 + i * 1.3, -0.2, -0.27);
        g.add(pipe);
      }

      // 石墨烯散热片
      const graphene = new THREE.Mesh(
        new THREE.PlaneGeometry(4.1, 6.3),
        mat({ color: 0x2c3138, metalness: 0.6, roughness: 0.4, opacity: 0.85 })
      );
      graphene.position.set(1.5, -0.2, -0.3);
      g.add(graphene);

      // 散热片标签区
      const plate = new THREE.Mesh(
        roundedBox(1.4, 1.2, 0.05, 0.1, 2),
        metalMaterial(0x8f979f, 0.3)
      );
      plate.position.set(-0.3, 2.0, -0.25);
      g.add(plate);

      addEdges(g, 0xd08c4a, 0.12);
      g.position.z = -0.05;
      return g;
    },
    hotspots: [
      {
        id: 'liquid',
        title: '液冷 + 石墨烯',
        anchor: U(3.7, -1.4, -0.22),
        body: `iPhone 18 Pro 系列**首次引入液冷散热系统**（业内此前长期传闻的功能终于落地）。

结构是三层：
- **铜制热管**：把 SoC 与电池区域的热量横向铺开
- **均热板（VC）**：大面积均温，避免局部热点
- **石墨烯散热片**：贴合在热源正上方

这件事的意义不只是"游戏不烫"。2nm 芯片性能 +18%、能效 +30% 之后，**持续性能才是新瓶颈**——短时峰值大家都能跑，长时间负载下的降频才是体验分水岭。液冷是把 A20 Pro 的性能持续性真正兑现出来的硬件前提。

这也是机身厚度增加的主要来源之一。`,
        stats: [
          { label: '热管材质', value: '铜' },
          { label: '均热板', value: '大面积 VC' },
          { label: '均温层', value: '石墨烯片' },
          { label: '代际意义', value: 'iPhone 首次液冷' },
        ],
      },
    ],
  });

  // ============ 7. 不锈钢中框 ============
  layers.push({
    id: 'frame',
    name: '不锈钢中框',
    group: '结构',
    explodeDir: U(-1.25, 0, 0),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const steel = steelMaterial(0xc4c9ce);
      const steelDark = metalMaterial(0x9aa0a6, 0.3);

      // 侧边框（四条）—— 用倒角几何体，边缘能吃到高光
      const railGeo = new RoundedBoxGeometry(0.14, H - 0.9, T * 0.86, 3, 0.055);
      const sideH = new THREE.Mesh(railGeo, steel);
      sideH.position.set(-W / 2 + 0.06, 0, 0);
      g.add(sideH);
      const sideH2 = new THREE.Mesh(railGeo, steel);
      sideH2.position.x = W / 2 - 0.06;
      g.add(sideH2);

      const railGeoV = new RoundedBoxGeometry(W - 0.9, 0.14, T * 0.86, 3, 0.055);
      const sideV = new THREE.Mesh(railGeoV, steel);
      sideV.position.set(0, H / 2 - 0.06, 0);
      g.add(sideV);
      const sideV2 = new THREE.Mesh(railGeoV, steel);
      sideV2.position.y = -H / 2 + 0.06;
      g.add(sideV2);

      // 音量键 / 电源键（带倒角）
      const keyGeo = new RoundedBoxGeometry(0.09, 0.75, 0.3, 3, 0.035);
      const btn1 = new THREE.Mesh(keyGeo, steelDark);
      btn1.position.set(-W / 2 - 0.03, 2.1, 0);
      g.add(btn1);
      const btn2 = new THREE.Mesh(keyGeo, steelDark);
      btn2.position.set(-W / 2 - 0.03, 1.1, 0);
      g.add(btn2);
      const btn3 = new THREE.Mesh(new RoundedBoxGeometry(0.09, 1.5, 0.3, 3, 0.035), steelDark);
      btn3.position.set(W / 2 + 0.03, 1.6, 0);
      g.add(btn3);

      // 天线断点
      for (let i = 0; i < 4; i++) {
        const ant = new THREE.Mesh(
          new RoundedBoxGeometry(0.16, 0.16, T * 0.88, 2, 0.04),
          mat({ color: 0x3f4448, metalness: 0.35, roughness: 0.62 })
        );
        ant.position.set(
          i < 2 ? -W / 2 + 0.07 : W / 2 - 0.07,
          -3.6 + (i % 2) * 7.2,
          0
        );
        g.add(ant);
      }

      addEdges(g, 0x64748b, 0.12);
      g.position.z = 0.0;
      return g;
    },
    hotspots: [
      {
        id: 'frame',
        title: '不锈钢中框 · 阳极氧化',
        anchor: U(-W / 2 - 0.1, -2.4, 0),
        body: `延续 iPhone 17 Pro 的不锈钢中框，**阳极氧化铝表面处理工艺不变**。

有一处刻意的改动：取消前代的"双色设计"，同时**更新背板玻璃工艺、缩小玻璃与铝制边框的色差**——整机视觉统一性更强。边框本体从铝合金回到不锈钢，主要是出于散热考虑：金属导热系数远高于铝。

代价是重量和成本，苹果也确实收到了 iPhone 17 Pro 用户关于"边框掉漆"的反馈。本代用更精确的色差控制改善一致性，但没有换回铝。

天线断点做了重新排布，5G / Wi-Fi / 卫星三套射频共存。`,
        stats: [
          { label: '材质', value: '不锈钢 + 阳极氧化' },
          { label: '上代问题', value: '边框掉漆反馈' },
          { label: '本代改进', value: '缩小玻璃/边框色差' },
          { label: '配色', value: '深樱桃 6076 等' },
        ],
      },
    ],
  });

  // ============ 8. 后盖玻璃 ============
  layers.push({
    id: 'back',
    name: '背板玻璃',
    group: '外观',
    explodeDir: U(0.4, 0, -1.15),
    build() {
      const g = new THREE.Group();
      const back = new THREE.Mesh(
        roundedBox(W, H, 0.11, 0.75, 5),
        panelGlassMaterial(0x2b1c22, 0.95)
      );
      g.add(back);

      // MagSafe 环
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.045, 16, 64),
        mat({ color: 0xd8dde2, metalness: 0.95, roughness: 0.2 })
      );
      ring.position.set(0, H / 2 - 3.0, -0.08);
      g.add(ring);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.04, 16, 48),
        mat({ color: 0xd8dde2, metalness: 0.95, roughness: 0.2 })
      );
      ring2.position.set(0, H / 2 - 3.0, -0.08);
      g.add(ring2);

      addEdges(g, 0x94a3b8, 0.12);
      g.position.z = -0.36;
      return g;
    },
    hotspots: [
      {
        id: 'magsafe',
        title: 'MagSafe 磁吸环',
        anchor: U(0, H / 2 - 1.9, -0.12),
        body: `MagSafe 磁吸阵列位置不变，充电规格 60W 有线 / 20W 无线（Pro Max）。

配色这一代取消了黑色选项，主打色换成 **深樱桃（Dark Cherry / Pantone 6076）**——带紫调的勃艮第红，另有浅蓝（2121）和银色（427C）。

这里有个值得注意的产品决策：**Ultra（折叠款）首发只有约两个配色**。苹果在折叠产品上刻意回避了大胆配色，说明他们对这块新形态的工艺（尤其是折痕处的涂层面）还没完全吃透。`,
        stats: [
          { label: '有线充电', value: '60W' },
          { label: '无线充电', value: '≤20W' },
          { label: '主配色', value: '深樱桃 Pantone 6076' },
          { label: 'Ultra 配色', value: '首发约 2 种' },
        ],
      },
    ],
  });

  // ============ 9. 天线模组（补充层） ============
  layers.push({
    id: 'rf',
    name: '天线 / 无线充电模组',
    group: '射频',
    explodeDir: U(-0.4, -0.75, -0.55),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 无线充电线圈
      for (let i = 0; i < 5; i++) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(0.95 - i * 0.035, 0.028, 12, 64),
          metalMaterial(0xd8a94a, 0.3)
        );
        coil.position.set(0, H / 2 - 3.0, -0.02 - i * 0.032);
        g.add(coil);
      }

      // 5G / Wi-Fi 天线模组
      const rfMods: [number, number][] = [
        [-2.3, 5.2], [2.3, 5.2], [-2.3, -1.4], [2.3, -1.4],
        [0, 6.6], [-2.3, -5.6], [2.3, -5.6], [0, -6.6],
      ];
      rfMods.forEach(([x, y]) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.4, 0.09),
          mat({ color: 0x1a3d5c, metalness: 0.4, roughness: 0.5, emissive: 0x0d3a5c, emissiveIntensity: 0.25 })
        );
        m.position.set(x, y, 0);
        g.add(m);
      });

      // NFC
      const nfc = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 0.8),
        mat({ color: 0x243b53, metalness: 0.3, roughness: 0.6, opacity: 0.8 })
      );
      nfc.position.set(0, H / 2 - 3.0, 0.05);
      g.add(nfc);

      addEdges(g, 0x60a5fa, 0.12);
      g.position.z = -0.02;
      return g;
    },
    hotspots: [
      {
        id: 'wireless',
        title: 'Qi2 无线充电 + 多天线',
        anchor: U(1.9, H / 2 - 3.0, 0.06),
        body: `线圈阵列是 MagSafe 无线充电的基础，Pro Max 支持 ≤20W 无线。

射频部分：Pro/Pro Max 仍支持 **eSIM + 实体 SIM**，而折叠的 Ultra **只有 eSIM**。这跟折叠机身厚度直接相关——实体卡槽需要额外 1.5mm 左右的厚度，11mm 折叠厚度里塞不下。

8 组 5G / Wi-Fi / 卫星天线模组分布在机身四周，含北斗 / GPS 双模。卫星通信在天线排布上要单独占用位置，这也是中框上那些断点不能随便挪的原因。`,
        stats: [
          { label: '无线充电', value: '≤20W（Pro Max）' },
          { label: 'SIM', value: 'Pro：实体 + eSIM' },
          { label: 'SIM（Ultra）', value: '仅 eSIM' },
          { label: '天线模组', value: '8 组 5G / Wi-Fi / 卫星' },
        ],
      },
    ],
  });

  return {
    id: 'iphone18',
    name: 'iPhone 18 Pro',
    subtitle: 'Apple · 2026 年 9 月',
    tagline: '首款 2nm 芯片 + 可变光圈 + 首次液冷，为折叠款打前站的 Pro',
    background: 0xf4f5f7,
    accent: '#6b7280',
    camera: { position: [11, 7, 15], target: [0, 0, 0] },
    explodeScale: 1,
    fidelity: {
      actualParts: 2700,
      source: '整机约 2700 个零件（FT 供应链分析 / ZDNET 引述）；仅主板表贴元件就有 1243 个（TechInsights 逐个脱焊清点 iPhone 15 Pro）',
      modeledLayers: 9,
      modeledParts: 139,
      note: 'iFixit 拆解实测：Pro 4288mAh / Pro Max 5567mAh（eSIM 版），6 叶片机械光圈，A20 Pro 改为 die 与内存并排封装。本模型表达的是 9 个功能子系统（显示 / 计算 / 光学 / 能源 / 热管理 / 结构 / 射频），不是零件级清单。1243 个表贴元件以「被动元件群」的示意形式出现，不逐个建模。',
    },
    repairability: {
      score: 7,
      difficulty: '中等',
      tools: ['加热台 / 热风枪', '吸盘 + 撬片', '精密螺丝刀（五角/十字）', '电池拉片 / 取胶工具', '屏幕分离夹具'],
      note: 'iFixit 口径（参考近年 Pro 机型 7/10）：玻璃背板可开启更换电池、模块化程度高，但屏幕与电池仍需加热除胶、粘合剂多',
    },
    layers,
    headline: [
      { label: '工艺', value: '2nm', unit: '台积电 N2' },
      { label: '性能', value: '+18', unit: '% vs A19' },
      { label: '主摄光圈', value: '6 叶片 f/1.48–4.0', unit: 'iFixit 实测' },
      { label: '电池', value: '5567', unit: 'mAh（iFixit 实测）' },
    ],
    overview: `iPhone 18 Pro 是苹果 2nm 时代的开局机型，也是这一代三款产品（Pro / Pro Max / 折叠 Ultra）里技术含量最高、最能说明"苹果这两年在忙什么"的一款。

三条主线同时发生：芯片换到 2nm 并采用 WMCM 晶圆级多芯片封装、影像首次引入可变光圈与三层堆栈传感器、机身首次加入液冷散热。三者互相咬合——2nm 带来性能提升的同时也带来散热压力，可变光圈与更大的传感器模组需要额外空间，WMCM 省出的空间又反过来喂给了电池。

<b>iFixit 已于 2026 年 9 月 20 日完成实机拆解</b>，本页关键数据以拆解实测为准（电池容量、6 叶片光圈、封装结构），而非发布前的传闻。

拆解里最值得注意的发现有三处：<b>A20 Pro 的封装从"内存堆叠在 die 上方"改为"并排放置"</b>，这是均热板能做大到 3 倍的前提，但代价是 NAND 被埋进双层主板夹层；<b>6 叶片机械光圈</b>是苹果首次，iFixit 拆解时有一片叶子飞过了房间，判定零件级不可修；<b>4 台样机中有 3 台的屏幕塑料框架在拆卸时开裂</b>，该框架不单独售卖，损坏通常意味着换整个屏幕总成。

维修性暂定 <b>7/10</b>，与 16、17 Pro 同分。USB-C 接口仍埋在内部。

关键提醒：本模型的建模依据是公开规格与 iFixit 拆解结论的**参数化重建**，不是真机扫描数据。厚度存在 8.8mm / 9mm 两个流传版本，模型按 8.8mm 建模。`,
    narrative: [
      `<b>为什么 2nm 之后必须上液冷</b>：A20 Pro 能效提升 30% 是好事，但它同时性能涨 18%，高频状态下总发热并不一定下降。手机没有风扇，散热只能靠结构。液冷 + 均热板 + 石墨烯这套组合，是把 2nm 的性能持续性真正兑现出来的硬件前提——短时跑分谁都能跑，长时间不降频才是体验分水岭。`,
      `<b>可变光圈的实际意义</b>：手机镜头通常在 f/1.4–f/2 之间固定，因为光圈叶片本身会占体积、影响模组厚度。能做到 f/11 意味着拿到接近衍射极限的收缩能力，代价是凸台区域厚度涨到 13.77mm（Pro Max）。这是拿厚度换光学自由度，在专业场景（风光堆栈、日间街景）里是真有用的取舍。`,
      `<b>WMCM 那一层空间去哪了</b>：把 RAM 集成到与 CPU/GPU/NPU 同一片晶圆，省下的是独立 RAM 封装层的厚度和主板面积。省出来的空间去了两处——更大的电池，和新的液冷系统。这也是为什么"厚度几乎没变但电池涨了"的答案。`,
    ],
    specs: [
      { label: '屏幕', value: '6.3" / 6.9" LTPO+ OLED', note: '1–120Hz，Pro / Pro Max' },
      { label: '芯片', value: 'A20 Pro（2nm，WMCM）', note: '台积电代工，12GB LPDDR5' },
      { label: '性能', value: '+18% / 能效 +30%', note: '对比 A19' },
      { label: '主摄', value: '6 叶片机械光圈 f/1.48/1.8/2.8/4.0', note: 'iFixit 拆解实测；Pro Max 或独占三星三层堆栈传感器' },
      { label: '超广角 / 长焦', value: '48 MP / 48 MP', note: '均为 1/2.55" 级' },
      { label: '电池（iFixit 实测）', value: 'Pro 4288 / Pro Max 5567 mAh', note: 'eSIM 版；有 SIM 卡槽版略小' },
      { label: '厚度', value: '≈8.8mm（传闻）', note: '存在 8.8 / 9.0 两个版本' },
      { label: '散热', value: '液冷 + 均热板 + 石墨烯', note: 'iPhone 首次' },
      { label: '充电', value: '60W 有线 / ≤20W 无线', note: 'MagSafe + Qi2' },
      { label: '维修性评分', value: '7 / 10（iFixit 暂定）', note: '与 16/17 Pro 同分' },
      { label: '主板结构', value: '双层夹层（NAND 埋入内层）' },
      { label: '电池拆卸', value: '13 颗螺丝 + 电释放胶' },
      { label: '屏下 Face ID', value: '红外相机移至屏下，隔行像素' },
      { label: '配色', value: '深樱桃 6076 / 浅蓝 2121 / 银色 427C', note: '取消黑色' },
    ],
    comparison: {
      title: 'iPhone 18 Pro 对比 iPhone 17 Pro',
      note: '基于已公开的规格汇总整理',
      rows: [
        { label: '芯片工艺', prev: 'A19 Pro · 3nm', curr: 'A20 Pro · 2nm', delta: 'up' },
        { label: '内存封装', prev: '独立 RAM 封装', curr: 'WMCM 同晶圆集成', delta: 'up' },
        { label: '性能', prev: '基准', curr: '+18%', delta: 'up' },
        { label: '能效', prev: '基准', curr: '+30%', delta: 'up' },
        { label: '主摄光圈', prev: '固定 f/1.48', curr: '6 叶片可变 f/1.48–4.0', delta: 'up' },
        { label: '传感器', prev: '常规堆栈', curr: 'Pro Max：三层堆栈（待确认）', delta: 'up' },
        { label: '散热', prev: '石墨烯 + 均热板', curr: '增加液冷系统', delta: 'up' },
        { label: '灵动岛厚度', prev: '20.7mm', curr: '13.5mm（-35%）', delta: 'down' },
        { label: '刷新率', prev: 'LTPO 1–120Hz', curr: 'LTPO+ 1–120Hz', delta: 'up' },
        { label: '电池 Pro（eSIM）', prev: '4252 mAh', curr: '4288 mAh（+0.8%）', delta: 'up' },
        { label: '电池 Pro Max（eSIM）', prev: '5088 mAh', curr: '5567 mAh（+9.4%）', delta: 'up' },
      ],
    },
  };
}

/** sub-pixel 网格纹理。浏览器环境用 Canvas 生成，SSR/构建期返回 null 降级。 */
function createSubpixelTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, s, s);
  const sub = ['#ff2d55', '#2fd85f', '#2d7bff'];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = sub[(x + y) % 3];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x * 8 + 1, y * 8 + 1, 5, 5);
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(46, 96);
  return t;
}
