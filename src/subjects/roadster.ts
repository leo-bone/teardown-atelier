import * as THREE from 'three';
import { metalMaterial, mat, carbonMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * Tesla Roadster（第二代）—— 2026-10-15 于得州McGregor SpaceX 试验场正式发布
 *
 * ⚠️ 可信度声明（这一台比站内其他任何一台都更需要说清楚）
 *
 * 2017-11 首次亮相 → 原定 2020 交付 → 多次跳票 → **2026-10-15 才首次公布实车**。
 * 也就是说：
 *   - 本模型依据的是**发布会当天公开的口头参数**，不是厂商技术文档
 *   - 该车**尚未量产**（官方口径 2028 年投产），因此**不存在任何真机拆解资料**
 *   - 「分层」与「分步」是**依据公开原理做的工程推断**，不是拆解实测记录
 *   - 各版本性能差异很大（Performance / Thrust / Rocket 三版），本站以 **Rocket 版**为建模基准，
 *     因为它是唯一完整包含 10 具推进器的版本，也就是"最酷"的那个
 *
 * 任何数字都标注了来源性质：官方口径 / 2017 年旧口径 / 推断。
 *
 * 场景单位：1 = 1 m（按 Roadster 量级取整，长约 4.7）
 */

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**车体主色：接近发布会的深灰钛金属感 */
const PAINT = 0x9aa0a6;

/**
 * 车身：低趴楔形 + 战斗机风格的硬折面。
 *
 * 与 911 那种"有机曲面"不同，这一代的设计语言明显向 Cybertruck 靠——
 * 折面、直线、切角。所以这里刻意用多段直线构成侧影，而不是圆滑曲线。
 */
function buildBody(): THREE.Group {
  const g = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: PAINT,
    metalness: 0.9,
    roughness: 0.34,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.9,
  });

  // 侧影（X = 车长，Y = 车高）：楔形前脸 + 低矮座舱 + 尾部截断
  const shape = new THREE.Shape();
  shape.moveTo(-2.35, 0.22);          // 前唇下沿
  shape.lineTo(-2.3, 0.46);
  shape.lineTo(-2.05, 0.6);           // 前风挡根部
  shape.lineTo(-1.35, 0.74);
  shape.lineTo(-0.72, 0.86);          // 风挡
  shape.lineTo(-0.1, 0.92);           // 座舱顶（前段）
  shape.lineTo(0.72, 0.9);
  shape.lineTo(1.5, 0.78);            // 后风挡溜下
  shape.lineTo(2.05, 0.7);
  shape.lineTo(2.28, 0.66);           // 尾部
  shape.lineTo(2.32, 0.44);
  shape.lineTo(2.28, 0.22);           // 尾部下沿
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.94,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -1.94 / 2 - 0.07);
  g.add(new THREE.Mesh(geo, paint));

  // 折面硬朗感：顶部两块斜切面片（fighter-jet 的 chine）
  for (const sgn of [1, -1]) {
    const chine = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.05, 0.42),
      mat({ color: 0x7f868c, metalness: 0.88, roughness: 0.38 })
    );
    chine.position.set(0.1, 0.78, sgn * 0.86);
    chine.rotation.x = sgn * 0.16;
    g.add(chine);
  }

  // 轮拱（前后各一对，棱角化）
  for (const [ax, r] of [[-1.42, 0.52], [1.46, 0.56]] as [number, number][]) {
    for (const sgn of [1, -1]) {
      const arch = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.34, 12, 1, false, 0, Math.PI),
        paint
      );
      arch.rotation.x = Math.PI / 2;
      arch.rotation.z = Math.PI / 2;
      arch.position.set(ax, 0.44, sgn * 0.9);
      g.add(arch);
    }
  }

  // 前脸贯穿灯带
  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.07, 1.5),
    mat({ color: 0x0b0f14, metalness: 0.2, roughness: 0.15, emissive: 0x2a6ea8, emissiveIntensity: 0.7 })
  );
  lightBar.position.set(-2.32, 0.5, 0);
  g.add(lightBar);

  // 尾部推进器舱盖（"007 式"翻车牌设计在此层留出开口）
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.06, 1.1),
    mat({ color: 0x6e747a, metalness: 0.85, roughness: 0.42 })
  );
  deck.position.set(1.86, 0.68, 0);
  g.add(deck);

  addEdges(g, 0x5f666c, 0.1);
  return g;
}

/**
 * 地面风扇吸附系统 —— Performance 版的招牌。
 *
 * 发布会明确说了：过弯横向加速度可达 2G，靠的是"地面风扇吸附系统"。
 * 工程上这不是吸盘而是**伯努利下压**：车底风扇把空气向下吹，用地面反作用力
 * 把车压住。所以模型里表现为车底一圈风扇喷口+ 扩散盘。
 */
function buildGroundSuction(): THREE.Group {
  const g = new THREE.Group();
  const cf = carbonMaterial();

  // 底部扩散板
  const plate = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.05, 1.7), cf);
  plate.position.set(0, 0.14, 0);
  g.add(plate);

  // 前部主风扇喷口（横向双侧）
  for (const sgn of [1, -1]) {
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 14), cf);
    duct.position.set(-1.3, 0.08, sgn * 0.6);
    g.add(duct);
    // 风扇叶片
    const fan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.03, 10),
      metalMaterial(0x8f959b, 0.35, 0.95)
    );
    fan.position.set(-1.3, 0.03, sgn * 0.6);
    g.add(fan);
  }

  // 后部风扇组
  for (const sgn of [1, -1]) {
    const fan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12),
      metalMaterial(0x8f959b, 0.32, 0.95)
    );
    fan.position.set(1.15, 0.08, sgn * 0.62);
    g.add(fan);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 16), cf);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(1.15, 0.08, sgn * 0.62);
    g.add(ring);
  }

  // 侧面裙边导流
  for (const sgn of [1, -1]) {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.1), cf);
    skirt.position.set(0, 0.12, sgn * 0.92);
    g.add(skirt);
  }

  addEdges(g, 0x4b5157, 0.14);
  return g;
}

