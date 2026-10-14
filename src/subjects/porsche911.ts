import * as THREE from 'three';
import { metalMaterial, mat, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * Porsche 911 Carrera S（992 II，2025）
 *
 * 真实尺寸（Porsche 官方技术数据，992 II Carrera S）：
 *   车长 4,542 mm · 车宽 1,852 mm（含镜 2,033）· 车高 1,303 mm · 轴距 2,450 mm
 *   整备质量 1,540 kg（DIN）· 油箱 63 L · 前备厢 135 L · 风阻 Cd 0.29
 *
 * 动力：3.0 L 双涡轮水平对置六缸（boxer），6 缸，2,981 cm³
 *   缸径 91.0 mm · 冲程 76.4 mm · 压缩比 10.2:1
 *   最大功率 353 kW / 480 PS · 最大扭矩 530 Nm（2,300–5,000 rpm）· 红线 7,500 rpm
 *   8 速 PDK 双离合 · 后轮驱动
 *   0–100 km/h 3.3–3.5 s · 极速 308 km/h
 *
 * 底盘：前麦弗逊 / 后多连杆 · 前 350 mm 通风盘 · 前后轮 20"/21" 混合尺寸
 *
 * 说明：按公开技术规格参数化重建，非工程图纸复刻；外形与子系统为结构示意。
 */

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** 911 标志性车身：侧面轮廓拉伸（长 X、高 Y、宽 Z）+ 后轮拱隆起 */
function buildBody(): THREE.Group {
  const g = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0xb9bdc2,
    metalness: 0.85,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8,
  });

  // 侧面轮廓（X = 车长，Y = 车高），经典 911 长车头 + 溜背
  const shape = new THREE.Shape();
  shape.moveTo(-2.27, 0.18);
  shape.lineTo(-2.22, 0.45);
  shape.lineTo(-2.05, 0.62);
  shape.lineTo(-1.95, 0.78);
  shape.lineTo(-1.3, 0.9);
  shape.lineTo(-0.85, 1.02);
  shape.lineTo(-0.55, 1.22);
  shape.lineTo(0.05, 1.32);
  shape.lineTo(0.75, 1.33);
  shape.lineTo(1.25, 1.24);
  shape.lineTo(1.85, 1.0);
  shape.lineTo(2.05, 0.86);
  shape.lineTo(2.2, 0.66);
  shape.lineTo(2.27, 0.4);
  shape.lineTo(2.27, 0.18);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.85,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 3,
  });
  geo.translate(0, 0, -1.85 / 2 - 0.08);
  const body = new THREE.Mesh(geo, paint);
  g.add(body);

  // 后轮拱隆起（911 宽大后翼子板）
  const fenderMat = paint;
  for (const sgn of [1, -1]) {
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), fenderMat);
    haunch.scale.set(0.7, 0.55, 0.5);
    haunch.position.set(1.45, 0.45, sgn * 0.95);
    g.add(haunch);

    const front = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14), fenderMat);
    front.scale.set(0.6, 0.5, 0.45);
    front.position.set(-1.45, 0.42, sgn * 0.9);
    g.add(front);
  }

  // 前大灯（圆灯家族特征）
  for (const sgn of [1, -1]) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      mat({ color: 0x0a0e12, metalness: 0.2, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })
    );
    lamp.scale.set(0.5, 0.6, 1);
    lamp.position.set(-2.05, 0.66, sgn * 0.62);
    g.add(lamp);
  }

  // 尾灯横条（贯穿式 "PORSCHE" 字标区）
  const tailBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.12, 1.5),
    mat({ color: 0x160a0a, metalness: 0.2, roughness: 0.2, emissive: 0x661111, emissiveIntensity: 0.5 })
  );
  tailBar.position.set(2.22, 0.78, 0);
  g.add(tailBar);

  addEdges(g, 0x6b7178, 0.08);
  return g;
}

