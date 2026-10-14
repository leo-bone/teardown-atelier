import * as THREE from 'three';
import { metalMaterial, steelMaterial, panelGlassMaterial, mat, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * Lockheed Martin F-35A Lightning II（常规起降型 / CTOL）
 *
 * 真实尺寸（Lockheed Martin 官方 Fast Facts，F-35A）：
 *   机长 15.7 m · 翼展 10.7 m（F-35C 为 13.1 m）· 机高 4.38 m · 翼面积 42.7 m²
 *   空重 13,300 kg · 最大起飞 31,800 kg · 单机单价 ~8250 万美元（Lot 18）
 *
 * 场景单位：1 = 1 m。机头朝 +X，翼展沿 Z，上 = +Y。
 *
 * 引擎：1 × 普惠 F135-PW-100 涡扇
 *   军推 28,000 lbf（124 kN）· 加力 43,000 lbf（191 kN）
 * 极速 Mach 1.6（~1,930 km/h）· 作战半径 1,240 km · 升限 15,240 m
 *
 * 航电（第五代核心）：AN/APG-81 AESA 雷达、AN/ASQ-239 电子战、
 *   EOTS 光电瞄准、DAS 分布式孔径（6 个红外传感器 360°）、Gen III HMDS 头盔
 *
 * 隐身：RCS ~0.001 m²、RAM 吸波涂层、内置弹舱、平行边缘对齐
 *
 * 说明：按公开技术规格参数化重建，非工程图纸复刻；外形为结构示意，
 * 子系统与参数以官方/公开资料为准。
 */

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// 机身纵向半剖面（半径 r, 轴向 y：0=机尾 → 15.7=机头）
const FUSE_PROFILE: [number, number][] = [
  [0.02, 0.0],
  [0.42, 0.6],
  [0.72, 2.2],
  [0.92, 5.0],
  [0.9, 8.0],
  [0.82, 10.5],
  [0.62, 12.6],
  [0.4, 14.2],
  [0.18, 15.4],
  [0.02, 15.7],
];

/** 主机身：旋转成型的卵形截面筒 + 尾部收缩 */
function buildFuselage(): THREE.Group {
  const g = new THREE.Group();

  const pts = FUSE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 48),
    metalMaterial(0x9aa0a4, 0.42, 0.85)
  );
  // 旋转体默认绕 Y，转到沿 X（机头朝 +X），并居中
  body.rotation.z = -Math.PI / 2;
  body.position.x = -7.85;
  // 压扁成卵形截面（宽 > 高），F-35 机身偏扁
  body.scale.set(1, 0.82, 1);
  g.add(body);

  // 隐身棱线（chines）：机身两侧两条锐利折边，是 F-35 最标志性的外形语言
  const chineMat = metalMaterial(0x8e9498, 0.4, 0.85);
  for (const sgn of [1, -1]) {
    const chine = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.16, 0.22), chineMat);
    chine.position.set(-0.6, 0.18, sgn * 0.78);
    chine.rotation.z = 0.012;
    chine.rotation.y = sgn * 0.02;
    g.add(chine);
  }

  // 进气道上唇（DSI 无附面层隔道进气，F-35 招牌）
  for (const sgn of [1, -1]) {
    const lip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.0), metalMaterial(0x868c90, 0.4, 0.85));
    lip.position.set(1.6, -0.35, sgn * 0.95);
    g.add(lip);
  }

  // 双外倾垂尾（canted tails）
  for (const sgn of [1, -1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.7, 0.12), metalMaterial(0x90979b, 0.42, 0.85));
    tail.position.set(-5.4, 0.95, sgn * 1.05);
    tail.rotation.z = -0.18;
    tail.rotation.y = sgn * 0.26;
    g.add(tail);
  }

  // 平尾（全动平尾，stabilator）
  for (const sgn of [1, -1]) {
    const stab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.0), metalMaterial(0x949a9e, 0.42, 0.85));
    stab.position.set(-5.9, 0.2, sgn * 1.7);
    stab.rotation.y = sgn * 0.12;
    g.add(stab);
  }

  // 尾喷口外缘（发动机舱收口）
  const tailRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.12, 10, 32),
    metalMaterial(0x6e6a66, 0.5, 1)
  );
  tailRing.rotation.y = Math.PI / 2;
  tailRing.position.set(-7.6, 0, 0);
  g.add(tailRing);

  addEdges(g, 0x5b6168, 0.1);
  return g;
}