/**
 * 三电机四轮驱动动力总成。
 *
 * 官方口径：三电机（1 前 + 2 后）、轮上扭矩 10,000 N·m。
 * 注意"轮上扭矩"和"电机扭矩"差一个减速比，这个数不是电机的输出扭矩。
 */
function buildPowertrain(): THREE.Group {
  const g = new THREE.Group();
  const cf = carbonMaterial();

  // 前电机（单电机，接近前轴）
  const frontMotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.46, 18),
    metalMaterial(0x8d9298, 0.34, 0.96)
  );
  frontMotor.rotation.x = Math.PI / 2;
  frontMotor.position.set(-1.32, 0.42, 0);
  g.add(frontMotor);

  // 逆变器 + 高压线束
  const inv = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.34), mat({ color: 0x1d3a34, metalness: 0.2, roughness: 0.6 }));
  inv.position.set(-0.92, 0.44, 0.32);
  g.add(inv);

  // 后双电机（2 后）
  for (const sgn of [1, -1]) {
    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.42, 18),
      metalMaterial(0x8d9298, 0.34, 0.96)
    );
    motor.rotation.x = Math.PI / 2;
    motor.position.set(1.42, 0.44, sgn * 0.38);
    g.add(motor);

    // 半轴
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10),
      metalMaterial(0xb0b6bb, 0.28, 1)
    );
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(1.42, 0.44, sgn * 0.72);
    g.add(shaft);
  }

  // 减速齿轮组（10,000 N·m 轮上扭矩的来源）
  const gearBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.5), metalMaterial(0x767b80, 0.42, 0.92));
  gearBox.position.set(1.1, 0.42, 0);
  g.add(gearBox);

  // 橙色调的高压线束（安全色，真实车辆也这样走线）
  const hv = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.03, 6, 20, Math.PI * 1.1),
    mat({ color: 0xd4621f, metalness: 0.1, roughness: 0.7 })
  );
  hv.rotation.y = Math.PI / 2;
  hv.position.set(-0.3, 0.36, 0);
  g.add(hv);

  addEdges(g, 0x5a6066, 0.12);
  return g;
}

/**
 * 动力电池包。
 *
 * 关键事实：续航从 2017 年宣称的约 1000 km **下调到约 483 km（300 mi）**。
 * 这不是缩水，是把约 200 kWh 的电池塞进一台两座跑车后对重量的妥协——
 * 早期分析普遍认为 200 kWh + 跑车整备质量在物理上非常紧张。
 * 这里如实呈现下调后的事实，并说明原因推断。
 */
function buildBattery(): THREE.Group {
  const g = new THREE.Group();

  // 主电池包（碳纤维壳体）
  const pack = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.26, 1.5), carbonMaterial());
  pack.position.set(-0.1, 0.32, 0);
  g.add(pack);

  // 电芯阵列分格（可见的分层）
  for (let i = 0; i < 4; i++) {
    const mod = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.24, 1.42),
      mat({ color: 0x2b3f38, metalness: 0.25, roughness: 0.55 })
    );
    mod.position.set(-1.0 + i * 0.6, 0.32, 0);
    g.add(mod);
  }

  // 电池管理系统 + 接触器
  const bms = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.12, 0.24),
    mat({ color: 0x14201c, metalness: 0.3, roughness: 0.5 })
  );
  bms.position.set(0.95, 0.44, -0.5);
  g.add(bms);

  // 冷却回路（两座跑车 + 约 200 kWh 必须强化热管理）
  for (const sgn of [1, -1]) {
    const line = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.3, 10),
      mat({ color: 0x2f6fa8, metalness: 0.3, roughness: 0.5 })
    );
    line.rotation.z = Math.PI / 2;
    line.position.set(-0.1, 0.46, sgn * 0.62);
    g.add(line);
  }

  addEdges(g, 0x4e5a56, 0.12);
  return g;
}

/**
 * ★ A71 冷气推进系统 —— 这台车真正的"怪物"
 *
 * 与 SpaceX 联合开发，内部代号 A71，源自航天器姿控模块。
 * 官方披露：约 10 具推进器、600 L 压缩空气储存、总推力超 80 kN、气罐可再充。
 * 发动机工程副总裁 Lars Moravy 明确说"车内可用空间几乎被碳纤维压力容器填满"。
 *
 * 工程原理很直白：压缩空气经阀门定向喷出→ 反作用力。
 * 没有燃烧、没有火焰，所以它不是火箭，是**冷气推力**。
 * 用途是短时姿态/压下力调整，不产生持续升力。
 */