/** 水平对置六缸（boxer）双涡轮发动机：后置、横置气缸 */
function buildEngine(): THREE.Group {
  const g = new THREE.Group();

  // 曲轴箱（扁平方块）
  const caseBlock = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.5, 1.1),
    metalMaterial(0x8a8f93, 0.4, 0.95)
  );
  g.add(caseBlock);

  // 两列水平气缸（向 ±Z 伸出，boxer 特征）
  for (const sgn of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.5, 18),
        metalMaterial(0xb6bbc0, 0.35, 0.9)
      );
      cyl.rotation.x = Math.PI / 2; // 轴向沿 Z
      cyl.position.set(-0.25 + i * 0.25, 0.05, sgn * 0.7);
      g.add(cyl);
      // 缸头
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.26, 0.2),
        metalMaterial(0x70757a, 0.45, 0.9)
      );
      head.position.set(-0.25 + i * 0.25, 0.05, sgn * 1.0);
      g.add(head);
    }
  }

  // 双涡轮增压器（两端）
  for (const sgn of [1, -1]) {
    const turbo = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 12),
      metalMaterial(0x5a5560, 0.5, 1)
    );
    turbo.position.set(0.5, -0.05, sgn * 0.45);
    g.add(turbo);
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.3, 14),
      metalMaterial(0x6e6a66, 0.5, 1)
    );
    housing.rotation.z = Math.PI / 2;
    housing.position.set(0.6, -0.05, sgn * 0.45);
    g.add(housing);
  }

  // 进气歧管
  const intake = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.18, 0.9),
    mat({ color: 0x2b2f33, metalness: 0.4, roughness: 0.6 })
  );
  intake.position.set(-0.1, 0.32, 0);
  g.add(intake);

  addEdges(g, 0x6e6a66, 0.1);
  return g;
}

/** 8 速 PDK 双离合变速箱（横置在发动机前方） */
function buildPDK(): THREE.Group {
  const g = new THREE.Group();
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.55, 0.9),
    metalMaterial(0x767b80, 0.45, 0.92)
  );
  g.add(housing);

  // 两个离合器鼓
  for (const sgn of [1, -1]) {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.18, 20),
      metalMaterial(0x9aa0a4, 0.4, 0.95)
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0.1, 0, sgn * 0.3);
    g.add(drum);
  }

  // 传动轴（伸向后桥）
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 1.4, 12),
    metalMaterial(0x6e6a66, 0.5, 1)
  );
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(-0.9, -0.1, 0);
  g.add(shaft);

  addEdges(g, 0x6e6a66, 0.1);
  return g;
}

/** 车轮 + 轮胎（前后混合尺寸）+ 制动盘 */
function buildWheels(): THREE.Group {
  const g = new THREE.Group();
  const tyreMat = mat({ color: 0x0d0f12, metalness: 0.1, roughness: 0.92 });
  const rimMat = metalMaterial(0xc4c9ce, 0.3, 1);
  const discMat = mat({ color: 0x6a6f74, metalness: 0.7, roughness: 0.4 });

  const defs: { x: number; z: number; r: number; w: number; disc: number }[] = [
    { x: -1.225, z: 0.79, r: 0.34, w: 0.245, disc: 0.3 }, // 前 245/35 R20
    { x: -1.225, z: -0.79, r: 0.34, w: 0.245, disc: 0.3 },
    { x: 1.225, z: 0.78, r: 0.36, w: 0.305, disc: 0.32 }, // 后 305/30 R21
    { x: 1.225, z: -0.78, r: 0.36, w: 0.305, disc: 0.32 },
  ];

  defs.forEach(({ x, z, r, w, disc }) => {
    const wheel = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 28), tyreMat);
    tyre.rotation.x = Math.PI / 2;
    wheel.add(tyre);

    // 轮辋（五辐示意）
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.62, w * 0.6, 24), rimMat);
    rim.rotation.x = Math.PI / 2;
    wheel.add(rim);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(r * 0.5, 0.04, 0.05), rimMat);
      spoke.position.set(0, 0, 0);
      spoke.rotation.z = a;
      spoke.translateX(r * 0.3);
      wheel.add(spoke);
    }

    // 制动盘
    const brakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(disc, disc, 0.04, 28), discMat);
    brakeDisc.rotation.x = Math.PI / 2;
    brakeDisc.position.z = z > 0 ? w * 0.5 + 0.02 : -w * 0.5 - 0.02;
    wheel.add(brakeDisc);

    wheel.position.set(x, r, z);
    g.add(wheel);
  });

  addEdges(g, 0x6e6a66, 0.08);
  return g;
}

/** 悬架：前麦弗逊 + 后多连杆（简化） */
function buildSuspension(): THREE.Group {
  const g = new THREE.Group();
  const armMat = metalMaterial(0x7d8388, 0.45, 0.9);

  const axles = [
    { x: -1.225, z: 0.79 }, { x: -1.225, z: -0.79 },
    { x: 1.225, z: 0.78 }, { x: 1.225, z: -0.78 },
  ];
  axles.forEach(({ x, z }, idx) => {
    const isFront = idx < 2;
    // 减振柱（麦弗逊：前；多连杆：后简化为柱）
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 10), armMat);
    strut.position.set(x, 0.2, z * 0.92);
    g.add(strut);
    // 下控制臂
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.1), armMat);
    arm.position.set(x, 0.05, z * 0.85);
    g.add(arm);
    if (!isFront) {
      // 后多连杆：再加两根连杆
      for (const off of [0.12, -0.12]) {
        const link = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.06), armMat);
        link.position.set(x + off, 0.08, z * 0.8);
        g.add(link);
      }
    }
  });

  addEdges(g, 0x6e6a66, 0.1);
  return g;
}