/** 座舱盖：气泡式，深色镀膜玻璃 */
function buildCanopy(): THREE.Group {
  const g = new THREE.Group();
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), panelGlassMaterial(0x101820, 0.82));
  canopy.scale.set(2.0, 0.7, 0.95);
  canopy.position.set(4.4, 0.92, 0);
  g.add(canopy);
  // 框（略大，下半埋进机身）
  const frame = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), metalMaterial(0xb6bbc0, 0.35, 0.9));
  frame.scale.set(2.05, 0.72, 1.0);
  frame.position.set(4.4, 0.9, 0);
  g.add(frame);
  return g;
}

/** 航电与传感器：机头 AESA 雷达 + EOTS + DAS + 电子战 */
function buildAvionics(): THREE.Group {
  const g = new THREE.Group();

  // APG-81 AESA 雷达（机头内部，T/R 模块阵列示意）
  const radome = new THREE.Mesh(
    new THREE.ConeGeometry(0.78, 1.6, 28, 1, true),
    metalMaterial(0xb9bec3, 0.4, 0.7)
  );
  radome.rotation.z = -Math.PI / 2;
  radome.position.set(13.4, 0, 0);
  g.add(radome);

  const array = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.1, 1.1),
    mat({ color: 0x1c2a33, metalness: 0.5, roughness: 0.5, emissive: 0x0a2230, emissiveIntensity: 0.4 })
  );
  array.position.set(13.0, 0, 0);
  g.add(array);
  // T/R 模块点阵
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.14, 0.14),
        mat({ color: 0x1f6f7a, metalness: 0.6, roughness: 0.4 })
      );
      cell.position.set(12.96, -0.45 + i * 0.18, -0.45 + j * 0.18);
      g.add(cell);
    }
  }

  // EOTS：机头下方宝石形光电窗口（F-35 招牌下颚传感器）
  const eots = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.7),
    mat({ color: 0x0c1a22, metalness: 0.3, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })
  );
  eots.position.set(11.8, -0.55, 0);
  g.add(eots);

  // DAS 分布式孔径：6 个红外传感器（机身四周 360°）
  const dasMat = mat({ color: 0x0a1014, metalness: 0.4, roughness: 0.2 });
  const dasPos: [number, number, number, number][] = [
    [9, 0.7, 1.0, 0], [9, 0.7, -1.0, 0],
    [2, 1.0, 0.9, 1], [2, 1.0, -0.9, -1],
    [-3, -0.7, 1.0, 0], [-3, -0.7, -1.0, 0],
  ];
  dasPos.forEach(([x, y, z]) => {
    const sensor = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 8), dasMat);
    sensor.position.set(x, y, z);
    g.add(sensor);
  });

  // AN/ASQ-239 电子战天线（机背两条）
  for (const sgn of [1, -1]) {
    const ew = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.18), mat({ color: 0x2a3540, metalness: 0.6, roughness: 0.4 }));
    ew.position.set(2, 0.82, sgn * 0.4);
    g.add(ew);
  }

  addEdges(g, 0x5b6168, 0.1);
  return g;
}