function buildThrusters(): THREE.Group {
  const g = new THREE.Group();
  const cf = carbonMaterial();
  const nozzle = metalMaterial(0x767c82, 0.3, 0.98);

  // ---- 喷口本体：尾部 4 具 + 车身周围 6 具 = 10 具 ----
  // 尾部主推进器（车牌翻起处的四个大喷口）
  for (const [dx, dz] of [[0, 0.52], [0, 0.18], [0, -0.18], [0, -0.52]] as [number, number][]) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.3, 14), nozzle);
    n.rotation.x = Math.PI / 2;
    n.position.set(2.18, 0.68, dz);
    n.position.x += dx;
    g.add(n);
    // 喷口内壁（暗色，读起来才有"孔"的深度）
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.115, 0.3, 12),
      mat({ color: 0x14181c, metalness: 0.4, roughness: 0.6 })
    );
    inner.rotation.x = Math.PI / 2;
    inner.position.copy(n.position);
    g.add(inner);
  }

  // 车身周围姿控喷口（俯仰/滚转/偏航）
  const corners: [number, number, number][] = [
    // 上向前
    [-1.0, 0.86, 0.62], [-1.0, 0.86, -0.62],
    // 上向后
    [1.5, 0.76, 0.6], [1.5, 0.76, -0.6],
    // 侧向中部
    [-0.2, 0.5, 0.9], [-0.2, 0.5, -0.9],
  ];
  for (const [x, y, z] of corners) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.18, 12), nozzle);
    n.rotation.z = Math.PI / 2;
    n.position.set(x, y, z);
    g.add(n);
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.18, 10),
      mat({ color: 0x14181c, metalness: 0.4, roughness: 0.6 })
    );
    inner.rotation.z = Math.PI / 2;
    inner.position.set(x, y, z);
    g.add(inner);
  }

  // ---- 高压储气罐：碳纤维压力容器，官方说几乎填满车内 ----
  // 用一组圆柱+ 球形端盖表达"缠绕碳纤维瓶"
  const tankMat = carbonMaterial();
  for (const [x, z, r] of [[-0.35, 0.42, 0.26], [-0.35, -0.42, 0.26], [0.35, 0.42, 0.26], [0.35, -0.42, 0.26]] as [number, number, number][]) {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.0, 16), tankMat);
    bottle.rotation.z = Math.PI / 2;
    bottle.position.set(x, 0.62, z);
    g.add(bottle);
    for (const sgn of [1, -1]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), tankMat);
      cap.position.set(x + sgn * 0.5, 0.62, z);
      g.add(cap);
    }
    // 高压阀组
    const valve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.16, 10),
      metalMaterial(0xb8bec3, 0.25, 1)
    );
    valve.position.set(x, 0.62 + r + 0.06, z);
    g.add(valve);
  }

  // 气体总管（连接储气罐与喷口）
  const manifold = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 3.4, 12),
    metalMaterial(0x9aa0a6, 0.28, 1)
  );
  manifold.rotation.z = Math.PI / 2;
  manifold.position.set(0.2, 0.86, 0);
  g.add(manifold);

  addEdges(g, 0x666c72, 0.16);
  return g;
}

/** 座舱与"最后一辆手动驾驶车"的仪式感 */
function buildCabin(): THREE.Group {
  const g = new THREE.Group();

  // 玻璃顶舱（可拆卸玻璃顶是 Roadster 传统）
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.04, 1.3),
    mat({ color: 0x0f151b, metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.4, clearcoat: 1 })
  );
  canopy.position.set(-0.15, 0.9, 0);
  g.add(canopy);

  // 双座桶椅
  for (const sgn of [1, -1]) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.5, 0.42),
      mat({ color: 0x2a2e33, metalness: 0.1, roughness: 0.72 })
    );
    seat.position.set(-0.42, 0.72, sgn * 0.36);
    seat.rotation.x = -0.12;
    g.add(seat);
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.56, 0.42),
      mat({ color: 0x2a2e33, metalness: 0.1, roughness: 0.72 })
    );
    back.position.set(-0.78, 0.86, sgn * 0.36);
    back.rotation.x = 0.22;
    g.add(back);
  }

  // 方向盘（Y 形轭 + 平直底）
  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.028, 8, 20),
    mat({ color: 0x1a1e22, metalness: 0.3, roughness: 0.5 })
  );
  wheel.rotation.y = Math.PI / 2;
  wheel.rotation.x = 0.42;
  wheel.position.set(-1.16, 0.78, 0.3);
  g.add(wheel);

  // 中控屏
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.16, 0.42),
    mat({ color: 0x0a0e13, metalness: 0.2, roughness: 0.1, emissive: 0x1a3a5a, emissiveIntensity: 0.4 })
  );
  screen.position.set(-1.02, 0.78, -0.28);
  g.add(screen);

  addEdges(g, 0x4a5057, 0.16);
  return g;
}