/** 排气：双出尾管 */
function buildExhaust(): THREE.Group {
  const g = new THREE.Group();
  const pipeMat = metalMaterial(0x8a8f93, 0.35, 1);
  for (const sgn of [1, -1]) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16),
      pipeMat
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(2.0, 0.18, sgn * 0.32);
    g.add(pipe);
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.1, 16),
      metalMaterial(0xb6bbc0, 0.3, 1)
    );
    tip.rotation.z = Math.PI / 2;
    tip.position.set(2.25, 0.18, sgn * 0.32);
    g.add(tip);
  }
  addEdges(g, 0x6e6a66, 0.1);
  return g;
}

export function porsche911(): Subject {
  const layers: Layer[] = [];

  layers.push({
    id: 'body',
    name: '车身（标志性溜背轮廓）',
    group: '车身',
    explodeDir: U(0, 1.8, 0),
    explodeScale: 0.34,
    sectionable: true,
    build: buildBody,
    hotspots: [
      {
        id: 'silhouette',
        title: '911 的灵魂：长车头 + 溜背',
        anchor: U(0.4, 1.3, 0),
        body: `911 一眼可辨的，是这副<b>长车头、低矮、向后溜的快背（fastback）</b>轮廓。它从 1963 年初代 901 延续至今，是汽车设计里最固执的血脉之一。
        后置后驱布局决定了车头可以很长、座舱靠后——这是 911 比例美学的物理根源。`,
        stats: [
          { label: '车长', value: '4,542 mm' },
          { label: '车高', value: '1,303 mm' },
          { label: '轴距', value: '2,450 mm' },
          { label: '风阻 Cd', value: '0.29' },
        ],
      },
    ],
  });

  layers.push({
    id: 'flat6',
    name: '水平对置六缸（3.0T）',
    group: '动力',
    explodeDir: U(1.4, -0.8, 0),
    explodeScale: 0.45,
    sectionable: true,
    build: buildEngine,
    hotspots: [
      {
        id: 'flat6',
        title: '3.0L 双涡轮水平对置六缸',
        anchor: U(1.6, 0.1, 0.6),
        body: `911 的心脏是<b>水平对置六缸（boxer）</b>——六只气缸分两列水平对置，活塞像拳击手一样左右对冲。
        这种结构重心极低、运转平顺，是 911 后置后驱操控的根基。
        <table>
        <tr><td>排量</td><td>2,981 cm³（3.0 L）</td></tr>
        <tr><td>缸径 × 冲程</td><td>91.0 × 76.4 mm</td></tr>
        <tr><td>压缩比</td><td>10.2 : 1</td></tr>
        <tr><td>最大功率</td><td>353 kW / 480 PS</td></tr>
        <tr><td>最大扭矩</td><td>530 Nm（2,300–5,000 rpm）</td></tr>
        <tr><td>红线</td><td>7,500 rpm</td></tr>
        </table>
        双涡轮增压 + 缸内直喷 + 颗粒捕捉器；代号 DKKA（992 II）。`,
        stats: [
          { label: '排量', value: '2,981 cm³' },
          { label: '功率', value: '480 PS / 353 kW' },
          { label: '扭矩', value: '530 Nm' },
          { label: '布局', value: '后置后驱 boxer' },
        ],
      },
    ],
  });

  layers.push({
    id: 'pdk',
    name: '8 速 PDK 双离合',
    group: '传动',
    explodeDir: U(0.6, -1.2, 0),
    explodeScale: 0.42,
    sectionable: true,
    build: buildPDK,
    hotspots: [
      {
        id: 'pdk',
        title: 'PDK：911 的传动灵魂',
        anchor: U(1.3, 0, 0),
        body: `<b>PDK（Porsche Doppelkupplung，双离合）</b>是 911 的标志性变速箱。
        两套离合器分别管奇数/偶数挡，换挡时下一挡已预选好——所以快且平顺。
        8 速版本（992 起）还把 1 挡做得极短，提升起步，8 挡极长，压低巡航转速省油。
        911 的发动机在车尾，变速箱是<b>横置在发动机前方的 transaxle</b>（传动轴再伸回后桥），目的是把重量压在轴距之间、平衡前后配重。`,
        stats: [
          { label: '类型', value: '8 速双离合' },
          { label: '布局', value: '后置横置 transaxle' },
          { label: '驱动', value: '后轮驱动' },
        ],
      },
    ],
  });

  layers.push({
    id: 'wheels',
    name: '车轮与轮胎（20"/21" 混合）',
    group: '行走',
    explodeDir: U(0, -0.6, 1.8),
    explodeScale: 0.32,
    sectionable: false,
    build: buildWheels,
    hotspots: [
      {
        id: 'wheels',
        title: '前后混合尺寸：转向 vs 抓地',
        anchor: U(1.225, 0.36, 0.78),
        body: `911 用<b>前窄后宽</b>的混合胎（前 245/35 R20，后 305/30 R21）——这是后置后驱的标配逻辑：
        窄前胎减轻转向负担、提升响应；宽后胎把 480 PS 稳稳抓在地上。
        轮辋内是通风制动盘（前 350 mm），PCCB 陶瓷复合盘可选。`,
        stats: [
          { label: '前轮', value: '245/35 ZR20' },
          { label: '后轮', value: '305/30 ZR21' },
          { label: '前制动', value: '350 mm 通风盘' },
        ],
      },
    ],
  });

  layers.push({
    id: 'suspension',
    name: '悬架（前麦弗逊 / 后多连杆）',
    group: '底盘',
    explodeDir: U(-1.2, -1.0, 0),
    explodeScale: 0.4,
    sectionable: false,
    build: buildSuspension,
    hotspots: [
      {
        id: 'suspension',
        title: '前麦弗逊 + 后多连杆',
        anchor: U(-1.225, 0.2, 0.79),
        body: `992 全系前轮用<b>麦弗逊支柱</b>（结构紧凑、给车头让空间），后轮用<b>多连杆</b>（精确控制后置后驱的后轴几何）。
        标配 PASM 主动悬架，可选后轮转向（4WS）——低速更灵活、高速更稳。`,
        stats: [
          { label: '前悬', value: '麦弗逊支柱' },
          { label: '后悬', value: '多连杆' },
          { label: '选装', value: '后轮转向 4WS / PASM' },
        ],
      },
    ],
  });

  layers.push({
    id: 'exhaust',
    name: '运动排气（双出尾管）',
    group: '动力',
    explodeDir: U(1.8, -0.4, 0),
    explodeScale: 0.38,
    sectionable: false,
    build: buildExhaust,
    hotspots: [
      {
        id: 'exhaust',
        title: '运动排气',
        anchor: U(2.2, 0.18, 0.32),
        body: `911 的声浪是产品的一部分。Carrera S 标配运动排气（尾管银色），阀门可在运动模式下开启，让六缸 boxer 的扁嗓音更通透。`,
        stats: [
          { label: '尾管', value: '双出（银色）' },
          { label: '选装', value: '运动排气阀门' },
        ],
      },
    ],
  });

  return {
    id: 'porsche911',
    name: 'Porsche 911 Carrera S',
    subtitle: 'Porsche · 992 II（2025） · 后置后驱跑车',
    tagline: '3.0T 水平对置六缸 480 PS，0–100 3.3s，极致平衡',
    background: 0xeef1f4,
    accent: '#b11226',
    camera: { position: [6.5, 3.6, 7.5], target: [0, 0.4, 0] },
    explodeScale: 1.0,
    sectionable: true,
    repairability: {
      score: 5,
      difficulty: '中等',
      tools: ['Porsche 专用诊断仪（PIWIS）', '发动机举升与支撑工装', 'PDK 专用拆装工具', '扭矩 wrench 套装', '四轮定位设备'],
      note: '工程评估：后置后驱使发动机易接近，但 PDK、四轮定位与电子系统需专用设备，整体中等',
    },
    fidelity: {
      actualParts: 1,
      source: '整车约 1.2 万+ 零件；3.0T 水平对置六缸（DKKA）含缸体、缸盖、双涡轮等大量部件',
      modeledLayers: 6,
      modeledParts: 78,
      note: '按公开技术规格参数化重建，非工程图纸复刻。外形与子系统布局为结构示意，尺寸与参数以 Porsche 官方技术数据为准。',
    },
    layers,
    headline: [
      { label: '功率', value: '480', unit: 'PS' },
      { label: '扭矩', value: '530', unit: 'Nm' },
      { label: '0–100', value: '3.3', unit: 's' },
      { label: '极速', value: '308', unit: 'km/h' },
    ],
    overview: `保时捷 911 Carrera S（<b>992 II，2025</b>）是 911 家族的中坚，坚持<b>后置后驱</b>这一自 1963 年以来的血脉。
    车长 4,542 mm、车高 1,303 mm、轴距 2,450 mm，整备质量 <b>1,540 kg</b>（DIN），油箱 63 L，前备厢 135 L，风阻系数 Cd 0.29。
    动力是<b>3.0 L 双涡轮水平对置六缸</b>（2,981 cm³，缸径 91.0 × 冲程 76.4 mm，压缩比 10.2:1）：最大功率 <b>353 kW / 480 PS</b>、最大扭矩 530 Nm（2,300–5,000 rpm）、红线 7,500 rpm。
    匹配<b>8 速 PDK 双离合</b>，0–100 km/h <b>3.3–3.5 s</b>，极速 308 km/h。底盘前麦弗逊 / 后多连杆，前后轮采用 20"/21" 混合胎宽。
    建模说明：按公开技术规格参数化重建，非工程图纸复刻；外形与子系统为结构示意，尺寸与参数以 Porsche 官方技术数据为准。`,
    narrative: [
      `<b>后置后驱是 911 的全部理由，也是全部麻烦</b>：发动机在车尾，重量天然压在后轴，带来无可替代的转向特性和牵引。代价是车头很轻、重心转移剧烈——911 的驾驶乐趣和难开，都来自这同一个事实。`,
      `<b>boxer 发动机为什么低</b>：六缸水平对置，活塞左右对冲，整台机器又扁又低，重心贴地。这是 911 过弯稳的根。但扁也意味着维修空间紧张、散热布局特殊。`,
      `<b>PDK 是双离合的工业标杆</b>：两套离合器预选挡位，换挡几乎无动力中断。8 速版本把 1 挡做极短（起步猛）、8 挡极长（巡航省油），是性能与日常的两全。`,
      `<b>前后混合胎宽</b>：前 245/35 R20 减轻转向负担、提升响应；后 305/30 R21 把 480 PS 抓在地上。后置后驱必须靠宽后胎消化动力，这是物理，不是风格。`,
    ],
    specs: [
      { label: '代次', value: '992 II（2025）' },
      { label: '车身', value: '2 门 coupe · 后置后驱' },
      { label: '车长', value: '4,542 mm' },
      { label: '车宽', value: '1,852 mm（含镜 2,033）' },
      { label: '车高', value: '1,303 mm' },
      { label: '轴距', value: '2,450 mm' },
      { label: '整备质量', value: '1,540 kg（DIN）' },
      { label: '油箱', value: '63 L' },
      { label: '前备厢', value: '135 L' },
      { label: '风阻 Cd', value: '0.29' },
      { label: '发动机', value: '3.0 L 双涡轮水平对置六缸' },
      { label: '排量', value: '2,981 cm³' },
      { label: '缸径 × 冲程', value: '91.0 × 76.4 mm' },
      { label: '压缩比', value: '10.2 : 1' },
      { label: '最大功率', value: '353 kW / 480 PS' },
      { label: '最大扭矩', value: '530 Nm @ 2,300–5,000 rpm' },
      { label: '红线', value: '7,500 rpm' },
      { label: '变速箱', value: '8 速 PDK 双离合' },
      { label: '0–100 km/h', value: '3.3–3.5 s' },
      { label: '极速', value: '308 km/h' },
      { label: '前悬', value: '麦弗逊支柱' },
      { label: '后悬', value: '多连杆' },
      { label: '前轮', value: '245/35 ZR20' },
      { label: '后轮', value: '305/30 ZR21' },
      { label: '前制动', value: '350 mm 通风盘' },
    ],
    comparison: {
      title: '992 I → 992 II（Carrera S）',
      note: '基于 Porsche 官方技术数据整理',
      rows: [
        { label: '最大功率', prev: '450 PS（992 I）', curr: '480 PS（992 II）', delta: 'up' },
        { label: '0–100 km/h', prev: '3.7 s', curr: '3.3–3.5 s', delta: 'up' },
        { label: '缸径×冲程', prev: '91.0×76.4', curr: '91.0×76.4（同）', delta: 'flat' },
        { label: '车长', prev: '4,519 mm', curr: '4,542 mm', delta: 'up' },
        { label: '整备质量', prev: '1,515 kg', curr: '1,540 kg', delta: 'up' },
      ],
    },
  };
}