/** F135 发动机：单台大涵道比加力涡扇 */
function buildEngine(): THREE.Group {
  const g = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.58, 4.6, 28),
    metalMaterial(0x7d7470, 0.45, 1)
  );
  core.rotation.z = Math.PI / 2;
  core.position.set(-4.8, 0, 0);
  g.add(core);

  // 风扇前段（大直径）
  const fan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.7, 1.4, 28),
    metalMaterial(0x8a8f93, 0.4, 1)
  );
  fan.rotation.z = Math.PI / 2;
  fan.position.set(-2.4, 0, 0);
  g.add(fan);

  // 风扇叶片（进口导叶示意）
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.7, 0.16),
      metalMaterial(0xb9bec3, 0.3, 1)
    );
    blade.position.set(-1.7, 0, 0);
    blade.rotation.x = a;
    blade.translateY(0.42);
    g.add(blade);
  }

  // 加力燃烧室（中段略粗）
  const aug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.66, 1.6, 28),
    metalMaterial(0x6e6a66, 0.5, 1)
  );
  aug.rotation.z = Math.PI / 2;
  aug.position.set(-6.4, 0, 0);
  g.add(aug);

  // 收敛-扩张喷管（LatheGeometry 钟形）
  const nozPts: [number, number][] = [
    [0.66, 0], [0.62, 0.4], [0.7, 0.9], [0.82, 1.3], [0.9, 1.5],
  ];
  const nozzle = new THREE.Mesh(
    new THREE.LatheGeometry(nozPts.map(([r, y]) => new THREE.Vector2(r, y)), 28),
    metalMaterial(0x5a5550, 0.55, 0.95)
  );
  nozzle.rotation.z = -Math.PI / 2;
  nozzle.position.set(-7.7, 0, 0);
  g.add(nozzle);

  addEdges(g, 0x6e6a66, 0.1);
  return g;
}

/** 内置弹舱：2 个腹部弹舱（含一扇开启的舱门示意） */
function buildWeaponBays(): THREE.Group {
  const g = new THREE.Group();
  const bayMat = mat({ color: 0x14181d, metalness: 0.55, roughness: 0.6 });

  const bayDefs: [number, number][] = [
    [1.4, 0], [-2.0, 0],
  ];
  bayDefs.forEach(([x]) => {
    // 舱体（凹陷暗腔）
    const bay = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1.5), bayMat);
    bay.position.set(x, -0.55, 0);
    g.add(bay);

    // 舱内挂架 + 导弹（AIM-120 示意）
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.18), metalMaterial(0x9aa0a4, 0.4, 0.85));
    rail.position.set(x, -0.3, 0);
    g.add(rail);
    for (const sgn of [1, -1]) {
      const mis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.8, 14),
        metalMaterial(0xb6bbc0, 0.35, 0.85)
      );
      mis.rotation.z = Math.PI / 2;
      mis.position.set(x, -0.18, sgn * 0.4);
      g.add(mis);
    }

    // 开启的舱门（向两侧翻开）
    for (const sgn of [1, -1]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.75), metalMaterial(0x9aa0a4, 0.4, 0.85));
      door.position.set(x, -0.28, sgn * 1.05);
      door.rotation.x = sgn * 0.5;
      g.add(door);
    }
  });

  addEdges(g, 0x5b6168, 0.1);
  return g;
}

/** 主翼（梯形后掠，左右） */
function buildWings(): THREE.Group {
  const g = new THREE.Group();
  const wingMat = metalMaterial(0x9aa0a4, 0.42, 0.85);

  // 2D 梯形翼型（X=弦长，Y=展向），后掠
  const shape = new THREE.Shape();
  shape.moveTo(2.2, 0.0);
  shape.lineTo(-2.6, 0.0);
  shape.lineTo(-2.1, 4.3);
  shape.lineTo(-0.2, 4.3);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
  geo.translate(0, 0, -0.09); // 厚度居中

  for (const sgn of [1, -1]) {
    const wing = new THREE.Mesh(geo, wingMat);
    wing.rotation.x = -Math.PI / 2; // 平放：Y(展向)→Z
    wing.position.set(-0.4, -0.05, sgn * 0.6);
    g.add(wing);

    // 翼尖（F-35 翼尖无挂架，干净）
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.3), wingMat);
    tip.position.set(-0.6, -0.05, sgn * 4.4);
    g.add(tip);
  }

  addEdges(g, 0x5b6168, 0.1);
  return g;
}

/** 起落架：前轮 + 2 主轮（放下状态，便于展示） */
function buildGear(): THREE.Group {
  const g = new THREE.Group();
  const strut = metalMaterial(0x6a7075, 0.45, 1);
  const tyre = mat({ color: 0x111417, metalness: 0.1, roughness: 0.9 });

  const makeLeg = (x: number, z: number, len: number, wheelR: number) => {
    const leg = new THREE.Group();
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, len, 10), strut);
    rod.position.y = -len / 2;
    leg.add(rod);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelR, wheelR, 0.22, 18), tyre);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.y = -len;
    leg.add(wheel);
    leg.position.set(x, -0.4, z);
    return leg;
  };

  g.add(makeLeg(3.2, 0, 1.2, 0.32)); // 前轮
  g.add(makeLeg(-1.6, 1.4, 1.4, 0.4)); // 左主轮
  g.add(makeLeg(-1.6, -1.4, 1.4, 0.4)); // 右主轮

  addEdges(g, 0x5b6168, 0.1);
  return g;
}