export function roadster2(): Subject {
  const layers: Layer[] = [];

  layers.push({
    id: 'body',
    name: '车身（钛金属· 战斗机折面）',
    group: '车身',
    explodeDir: U(0, 1.9, 0),
    explodeScale: 0.32,
    sectionable: true,
    build: buildBody,
    hotspots: [
      {
        id: 'silhouette',
        title: '楔形折面：向 Cybertruck 靠拢的设计语言',
        anchor: U(0.2, 1.0, 0),
        body: `这一代的设计语言明显<b>从 911 式的有机曲面转向硬折面</b>——发布前预热图就被普遍认为"接近 Cybertruck"。前脸贯穿灯带、切角轮拱、顶部chine折线，都是战斗机（F-35 式）的语汇。

马斯克这次的说法很直接：Roadster 的定位不是"更快的电动跑车"，而是<b>"最后一款人类驾驶的特斯拉"</b>——其余车型全面转向自动驾驶后，手动驾驶的乐趣需要一个图腾来承载。

值得注意：车身大量使用<b>钛、镁与碳纤维</b>。约 200 kWh 的电池要塞进一台两座跑车，整备质量目标被马斯克压到 4,500 lb（约 2,040 kg）以内——这个重量下，钢制车身基本不可能成立。`,
        stats: [
          { label: '设计语言', value: '硬折面 · 战斗机风格' },
          { label: '材料', value: '钛 / 镁 / 碳纤维' },
          { label: '整备质量目标', value: '< 4,500 lb（官方口径）' },
          { label: '定位', value: '最后一辆手动驾驶特斯拉' },
        ],
      },
    ],
  });

  layers.push({
    id: 'suction',
    name: '地面风扇吸附系统（2G 横向）',
    group: '气动',
    explodeDir: U(0, -1.3, 0),
    explodeScale: 0.3,
    sectionable: false,
    build: buildGroundSuction,
    hotspots: [
      {
        id: 'fan-suction',
        title: '用风扇把车按在地上',
        anchor: U(1.15, 0.1, 0.62),
        body: `Performance 版的招牌能力：<b>过弯横向加速度可达 2G</b>。做法不是吸盘，而是车底一排<b>风扇向下吹气</b>，靠地面反作用力把车压住——原理上是伯努利下压，工程上属于主动气动。

这个思路在赛车里并不新鲜（地面效应车），但用在量产公路车上是第一次。它解决的是一个物理矛盾：<b>10,000 N·m 的轮上扭矩 + 极短轴距</b>，轮胎抓地力先于动力饱和，不加下压力就只是空转。

<br><b>注意</b>：这类系统在公路上是否合法、能否量产，是悬而未决的问题。发布会现场马斯克自己也承认"不确定在所有司法管辖区都合法，但会有人能拥有这样的车"。`,
        stats: [
          { label: '横向加速度', value: '最大约 2G（官方口径）' },
          { label: '原理', value: '车底风扇 · 伯努利下压' },
          { label: '法规定位', value: '赛车/特技属性为主' },
        ],
      },
    ],
  });

  layers.push({
    id: 'powertrain',
    name: '三电机四驱（轮上10,000 N·m）',
    group: '动力',
    explodeDir: U(1.5, -0.7, 0),
    explodeScale: 0.4,
    sectionable: true,
    build: buildPowertrain,
    hotspots: [
      {
        id: 'tri-motor',
        title: '1 前 + 2 后：轮上 10,000 N·m',
        anchor: U(1.42, 0.44, 0.38),
        body: `三电机布局：<b>前轴单电机、后轴双电机</b>。后轴双电机的意义不只是更快——它能做<b>独立扭矩矢量</b>，左右轮可以分别给不同扭矩，过弯时主动抵消横摆。

官方口径是<b>轮上扭矩 10,000 N·m</b>。这个数字要看清楚：它是<b>经过减速齿轮放大后</b>的轮端扭矩，不是电机本身的输出扭矩。电机额定扭矩通常只有几百 N·m，10,000 N·m 来自减速比。

<table>
<tr><td>布局</td><td>三电机 AWD（1 前 / 2 后）</td></tr>
<tr><td>轮上扭矩</td><td>10,000 N·m（官方口径）</td></tr>
<tr><td>0–60 mph</td><td>Performance &lt;1.6s · Thrust &lt;0.9s · Rocket &lt;0.59s</td></tr>
<tr><td>极速</td><td>超230 mph（约 370 km/h）</td></tr>
</table>

三个版本的能力跨度极大：<b>Performance</b> 走公路，<b>Thrust</b> 加后置冷气推进器上赛道，<b>Rocket</b> 约 10 具推进器齐全、单座、主打特技。`,
        stats: [
          { label: '电机', value: '三电机（1 前 + 2 后）' },
          { label: '轮上扭矩', value: '10,000 N·m' },
          { label: 'Rocket 版0–60', value: '< 0.59 s' },
          { label: '极速', value: '> 370 km/h' },
        ],
      },
    ],
  });

  layers.push({
    id: 'battery',
    name: '动力电池（约 200 kWh）',
    group: '能源',
    explodeDir: U(-1.4, -0.6, 0),
    explodeScale: 0.36,
    sectionable: true,
    build: buildBattery,
    hotspots: [
      {
        id: 'pack',
        title: '续航从 1000 km 下调到 483 km',
        anchor: U(-0.1, 0.32, 0),
        body: `这是整场发布会<b>最重要的一次参数回调</b>。

2017 年首次亮相时，官方宣称续航约 <b>1,000 km（620 mi）</b>；这次发布改口为<b>约 483 km（300 mi）</b>，且三个版本一致。

为什么降？物理上讲得通：620 mi 需要约 200 kWh 电池（按 3.2 mi/kWh 反推），而 200 kWh 大约是 Model S Plaid 的<b>两倍</b>。GMC Hummer EV 用 212 kWh 时整备质量已超过 9,000 lb。把 200 kWh 塞进一台目标 4,500 lb 的两座跑车，在重量、热管理、碰撞安全之间必须做取舍——<b>续航是第一个被牺牲的</b>。

代价换来的是：<b>1,000+hp 量级的轮端动力与 0.59 s 加速</b>。这是把"跑得快"放在"跑得远"前面的明确取舍，也是这一代最核心的产品逻辑。

另一个现实参考：同场发布的次日（2026-10-16），A 股汽车零部件板块集体异动，<b>16 只涨停</b>——市场读出的方向是轻量化与储气压铸，而不是续航焦虑。`,
        stats: [
          { label: '容量', value: '约 200 kWh（推断）' },
          { label: '续航（2026 口径）', value: '约 483 km / 300 mi' },
          { label: '续航（2017 旧口径）', value: '约 1,000 km / 620 mi' },
          { label: '取舍', value: '为减重牺牲续航' },
        ],
      },
    ],
  });

  layers.push({
    id: 'thrusters',
    name: '★ A71 冷气推进系统（10 具 · 80 kN）',
    group: '推进',
    explodeDir: U(1.7, 0.8, 0),
    explodeScale: 0.5,
    sectionable: false,
    build: buildThrusters,
    hotspots: [
      {
        id: 'a71',
        title: 'A71：把火箭发动机装进跑车',
        anchor: U(2.18, 0.68, 0),
        body: `<b>这是整台车真正的"怪物"，也是 2017 年至今唯一没变的承诺。</b>

与 SpaceX 联合开发，内部代号 <b>A71</b>，技术源自航天器<b>姿控模块</b>。发布会披露的官方口径：

<table>
<tr><td>推进器数量</td><td>约 10 具（尾部 4 + 车身周围 6）</td></tr>
<tr><td>总推力</td><td>&gt; 80 kN（工程副总裁 Lars Moravy）</td></tr>
<tr><td>储气</td><td>600 L 压缩空气 · 碳纤维压力容器· 可再充</td></tr>
<tr><td>介质</td><td>冷气（无燃烧、无火焰）</td></tr>
<tr><td>压力</td><td>约 10,000 psi 级</td></tr>
</table>

<b>关键认知：这不是火箭，是冷气推力。</b>压缩空气经阀门定向喷出产生反作用力，没有燃烧室也没有推进剂燃烧。它能给你的是<b>短时姿态控制与额外下压力</b>，不是持续升力。

Moravy 那句话是关键工程约束：<b>"车内可用空间几乎被碳纤维压力容器填满"</b>。600 L 高压气瓶 + 约 200 kWh 电池 + 三电机，全都要挤进一台两座跑车——这也是续航必须下调的直接原因之一。

发布会现场做了完整演示：沿弧形坡道<b>倒立爬升</b>、<b>空中翻滚</b>、垂直墙面吸附降落，甚至"踢翻"式飞越 Model 3/Model Y/Cybertruck/Semi/Cybercab 整列车队。演示车辆为<b>远程无人驾驶</b>——这是个重要细节，说明载人状态下的控制安全尚未验证完毕。

马斯克自己的警告比宣传语更诚实：<b>"如果你的第一目标是安全，不要买Roadster。"</b>`,
        stats: [
          { label: '推进器', value: '约 10 具' },
          { label: '总推力', value: '> 80 kN' },
          { label: '储气量', value: '600 L 压缩空气' },
          { label: '容器', value: '碳纤维压力容器 · 可再充' },
          { label: '压力', value: '约 10,000 psi' },
        ],
      },
      {
        id: 'tanks',
        title: '600 L 碳纤维压力容器：吃掉整个座舱',
        anchor: U(-0.35, 0.62, 0.42),
        body: `四只缠绕碳纤维气瓶呈纵向布置，每只约 150 L，合计 600 L。

碳纤维压力容器的<b>比强度</b>是关键：同重量下钢瓶承压约 0.4 倍、钛约 0.6 倍，碳纤维缠绕能做到 2 倍以上。这是能把它塞进两座跑车的前提。

工程副总裁的原话值得逐字读：<b>车内可用空间几乎被碳纤维压力容器填满</b>——意味着传统意义上的后座、行李厢基本不存在。这也解释了为什么 Rocket 版是<b>单座</b>：气瓶与电池吃掉了所有空间。

安全上要注意：10,000 psi 级高压容器在公路车辆上属于<b>现行 FMVSS 标准没有覆盖</b>的领域——压力容器合规与碰撞安全认证目前无先例可循。这不是工程做不到，而是<b>法规路径尚未建立</b>。`,
        stats: [
          { label: '气瓶数量', value: '4 只 · 约 150 L/只' },
          { label: '材料', value: '缠绕碳纤维' },
          { label: '总储气', value: '600 L' },
          { label: '座舱占用', value: '官方称"几乎填满"' },
        ],
      },
    ],
  });

  layers.push({
    id: 'cabin',
    name: '座舱（双座 · 手动驾驶）',
    group: '座舱',
    explodeDir: U(-0.6, 1.2, 0.8),
    explodeScale: 0.34,
    sectionable: false,
    build: buildCabin,
    hotspots: [
      {
        id: 'manual',
        title: '最后一辆人类驾驶的特斯拉',
        anchor: U(-0.42, 0.86, 0.36),
        body: `马斯克在 2026 Q1 财报会上的原话：<b>"长期来看，唯一的手动驾驶汽车就是新款 Tesla Roadster。"</b>其余车型全面转向自动驾驶后，手动驾驶需要一个图腾。

座舱是这一代变化最大的部分：<b>三个版本座位数不同</b>——

<table>
<tr><td>Performance</td><td>双座 · 公路取向 · 主动气动 + 风扇吸附</td></tr>
<tr><td>Thrust</td><td>双座 · 赛道取向 · 加后置冷气推进器</td></tr>
<tr><td>Rocket</td><td><b>单座</b> · 特技取向 · 约 10 具推进器齐全</td></tr>
</table>

Rocket 版变单座不是减配，是<b>空间被储气罐吃掉了</b>——这是 A71 系统的直接工程后果。

传统 Roadster 的<b>可拆卸玻璃顶</b>延续了下来。`,
        stats: [
          { label: '座位（Performance / Thrust）', value: '双座' },
          { label: '座位（Rocket）', value: '单座' },
          { label: '定位', value: '最后一辆手动驾驶特斯拉' },
          { label: '特色', value: '可拆卸玻璃顶' },
        ],
      },
    ],
  });

  layers.push({
    id: 'versions',
    name: '三版本对照（Performance / Thrust / Rocket）',
    group: '选装',
    explodeDir: U(0, 0.4, 1.8),
    explodeScale: 0.3,
    sectionable: false,
    build: () => {
      // 这一层不做实体几何，用三个"版本标识块"表达选装差异
      const g = new THREE.Group();
      const defs: [string, number, string][] = [
        ['PERF', 0x2f6fa8, '公路 · 双座 · 主动气动'],
        ['THRUST', 0xd4621f, '赛道 · 双座 · 后置推进'],
        ['ROCKET', 0xb11226, '特技 · 单座 · 10 具推进'],
      ];
      defs.forEach(([label, color, sub], i) => {
        const blk = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.14, 0.5),
          mat({ color, metalness: 0.3, roughness: 0.5 })
        );
        blk.position.set(-0.6 + i * 0.62, 1.1, 0);
        g.add(blk);
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.02, 0.42),
          mat({ color: 0x101418, metalness: 0.1, roughness: 0.3 })
        );
        cap.position.set(-0.6 + i * 0.62, 1.18, 0);
        g.add(cap);
      });
      addEdges(g, 0x6a7076, 0.16);
      return g;
    },
    hotspots: [
      {
        id: 'trim',
        title: '三版三价：性能递增，座位递减',
        anchor: U(0.02, 1.18, 0),
        body: `这是 2026-10-15 发布会最实用的信息，官方当场公布：

<table>
<tr><td>版本</td><td>座位</td><td>推进</td><td>0–60 mph</td><td>定位</td></tr>
<tr><td>Performance</td><td>双座</td><td>地面风扇吸附</td><td>&lt; 1.6 s</td><td>公路</td></tr>
<tr><td>Thrust</td><td>双座</td><td>+ 后置冷气推进</td><td>&lt; 0.9 s</td><td>赛道</td></tr>
<tr><td>Rocket</td><td><b>单座</b></td><td>约 10 具全装</td><td><b>&lt; 0.59 s</b></td><td>特技</td></tr>
</table>

<b>预订与价格</b>（中国官网已开放预订）：
<table>
<tr><td>Performance</td><td>意向金 33.2 万元人民币 / 美国订金 5 万美元</td></tr>
<tr><td>Thrust</td><td>约 25 万美元</td></tr>
<tr><td>Rocket</td><td>仅限邀请</td></tr>
</table>
整车预计售价 20–25 万美元区间，<b>发布会未公布最终官方定价</b>。

<b>量产时间：2028 年</b>（得州超级工厂）。从 2017 首秀到量产，跨度约 11 年，是特斯拉史上跳票最久的车型。

预订协议写得很谨慎：<b>预订不构成购车订单，双方均可取消，已付款项全额退还</b>，且特斯拉无法保证实际交付时间。

商业定位上，晨星（Morningstar）把它归为<b>"光环车型"</b>，预计年销约 2,000 辆——<b>商业价值在销量之外，在技术叙事</b>。`,
        stats: [
          { label: 'Performance', value: '双座 · <1.6s · 公路' },
          { label: 'Thrust', value: '双座 · <0.9s · 赛道' },
          { label: 'Rocket', value: '单座 · <0.59s · 特技' },
          { label: '预计售价', value: '20–25 万美元（未最终公布）' },
          { label: '量产时间', value: '2028 年' },
        ],
      },
    ],
  });

  return {
    id: 'roadster',
    name: 'Tesla Roadster（第二代）',
    subtitle: 'Tesla · 2026 年 10 月 15 日发布 · SpaceX A71 冷气推进',
    tagline: '10 具冷气推进器、80 kN、0–60 mph 低于 0.59 秒——它真的能飞',
    background: 0xeef1f4,
    accent: '#b11226',
    camera: { position: [6.8, 3.4, 7.2], target: [0, 0.5, 0] },
    explodeScale: 1.0,
    sectionable: true,
    // 该车尚无实车照片，用结构示意图占位（并在图上明确标注"非真机"）
    heroImage: './og/roadster.svg',
    assembledImage: './ref/roadster/assembled.svg',
    repairability: {
      score: 2,
      difficulty: '极难',
      tools: ['举升机与车身支撑工装', '高压储气容器专用检测设备', '碳纤维压力容器充装/检漏设备', '扭矩扳手套装', '厂商诊断系统（未公开）'],
      note: '工程推断：约 200 kWh 电池 + 600 L 高压储气罐 + 三电系统决定了它几乎不具备用户可维护性；且该车尚未量产，不存在真实维修数据',
    },
    fidelity: {
      actualParts: 1,
      source: '尚无真机拆解资料：2026-10-15 首次公布实车，官方口径 2028 年投产，本模型依据发布会口头参数与航天冷气推进通用原理推断',
      modeledLayers: 7,
      modeledParts: 92,
      note: '⚠️ 本主体的分层与分步均为**工程推断**，不是拆解实测记录——该车尚未量产，不存在任何真机拆解资料。性能数字均为官方口径，未经第三方验证；续航已从 2017 年的约 1,000 km 下调至约 483 km。建模基准为 Rocket 版（配置最全）。',
    },
    headline: [
      { label: '0–60 mph', value: '< 0.59', unit: 's（Rocket 版）' },
      { label: '总推力', value: '> 80', unit: 'kN' },
      { label: '轮上扭矩', value: '10,000', unit: 'N·m' },
      { label: '极速', value: '> 370', unit: 'km/h' },
    ],
    overview: `2026 年 10 月 15 日，Tesla 在得克萨斯州 McGregor 的 SpaceX 试验场正式发布第二代 Roadster——距离 2017 年 11 月首次亮相，<b>跳票约 9 年</b>，从首秀到量产跨度约 11 年。

这台车最特别的地方不是"更快"，而是<b>它真的装了火箭级的推力系统</b>：与 SpaceX 联合开发的 A71 冷气推进模块，约 10 具推进器、总推力超过 80 kN、600 L 压缩空气储存在碳纤维压力容器里。现场演示了倒立爬升、空中翻滚与垂直墙面吸附降落。

同时必须说清楚三件事：

<b>一、它是冷气推力，不是火箭，也不是飞行器。</b>压缩空气经阀门喷出产生反作用力，无燃烧、无持续升力。"会飞"是性能工程的产物（短时减小轮胎接地），不是航空能力。现行法规对"公路车辆悬空"与高压容器均无覆盖路径。

<b>二、续航被下调了。</b>2017 年宣称的约 1,000 km 降为约 483 km。原因是约 200 kWh 的电池塞进一台两座跑车后，重量与热管理压力迫使续航让位——这是明确的工程取舍，不是缩水。

<b>三、没有任何拆解资料。</b>该车 2028 年才投产，<b>世界上还不存在一台被拆开的 Roadster 2</b>。所以本站这一页的<b>分层与分步全部是工程推断</b>，依据是发布会口径与航天冷气推进的通用原理。它展示的是"这样一台车在工程上会由什么构成"，而不是"它实际是怎么造的"。`,
    narrative: [
      `<b>一、这不是跑车项目，是航天项目下放到公路。</b>A71 的技术源头是航天器姿控模块——那类系统装在卫星上用来在真空中调整姿态。把同一套东西装进一台车，意味着<b>推力控制、储气承压、快速阀门</b>三件事都要从航天标准降到车规标准。这是整台车最难的部分，也是它跳票 9 年的原因之一。`,
      `<b>二、"能飞"和"能合法上路"是两件事。</b>发布会现场马斯克承认："不确定在所有司法管辖区都合法，但会有人能拥有这样的车。"这句话背后是三重法规空白：公路车辆的悬空姿态、10,000 psi 级压力容器、以及车载推进系统的认证路径——<b>现行 FMVSS 标准一条都没覆盖</b>。`,
      `<b>三、续航下调暴露了真实的物理边界。</b>从 620 mi 降到 300 mi，看似腰斩，实际是必然：620 mi 需要约 200 kWh（GMC Hummer EV 用 212 kWh 时已重逾 9,000 lb），而这一代的目标是把这些塞进 4,500 lb 级的两座跑车里。<b>在"更快"和"更远"之间，Tesla 明确选了更快。</b>`,
      `<b>四、留一个手动驾驶的图腾。</b>马斯克的说法很直白——长期来看唯一的手动驾驶汽车就是 Roadster。这不是情怀，是产品定位：当所有车型都转向自动驾驶时，需要一台车让"驾驶本身"继续有商业意义。它的年销预估仅约 2,000 辆（晨星归类为光环车型），<b>商业价值在销量之外</b>。`,
    ],
    specs: [
      { label: '发布时间', value: '2026-10-15', note: '2017-11 首次亮相，跳票约 9 年' },
      { label: '量产时间', value: '2028 年（计划）', note: '得州超级工厂' },
      { label: '版本', value: 'Performance / Thrust / Rocket', note: '双座 / 双座 / 单座' },
      { label: '0–60 mph', value: '< 1.6 s / < 0.9 s / < 0.59 s', note: '按 Performance / Thrust / Rocket 排列' },
      { label: '极速', value: '> 230 mph（约 370 km/h）', note: '官方口径' },
      { label: '轮上扭矩', value: '10,000 N·m', note: '减速后轮端值，非电机输出' },
      { label: '动力配置', value: '三电机 AWD（1 前 + 2 后）' },
      { label: '冷气推进器', value: '约 10 具 · 总推力 > 80 kN' },
      { label: '储气系统', value: '600 L 压缩空气 · 碳纤维压力容器', note: '官方称几乎填满车内' },
      { label: '电池容量', value: '约 200 kWh（推断）', note: '官方未正式公布' },
      { label: '续航', value: '约 483 km / 300 mi', note: '较 2017 年约 1,000 km 下调' },
      { label: '横向加速度', value: '最大约 2G（风扇吸附）' },
      { label: '整备质量目标', value: '< 4,500 lb（约 2,040 kg）', note: '官方口径' },
      { label: '预计售价', value: '20–25 万美元', note: '发布会未公布最终定价' },
      { label: '中国意向金', value: '33.2 万元人民币（Performance）' },
      { label: '量产方式', value: '双电机 + 后置单电机', note: '按官方三电机 AWD 布局推定' },
      { label: '数据来源', value: '2026-10-15 发布会公开口径', note: '未经第三方验证' },
    ],
    comparison: {
      title: '2017 首次亮相 vs 2026 实车发布',
      note: '参数回调集中在续航与加速——取舍的方向非常明确',
      rows: [
        { label: '0–60 mph', prev: '1.9 s（基础）', curr: '< 0.59 s（Rocket）', delta: 'up' },
        { label: 'SpaceX 套件加速', prev: '1.1 s（宣称）', curr: '< 0.59 s', delta: 'up' },
        { label: '极速', prev: '> 400 km/h', curr: '> 370 km/h', delta: 'down' },
        { label: '续航', prev: '约 1,000 km', curr: '约 483 km', delta: 'down' },
        { label: '电池容量', prev: '约 200 kWh（推算）', curr: '约 200 kWh（推算）', delta: 'flat' },
        { label: '座位（顶级版）', prev: '2+2', curr: '单座（Rocket）', delta: 'down' },
        { label: '推进器数量', prev: '约 10（宣称）', curr: '约 10（确认）', delta: 'flat' },
        { label: '量产时间', prev: '2020（原计划）', curr: '2028（计划）', delta: 'down' },
      ],
    },
    layers,
    steps: [
      {
        id: 's1-hood',
        title: '断电并确认高压系统放电',
        body: `拆任何一台电动车的第一步都是断电——但这一台尤其关键：约 200 kWh 电池 + 600 L 高压储气容器，<b>两类高压系统并存</b>。

断开动力电池后还必须处理储气罐压力。碳纤维缠绕气瓶在长期静置后仍保持带压状态，拆解前需要按容器编号找到对应的泄压程序。<b>注意：这一步在任何拆解指南里都应该是第一行</b>，本站列在流程最前只是因为它是常识，而不是因为它不重要。`,
        layers: ['battery'],
        tools: ['举升机与车身支撑工装', '扭矩扳手'],
        stats: [
          { label: '动力电池', value: '约 200 kWh' },
          { label: '储气罐压力', value: '约 10,000 psi 级' },
          { label: '高压系统数量', value: '2 类（电池 + 气瓶）' },
        ],
      },
      {
        id: 's2-thruster',
        title: '卸下车身覆盖件，露出推进器舱',
        body: `车身覆盖件卸下后，尾部推进器舱与周身姿控喷口暴露出来。这是整台车最独特的部分：<b>尾部 4 具主推进器对应"车牌翻起"机关</b>，车身周围 6 具负责俯仰、滚转与偏航。

拆解时最需要注意的是<b>管路走向</b>：储气罐到喷口之间是高压总管，拆解顺序错了会让大量气瓶暴露在开放状态。高压管路本身需要专用工装。

⚠️ 再次强调：<b>这一整套分步是工程推断，不是实测记录</b>。该车尚未量产，没有任何人拆过它。`,
        layers: ['body', 'thrusters'],
        tools: ['高压储气容器专用检测设备', '精密 / 五角螺丝刀'],
        stats: [
          { label: '尾部主推进器', value: '4 具' },
          { label: '周身姿控喷口', value: '6 具' },
          { label: '总推力', value: '> 80 kN' },
        ],
      },
      {
        id: 's3-tanks',
        title: '碳纤维压力容器组（600 L）',
        body: `四只缠绕碳纤维气瓶，每只约 150 L。

工程副总裁的原话值得记住：<b>车内可用空间几乎被碳纤维压力容器填满</b>。这解释了 Rocket 版为什么是单座——气瓶与约 200 kWh 电池吃掉了全部空间。

碳纤维缠绕容器的比强度是同重量下钢瓶的约 2 倍以上，这是它能进两座跑车的前提。但检测与充装都需要专用设备，且 10,000 psi 级容器在公路车辆上<b>没有现行的 FMVSS 合规路径</b>。`,
        layers: ['thrusters'],
        tools: ['碳纤维压力容器充装/检漏设备', '精密 / 五角螺丝刀'],
        stats: [
          { label: '气瓶数量', value: '4 只 × 约 150 L' },
          { label: '总储气', value: '600 L' },
          { label: '材料', value: '缠绕碳纤维' },
        ],
      },
      {
        id: 's4-battery',
        title: '动力电池包（约 200 kWh）',
        body: `主电池包是这一代最"反直觉"的部分：容量与 2017 年宣称基本一致（约 200 kWh），<b>但续航从约 1,000 km 砍到约 483 km</b>。

原因不在电芯，而在<b>整包重量</b>。同样约 200 kWh，放在 Model S 上是长续航车，放在一台目标 4,500 lb 的两座跑车里就要牺牲一半续航。取舍方向非常明确：<b>保动力与加速，弃续航</b>。

热管理也随之强化——模型里能看到的双路冷却回路就是这个方向的体现。`,
        layers: ['battery'],
        tools: ['举升机与车身支撑工装', '防静电镊子'],
        stats: [
          { label: '容量', value: '约 200 kWh' },
          { label: '续航（2017）', value: '约 1,000 km' },
          { label: '续航（2026）', value: '约 483 km' },
          { label: '取舍', value: '保加速，弃续航' },
        ],
      },
      {
        id: 's5-powertrain',
        title: '三电机与减速齿轮组',
        body: `前轴单电机、后轴双电机。后轴双电机可做<b>独立扭矩矢量</b>，左右轮分别给不同扭矩，过弯时主动抵消横摆——这是 2G 横向能力的一半来源。

官方口径的<b>轮上扭矩 10,000 N·m</b> 来自减速齿轮放大，不是电机输出值。电机本身通常只有几百 N·m。把这两个数混为一谈是解读这一代动力数据最常见的错误。`,
        layers: ['powertrain'],
        tools: ['举升机与车身支撑工装', '扭矩扳手'],
        stats: [
          { label: '电机', value: '三电机（1 前 + 2 后）' },
          { label: '轮上扭矩', value: '10,000 N·m' },
          { label: '0–60 mph', value: '< 0.59 s（Rocket）' },
        ],
      },
      {
        id: 's6-suction',
        title: '地面风扇吸附系统',
        body: `车底风扇组与扩散板。Performance 版的核心能力：<b>过弯横向加速度约 2G</b>。

原理是车底向下吹气、利用地面反作用力把车压住（伯努利下压），不是吸盘。这个思路在赛车里常见，但用在量产公路车上是第一次——<b>也因此面临"公路车辆能否产生下压力"的法规问题</b>。

现场演示显示该系统的取向明显偏赛道与特技：Roadster 沿弧形坡道倒立爬升、做空中翻滚、垂直墙面吸附降落。`,
        layers: ['suction'],
        tools: ['举升机与车身支撑工装'],
        stats: [
          { label: '横向加速度', value: '约 2G' },
          { label: '原理', value: '车底风扇 · 伯努利下压' },
          { label: '演示', value: '倒立爬升 / 空中翻滚' },
        ],
      },
      {
        id: 's7-cabin',
        title: '座舱与手动驾驶系统',
        body: `最后一层：双座桶椅、Y 形方向盘、中控屏，以及可拆卸玻璃顶。

这一层的意义不在结构而在<b>定位</b>——马斯克明确表示这是"长期来看唯一的手动驾驶的特斯拉"。当产品线全面转向自动驾驶，一台保留手动驾驶且提供极致性能的车型承担的是品牌图腾功能。晨星预计年销约 2,000 辆，属光环车型。`,
        layers: ['cabin', 'versions'],
        tools: ['精密 / 五角螺丝刀', '防静电镊子'],
        stats: [
          { label: 'Performance / Thrust', value: '双座' },
          { label: 'Rocket', value: '单座' },
          { label: '定位', value: '最后一辆手动驾驶特斯拉' },
          { label: '预计年销', value: '约 2,000 辆（晨星）' },
        ],
      },
    ],
  };
}