export function f35LightningII(): Subject {
  const layers: Layer[] = [];

  layers.push({
    id: 'fuselage',
    name: '机身 / 气动与隐身外形',
    group: '结构',
    explodeDir: U(0, 1.6, 0),
    explodeScale: 0.32,
    sectionable: true,
    build: buildFuselage,
    hotspots: [
      {
        id: 'chine',
        title: '隐身棱线（chine）',
        anchor: U(-0.6, 0.25, 0.78),
        body: `F-35 机身两侧这两条锐利的折边，是它和 F-22 一脉相承的<b>隐身外形语言</b>。
        它们的作用是把机身侧面产生的雷达回波，沿着预设方向偏转出去，而不是原路返回雷达。
        配合边缘对齐（所有主要棱边互相平行/垂直），整机 RCS 被压到约 <b>0.001 m²</b>——接近一只飞鸟的反射。
        这也是为什么 F-35 看着"棱角分明"而不是圆润：隐身优先于气动圆滑。`,
        stats: [
          { label: 'RCS（整机）', value: '~0.001 m²' },
          { label: '隐身手法', value: '棱线偏转 + 边缘对齐 + RAM' },
          { label: '涂层', value: 'RAM 吸波材料' },
        ],
      },
    ],
  });

  layers.push({
    id: 'canopy',
    name: '座舱盖（气泡式）',
    group: '座舱',
    explodeDir: U(1.6, 1.4, 0),
    explodeScale: 0.4,
    sectionable: false,
    build: buildCanopy,
    hotspots: [
      {
        id: 'canopy',
        title: '气泡座舱 + Gen III HMDS',
        anchor: U(4.4, 1.4, 0),
        body: `F-35 的座舱几乎没有传统仪表——信息全部由 <b>Gen III 头盔显示系统（HMDS）</b>承担。
        头盔把 APG-81 雷达、EOTS、DAS 的影像直接叠加到飞行员的视野里，甚至能"看穿"机身（利用 DAS 的机身四周红外画面做合成）。
        这意味着飞行员转头就能看到机身下方的目标，彻底取消了传统平显（HUD）。`,
        stats: [
          { label: '显示', value: 'Gen III HMDS 头盔' },
          { label: '传统 HUD', value: '已取消' },
          { label: '态势感知', value: 'DAS 360° 合成视场' },
        ],
      },
    ],
  });

  layers.push({
    id: 'avionics',
    name: '航电与传感器（第五代大脑）',
    group: '航电',
    explodeDir: U(1.0, 0.6, 1.0),
    explodeScale: 0.42,
    sectionable: true,
    build: buildAvionics,
    hotspots: [
      {
        id: 'apg81',
        title: 'AN/APG-81 AESA 雷达',
        anchor: U(13.0, 0, 0),
        body: `机头内是一面<b>有源相控阵（AESA）</b>雷达，由成百上千个独立的 T/R 收发模块组成（模型中以点阵示意）。
        AESA 可以同时做多件事：一边搜索跟踪，一边对地成像、电子对抗——而且很难被截获和干扰。
        它是 F-35 "传感器融合"的硬件基石：雷达、光电、电子战的数据在机内合成成一张统一的态势图。`,
        stats: [
          { label: '型号', value: 'AN/APG-81 AESA' },
          { label: '体制', value: '有源相控阵' },
          { label: '角色', value: '搜索/跟踪/成像/电子战' },
        ],
      },
      {
        id: 'eots',
        title: 'EOTS 光电瞄准系统',
        anchor: U(11.8, -0.55, 0),
        body: `机头下方那块宝石形的窗口，是 <b>EOTS（Electro-Optical Targeting System）</b>——一个内置的前视红外/激光瞄准系统。
        它能被动探测、识别、激光指示目标，全程不发射信号，隐身状态不被破坏。
        这是 F-35 能在"不开雷达"的情况下完成瞄准的关键传感器之一。`,
        stats: [
          { label: '系统', value: 'EOTS 光电瞄准' },
          { label: '能力', value: '前视红外 + 激光指示' },
          { label: '隐身', value: '被动工作，不辐射' },
        ],
      },
      {
        id: 'das',
        title: 'DAS 分布式孔径系统',
        anchor: U(2, 1.0, 0.9),
        body: `<b>DAS（Distributed Aperture System）</b>由机身四周的 6 个红外传感器组成，提供<b>全向 360° 红外态势感知</b>。
        导弹逼近告警、夜视、对地跟踪都靠它。配合 HMDS，飞行员获得了"透视机身"的球形视场——这正是 F-35 区别于四代机的核心体验之一。`,
        stats: [
          { label: '传感器', value: '6 × 红外孔径' },
          { label: '覆盖', value: '360° 全向' },
          { label: '能力', value: '导弹告警 + 夜视 + 跟踪' },
        ],
      },
    ],
  });

  layers.push({
    id: 'engine',
    name: 'F135 发动机（单台加力涡扇）',
    group: '动力',
    explodeDir: U(-1.4, -1.2, 0.6),
    explodeScale: 0.42,
    sectionable: true,
    build: buildEngine,
    hotspots: [
      {
        id: 'f135',
        title: '普惠 F135 — 史上最强军用涡扇',
        anchor: U(-4.8, 0, 0),
        body: `F-35 只靠<b>一台</b>普惠 F135 推进——这是目前量产现役推力最大的军用涡扇。
        <table>
        <tr><td>军推（不加力）</td><td>28,000 lbf / 124 kN</td></tr>
        <tr><td>加力推力</td><td>43,000 lbf / 191 kN</td></tr>
        <tr><td>推重比</td><td>~10（整机）</td></tr>
        </table>
        大涵道比让它省油、航程远；加力段用收敛-扩张喷管保证高速。单发方案省重量、降复杂度，但也让发动机成为全机最关键的单点。`,
        stats: [
          { label: '军推', value: '28,000 lbf (124 kN)' },
          { label: '加力', value: '43,000 lbf (191 kN)' },
          { label: '数量', value: '1 台（全机单发）' },
          { label: '极速', value: 'Mach 1.6' },
        ],
      },
    ],
  });

  layers.push({
    id: 'bays',
    name: '内置弹舱（2 × 弹舱）',
    group: '武器',
    explodeDir: U(0.4, -1.4, 0),
    explodeScale: 0.4,
    sectionable: false,
    build: buildWeaponBays,
    hotspots: [
      {
        id: 'bays',
        title: '内置弹舱：隐身的代价与取舍',
        anchor: U(1.4, -0.55, 0),
        body: `F-35 把武器收进<b>两个腹部内置弹舱</b>，外部干净——这是它保持隐身的前提。
        代价是内置载荷有限：F-35A 典型内置 2 × AIM-120 中距弹 + 2 × 908 kg 级 JDAM，或 4 × AIM-120。
        <b>隐身模式 vs 野兽模式</b>：挂满外置武器的"野兽模式"火力翻数倍，但 RCS 暴增、隐身尽失。这是五代机通用的取舍。`,
        stats: [
          { label: '弹舱', value: '2 个腹部内置' },
          { label: '典型内置', value: '2×AIM-120 + 2×JDAM' },
          { label: '机炮', value: 'GAU-22/A 25mm' },
          { label: '外置', value: '6 个硬点（野兽模式）' },
        ],
      },
    ],
  });

  layers.push({
    id: 'wings',
    name: '主翼（梯形后掠）',
    group: '气动',
    explodeDir: U(-0.4, 0, 1.6),
    explodeScale: 0.34,
    sectionable: false,
    build: buildWings,
    hotspots: [
      {
        id: 'wing',
        title: '中等后掠梯形翼',
        anchor: U(-0.6, 0, 3.0),
        body: `F-35 的翼展 10.7 m（F-35C 舰载型加大到 13.1 m 并带折叠），采用中等后掠的梯形翼。
        机翼内还集成油箱与部分襟副翼作动。F-35C 更大的翼面积换来更低着舰速度——这是三个型号之间最显著的机翼差异。`,
        stats: [
          { label: '翼展（A）', value: '10.7 m' },
          { label: '翼展（C）', value: '13.1 m（可折叠）' },
          { label: '翼面积（A）', value: '42.7 m²' },
        ],
      },
    ],
  });

  layers.push({
    id: 'gear',
    name: '起落架（前轮 + 2 主轮）',
    group: '结构',
    explodeDir: U(0, -1.8, 0),
    explodeScale: 0.3,
    sectionable: false,
    build: buildGear,
    hotspots: [
      {
        id: 'gear',
        title: '三轮式起落架',
        anchor: U(3.2, -1.6, 0),
        body: `F-35A 采用前三点式起落架。图中为放下状态便于展示——实际收纳后完全藏于机身/翼根内，保证外形隐身。
        F-35B（垂直起降型）在此基础上加装升力风扇与可转喷管，结构最复杂、空重最高（32,300 kg）。`,
        stats: [
          { label: '布局', value: '前三点式' },
          { label: 'F-35B', value: '另装升力风扇（STOVL）' },
          { label: '空重（A）', value: '13,300 kg' },
        ],
      },
    ],
  });

  return {
    id: 'f35',
    name: 'F-35A Lightning II',
    subtitle: 'Lockheed Martin · 2015 服役 · 第五代隐身多用途',
    tagline: '单发 19 吨加力、Mach 1.6、RCS 0.001㎡——西方主力五代机',
    background: 0xeef1f4,
    accent: '#3b6ea5',
    camera: { position: [22, 11, 22], target: [0, 0, 0] },
    explodeScale: 1.0,
    sectionable: true,
    repairability: {
      score: 3,
      difficulty: '极难',
      tools: ['专用隐身涂层修复设备（RAM 回修）', '内埋式舱门校准工装', 'HMDS 头盔校准台', 'ALIS/ODIN 保障信息系统', 'AESA 模块级更换设备'],
      note: '工程评估：隐身涂层、内埋弹舱与高度集成的航电使维护极复杂，且严重依赖专用保障链',
    },
    fidelity: {
      actualParts: 1,
      source: '整机约 30 万+ 零件；F135 单台逾 1,000 件；AESA 雷达 T/R 模块成百上千',
      modeledLayers: 7,
      modeledParts: 96,
      note: '按公开技术规格参数化重建，非工程图纸复刻。外形与子系统布局为结构示意，尺寸与参数以 Lockheed Martin 官方 Fast Facts 及公开资料为准。',
    },
    layers,
    headline: [
      { label: '机长', value: '15.7', unit: 'm' },
      { label: '加力推力', value: '191', unit: 'kN' },
      { label: '极速', value: 'Mach 1.6', unit: '' },
      { label: '作战半径', value: '1240', unit: 'km' },
    ],
    overview: `F-35A「闪电 II」是洛克希德·马丁研制的<b>第五代隐身多用途战斗机</b>，2015 年起服役，是西方阵营 21 世纪的主力战机，全球订单逾 3,400 架。
    机长 <b>15.7 m</b>、翼展 10.7 m（舰载型 C 为 13.1 m）、空重 13,300 kg，单机单价约 <b>8,250 万美元</b>（Lot 18）。
    全机只靠<b>一台</b>普惠 F135 涡扇：军推 124 kN、加力 191 kN（43,000 lbf），极速 Mach 1.6（约 1,930 km/h），作战半径 1,240 km，升限 15,240 m。
    第五代的核心不是速度，而是<b>隐身 + 传感器融合</b>：RCS 约 0.001 m²，配 AN/APG-81 AESA 雷达、AN/ASQ-239 电子战、EOTS 光电瞄准、DAS 分布式孔径与 Gen III HMDS 头盔，把多源数据合成成一张统一态势图。
    三个型号：A 常规起降、B 短距/垂直起降（升力风扇）、C 舰载（大翼可折叠）。内置 2 个弹舱保证隐身，野兽模式外挂 6 个硬点换取火力。
    建模说明：按官方技术规格参数化重建，非工程图纸复刻；外形与子系统为结构示意，尺寸与参数以公开资料为准。`,
    narrative: [
      `<b>隐身不是"看不见"，是"晚一点被发现"</b>：F-35 的 RCS 约 0.001 m²，相当于一只飞鸟。这不是靠某种魔法材料，而是三件事叠加——机身棱边全部平行/垂直对齐让回波朝固定方向偏走、RAM 吸波涂层吸收剩余能量、武器内埋让外形干净。代价是维护极贵：涂层一旦刮伤，必须回厂专用设备修复。`,
      `<b>单发改双发的取舍</b>：F-35 全机只有一台 F135。大涵道比带来省油与航程，单点故障风险换来的是更低的重量和复杂度。F135 也是目前量产现役推力最大的军用涡扇——一台顶别人两台。`,
      `<b>传感器融合才是五代机的灵魂</b>：雷达、红外、电子战的数据在机内被合成成一张图，飞行员通过头盔"看穿"机身。传统平显被取消，因为头盔已经把信息直接叠在视野里。这是 F-35 和四代机最本质的代差。`,
      `<b>隐身 vs 火力的永恒取舍</b>：内置弹舱让 F-35 隐身但载荷有限；外置挂架的"野兽模式"火力翻数倍却暴露 RCS。设计上永远在两者间切换，这也是为什么它常被拿来和四代半战机比挂载——但它们不在同一个隐身维度上。`,
    ],
    specs: [
      { label: '类型', value: '第五代隐身多用途战斗机' },
      { label: '制造商', value: 'Lockheed Martin（诺·格、BAE、普惠参与）' },
      { label: '首飞', value: '2006-12-15' },
      { label: '服役', value: '2015（B）/ 2016（A）' },
      { label: '机长', value: '15.7 m（C 15.5 m）' },
      { label: '翼展', value: '10.7 m（C 13.1 m，可折叠）' },
      { label: '机高', value: '4.38 m（C 4.48 m）' },
      { label: '翼面积', value: '42.7 m²（C 62.1 m²）' },
      { label: '空重', value: '13,300 kg（A）' },
      { label: '最大起飞重量', value: '31,800 kg（70,000 lb）' },
      { label: '发动机', value: '1 × 普惠 F135-PW-100' },
      { label: '军推', value: '28,000 lbf（124 kN）' },
      { label: '加力推力', value: '43,000 lbf（191 kN）' },
      { label: '极速', value: 'Mach 1.6（~1,930 km/h）' },
      { label: '巡航速度', value: 'Mach 1.0（超巡能力有限）' },
      { label: '作战半径', value: '1,240 km（内部燃油）' },
      { label: '航程', value: '>2,220 km' },
      { label: '升限', value: '15,240 m' },
      { label: '雷达', value: 'AN/APG-81 AESA' },
      { label: '电子战', value: 'AN/ASQ-239' },
      { label: '光电', value: 'EOTS + DAS（6 孔径 360°）' },
      { label: '显示', value: 'Gen III HMDS 头盔（无 HUD）' },
      { label: '内置弹舱', value: '2 个腹部弹舱' },
      { label: '机炮', value: 'GAU-22/A 25mm（内置）' },
      { label: '外置硬点', value: '6 个（野兽模式）' },
      { label: '隐身 RCS', value: '~0.001 m²' },
      { label: '单机成本', value: '约 8,250 万美元（Lot 18）' },
      { label: '订单总量', value: '全球逾 3,400 架' },
    ],
    comparison: {
      title: 'F-35A / B / C 三型对比',
      note: '基于 Lockheed Martin 官方 Fast Facts 整理',
      rows: [
        { label: '机长', prev: 'A 15.7 m', curr: 'C 15.5 m（可折叠翼）', delta: 'flat' },
        { label: '翼展', prev: 'A/B 10.7 m', curr: 'C 13.1 m', delta: 'up' },
        { label: '空重', prev: 'A 13,300 kg', curr: 'B 14,700 kg（升力风扇）', delta: 'up' },
        { label: '起降', prev: 'A 常规', curr: 'B 短距/垂直（STOVL）', delta: 'up' },
        { label: '作战半径', prev: 'A >1,093 km', curr: 'C >1,100 km', delta: 'flat' },
        { label: '发动机', prev: 'A/C F135-100/400', curr: 'B F135-600 + 升力系统', delta: 'up' },
      ],
    },
  };
}
