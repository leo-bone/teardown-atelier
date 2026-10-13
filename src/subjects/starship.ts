import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, metalMaterial, ablativeMaterial, scorchMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * SpaceX Starship V3（Block 3）
 * 真实尺寸：全堆 124.4m，直径 9m，起飞质量约 5533 吨
 * 场景单位：1 = 10m。整堆高 12.44，直径 0.9
 */
const M10 = 0.1; // 1 = 10m

const DIA = 9 * M10;          // 0.9
const R = DIA / 2;            // 0.45
const H_TOTAL = 124.4 * M10;  // 12.44
const H_BOOST = 72 * M10;     // 7.2 —— SpaceX 官网：Super Heavy 高 72m
const H_SHIP = 52 * M10;      // 5.2 —— SpaceX 官网：Starship 高 52m
// 72 + 52 = 124，与官网全堆 124m 一致（叠级重叠量忽略）

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** 箭体圆柱段 */
function bodySegment(r: number, h: number, color = 0xd6d9dc, metal = 0.85, rough = 0.35): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, false), metalMaterial(color, rough, metal));
}

/** 液氧/液甲烷贮箱段（带纵向焊缝） */
function tankSection(r: number, h: number, tint: number): THREE.Group {
  const g = new THREE.Group();
  g.add(bodySegment(r, h, tint, 0.88, 0.3));

  // 纵向加强筋
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.028, h, 0.028), metalMaterial(0xc8ccd0, 0.35));
    rib.position.set(Math.cos(a) * r * 1.01, 0, Math.sin(a) * r * 1.01);
    rib.rotation.y = -a;
    g.add(rib);
  }

  // 环向加强圈
  const rings = Math.max(2, Math.floor(h / 0.35));
  for (let i = 1; i < rings; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.008, 0.012, 8, 48), metalMaterial(0xc0c5c9, 0.4));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -h / 2 + (i * h) / rings;
    g.add(ring);
  }
  return g;
}

export function starshipV3(): Subject {
  const layers: Layer[] = [];

  // ============ 1. Ship 上面级：热防护系统 ============
  layers.push({
    id: 'shield',
    name: 'Ship 热防护瓦（TPS）',
    group: '热防护',
    explodeDir: U(1.15, 0.3, 0.3),
    explodeScale: 0.55,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const h = 1.5;
      const y0 = H_TOTAL - 1.0;

      // 瓦片阵列：绕箭体排布
      const cols = 26;
      const rows = 7;
      const tileMat = ablativeMaterial(0xffffff);
      for (let c = 0; c < cols; c++) {
        const a = (c / cols) * Math.PI * 2;
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          const t = new THREE.Mesh(new THREE.BoxGeometry(0.055, h / rows - 0.006, 0.12), tileMat);
          t.position.set(
            Math.cos(a) * (R + 0.028),
            y0 - h / 2 + (rIdx + 0.5) * (h / rows),
            Math.sin(a) * (R + 0.028)
          );
          t.rotation.y = -a;
          g.add(t);
        }
      }

      // 不锈钢基板（瓦片背衬）
      const base = bodySegment(R, h, 0xa8adb2, 0.9, 0.3);
      base.position.y = y0;
      g.add(base);

      // "crunch wrap" 毡层（Flight 11 首次引入）
      const felt = new THREE.Mesh(
        new THREE.CylinderGeometry(R + 0.014, R + 0.014, h * 0.42, 48, 1, true),
        mat({ color: 0x8a7f6a, metalness: 0.05, roughness: 0.98, side: THREE.DoubleSide })
      );
      felt.position.y = y0 + h * 0.28;
      g.add(felt);

      // 烧蚀标记（再入烧蚀区示意）
      const scorch = new THREE.Mesh(
        new THREE.CylinderGeometry(R + 0.032, R + 0.032, h * 0.3, 48, 1, true),
        scorchMaterial()
      );
      scorch.position.y = y0 - h * 0.35;
      g.add(scorch);

      addEdges(g, 0x6b7280, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'tps',
        title: '第三 generation 隔热瓦',
        anchor: U(R + 0.08, H_TOTAL - 1.4, 0),
        body: `再入是 Starship 整个任务剖面里<b>最危险的阶段</b>——这一层直接决定它能不能活着落海。

V3 的 TPS 在 Flight 11 基础上继续改：瓦片背衬引入名为 <b>"crunch wrap"（脆脆布）</b>的毡状底层，作用是在烧蚀时让瓦片以可控方式破碎、释放背衬变形，避免应力集中撕裂整块瓦。

工程习惯：SpaceX 每次飞行都会<b>在高热流区域拆掉一小片瓦</b>做破坏性探测，摸清结构余量。这是用实测换设计余量的典型做法。

再入机动方案：受控动态侧倾 + 腹部朝下翻转进入着陆点火。瓦片要扛住约 1/7 地球海平面重量级的减速动压。`,
        stats: [
          { label: '瓦片总数（V2 量级）', value: '超 18000 片' },
          { label: '新增', value: 'crunch wrap 毡层' },
          { label: '材料', value: '不锈钢基板 + 陶瓷涂层' },
          { label: '再入方式', value: '侧倾 + 腹部翻转着陆点火' },
        ],
      },
    ],
  });

  // ============ 2. Ship 上面级结构 ============
  layers.push({
    id: 'ship',
    name: 'Ship 上面级',
    group: '箭体',
    explodeDir: U(1.15, 0.9, 0),
    explodeScale: 0.4,
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 前锥段（鼻锥）
      const nose = new THREE.Mesh(new THREE.ConeGeometry(R, 0.62, 64, 1, true), metalMaterial(0x8f959b, 0.42, 0.7));
      nose.position.y = H_TOTAL - 0.31;
      g.add(nose);

      const noseBody = bodySegment(R, 0.75);
      noseBody.position.y = H_TOTAL - 0.99;
      g.add(noseBody);

      // 液氧贮箱（上段）
      const lox = tankSection(R, 1.9, 0xb8bcc0);
      lox.position.y = H_TOTAL - 2.32;
      g.add(lox);

      // 共用穹顶（LOX/CH4 隔板，V3 已下移以扩大甲烷舱）
      const commonDome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), metalMaterial(0x9aa0a6, 0.35));
      commonDome.rotation.x = Math.PI;
      commonDome.position.y = H_TOTAL - 3.27;
      g.add(commonDome);

      // 液甲烷贮箱
      const lch4 = tankSection(R, 2.35, 0xc2c6ca);
      lch4.position.y = H_TOTAL - 4.62;
      g.add(lch4);

      // 尾部穹顶（下移）
      const aftDome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), metalMaterial(0x9aa0a6, 0.35));
      aftDome.position.y = H_BOOST - 0.75;
      g.add(aftDome);

      // 后备箱段
      const aftTank = tankSection(R, 0.85, 0xb0b4b8);
      aftTank.position.y = H_BOOST - 1.6;
      g.add(aftTank);

      // 载荷舱（再入后释放星链模拟载荷）
      const payloadBay = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.86, R * 0.86, 1.15, 48, 1, true),
        mat({ color: 0x6f757b, metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide, opacity: 0.55 })
      );
      payloadBay.position.y = H_BOOST - 2.62;
      g.add(payloadBay);

      // 襟翼（前后各一对）
      const flapDefs: [number, number, number][] = [
        [0.9, H_BOOST - 3.3, 1],
        [Math.PI / 2 + 0.9, H_BOOST - 3.3, 1],
        [Math.PI + 0.9, H_BOOST - 3.3, 1],
        [-Math.PI / 2 + 0.9, H_BOOST - 3.3, 1],
      ];
      flapDefs.forEach(([ang, y]) => {
        const flap = new THREE.Group();
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.75), metalMaterial(0xa4a9ae, 0.4));
        blade.position.set(0, 0, 0.42);
        flap.add(blade);
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), metalMaterial(0x7d8388, 0.35));
        hinge.rotation.z = Math.PI / 2;
        flap.add(hinge);
        flap.position.set(Math.cos(ang) * R * 0.95, y, Math.sin(ang) * R * 0.95);
        flap.rotation.y = -ang;
        g.add(flap);
      });

      // 前襟翼
      const fFlap = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.7), metalMaterial(0xa4a9ae, 0.4));
      fFlap.position.set(0, H_TOTAL - 1.75, R * 0.95);
      g.add(fFlap);

      // 对接适配器（V3 新增外部对接口）
      const dock = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.35, 24), metalMaterial(0x8b9197, 0.32));
      dock.position.set(0, H_BOOST - 4.1, 0);
      g.add(dock);

      // 快断接口
      const qd = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 10, 32), metalMaterial(0xc0a060, 0.3));
      qd.rotation.x = Math.PI / 2;
      qd.position.set(0, H_BOOST - 3.86, 0);
      g.add(qd);

      // 捕捉点（V3 起上面级也预留塔架回收硬点）
      for (const ang of [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4]) {
        const cp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.22), metalMaterial(0xd0d4d8, 0.25));
        cp.position.set(Math.cos(ang) * R * 1.02, H_BOOST - 3.4, Math.sin(ang) * R * 1.02);
        cp.rotation.y = -ang;
        g.add(cp);
      }

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'commonDome',
        title: '下移的共用穹顶',
        anchor: U(R + 0.06, H_TOTAL - 3.3, 0),
        body: `V3 一个不明显但影响很大的改动：把<b>共用穹顶</b>（液氧与液甲烷贮箱之间的共享隔板）和<b>尾部穹顶</b>都往下挪。

共用穹顶往下移 = <b>液甲烷舱容积变大</b>。位置决定装多少燃料，而燃料决定 Δv，Δv 决定能不能把载荷送到轨道。

V2 时代 Ship 的载荷舱就被削减过一次（给推进剂让路），V3 继续这个取舍——载荷容积继续压缩，总推进剂装载量远超 V2 的约 1500 吨。

记住这个物理链条：<b>穹顶位置 → 甲烷舱容积 → 装多少燃料 → 能到哪</b>。`,
        stats: [
          { label: '共用穹顶', value: '下移，甲烷舱扩大' },
          { label: '尾部穹顶', value: '同步下移' },
          { label: 'Ship 干重（早期口径）', value: '约 105 吨' },
          { label: '推进剂', value: '远超 V2 的约 1500 吨' },
        ],
      },
      {
        id: 'dock',
        title: '对接适配器 · 在轨加注接口',
        anchor: U(0, H_BOOST - 4.1, 0.42),
        body: `V3 新增<b>外部对接适配器</b>和快断接口。这一层的存在意义是：<b>在轨加注（propellant transfer）</b>。

这是整个 Starship 架构的关键环节。为什么要加注——因为一次入轨只能把有限的载荷送上去，要把足够的东西送上月球或火星，必须让飞船在轨道上"加油"。而加注的前提是两艘飞船能在轨对接并完成推进剂转移。

Flight 12（Ship 39）的任务清单里明确写了：验证对接端口和快断硬件，为 NASA 要求的加注演示铺路。但要注意——<b>它不是加注试验</b>，当时不会有第二艘 Starship 在轨道上。那次飞行的目标只是让硬件扛过发射、在真空工作、返回数据，为后续加注演示清障。

NASA Artemis 登月架构完全押在这个能力上。`,
        stats: [
          { label: 'V3 新增', value: '外部对接适配器' },
          { label: '快断接口', value: '就位' },
          { label: 'Flight 12 目标', value: '验证接口，不做加注' },
          { label: '最终目的', value: '在轨加注 → 登月' },
        ],
      },
    ],
  });

  // ============ 3. Super Heavy 助推器结构 ============
  layers.push({
    id: 'booster',
    name: 'Super Heavy 助推器',
    group: '箭体',
    explodeDir: U(1.3, -0.5, 0),
    explodeScale: 0.42,
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 主贮箱段（液甲烷 + 液氧）
      const tank = tankSection(R, 4.3, 0xbcc0c4);
      tank.position.y = 3.6;
      g.add(tank);

      const tank2 = tankSection(R, 2.0, 0xc4c8cc);
      tank2.position.y = 0.5;
      g.add(tank2);

      // 顶部与热分离穹顶
      const topDome = new THREE.Mesh(
        new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2),
        metalMaterial(0x9aa0a6, 0.35)
      );
      topDome.position.y = H_BOOST - 0.05;
      g.add(topDome);

      // 栅格翼（V3：3 片，单片增大 50%）
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const fin = new THREE.Group();

        // 框架
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.75, 0.05), metalMaterial(0x9ba1a7, 0.35));
        fin.add(frame);

        // 网格叶片
        const gridMat = mat({ color: 0xa8aeb4, metalness: 0.9, roughness: 0.3, opacity: 0.75 });
        for (let k = 0; k < 9; k++) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.045), gridMat);
          bar.position.y = -0.8 + k * 0.2;
          fin.add(bar);
        }
        for (let k = 0; k < 7; k++) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.045), gridMat);
          bar.position.x = -0.62 + k * 0.207;
          fin.add(bar);
        }

        // 铰链
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12), metalMaterial(0x757b80, 0.35));
        hinge.position.z = -0.06;
        fin.add(hinge);

        // 塔架捕捉机构（V3 新增）
        const catchMech = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.28), metalMaterial(0xd8b45a, 0.28));
        catchMech.position.set(0, 0.75, 0.14);
        fin.add(catchMech);

        fin.position.set(Math.cos(ang) * (R + 0.72), H_BOOST - 1.35, Math.sin(ang) * (R + 0.72));
        fin.rotation.y = -ang;
        g.add(fin);
      }

      // 集束管（33 台启动的供给管路，V3 显著加大）
      const downcomer = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.5, 20), metalMaterial(0xb0a080, 0.35));
      downcomer.position.y = 0.85;
      g.add(downcomer);

      // 快断接口（V3 整合到底部）
      const qdHub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.3, 24), metalMaterial(0xc0a060, 0.3));
      qdHub.position.y = 1.35;
      g.add(qdHub);

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'gridfin',
        title: '栅格翼：4 片 → 3 片',
        anchor: U(R + 1.4, H_BOOST - 1.35, 0),
        body: `V3 最有辨识度的外形变化：<b>栅格翼从 4 片减到 3 片，单片面积增大 50%</b>。

看起来是简化，实际是三个诉求叠加：
- <b>减轻重量</b>：少一片就是少一套铰链、驱动、作动器
- <b>加强强度</b>：单片更大更结实，是为了扛住塔架"筷子"捕获时的高度过载
- <b>降低侵蚀</b>：安装位置调整后，级间分离时 Ship 发动机尾焰不再直接冲刷栅格翼

第三点是真正致命的——上一代 V2 在分离瞬间，飞船端猛禽的尾焰会严重烧蚀栅格翼前缘。少一片 + 挪位置，等于把一个结构损伤源从设计里移除了。

<b>还有两个网上有实拍佐证的变化</b>：
- <b>驱动装置从外挂改成内藏式</b>，不再突出于火箭表面，安装位置也相应下调
- <b>回收捕获点直接做在栅格舵上，与舵面一体成型</b>——不是外挂凸起，而是同一块结构。V3 把助推器回收捕获点整合进栅格舵，结构更简洁也更结实

这是 SpaceX 第一次在助推器上为"被塔架抓住"这件事做结构性预留，而且是用一体化成型而不是加装。`,
        stats: [
          { label: '数量', value: '4 片 → 3 片' },
          { label: '单片面积', value: '+50%' },
          { label: '新增机构', value: '塔架捕获受力设计' },
          { label: '解决的老问题', value: '尾焰烧蚀栅格翼' },
        ],
      },
      {
        id: 'downcomer',
        title: '加大版推进剂集束管',
        anchor: U(0.16, 0.9, 0),
        body: `燃料贮箱到发动机之间的输送管路，V3 里<b>直径大幅加大，接近猎鹰九号一级的规模</b>。

为什么要粗：必须能在短时间内把液甲烷送到 33 台猛禽 3 同时点火。管径就是流量。

这也直接决定了两个数字：
- 支持 <b>33 台发动机同时启动</b>（V3 全部 33 台用猛禽 3，V2 只有部分）
- 支持<b>更快的地面补注周转</b>，配合底部整合的快断接口，目标是把两次发射之间的间隔从天数级压下来

地面设施那边也在配套改：Pad 2 新的燃料库增加了储量、提升了泵速，20 个压紧臂都带保护门，液压改成机电作动。SpaceX 的目标是<b>支持从星舰基地一年 25 次发射</b>。`,
        stats: [
          { label: '管径', value: '接近猎鹰九号一级' },
          { label: '服务对象', value: '33 台猛禽 3 同时点火' },
          { label: '快断接口', value: 'V3 整合到底部' },
          { label: '配套', value: 'Pad 2 水冷导流槽' },
        ],
      },
    ],
  });

  // ============ 4. 33 台猛禽 3 发动机 ============
  layers.push({
    id: 'raptor',
    name: '猛禽 3 发动机 ×33',
    group: '推进',
    explodeDir: U(-1.1, -1.4, 0.55),
    explodeScale: 0.5,
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const enginePositions: [number, number][] = [];
      // 外圈 22 台
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        enginePositions.push([Math.cos(a) * 0.315, Math.sin(a) * 0.315]);
      }
      // 内圈 11 台
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2 + Math.PI / 11;
        enginePositions.push([Math.cos(a) * 0.165, Math.sin(a) * 0.165]);
      }

      enginePositions.forEach(([x, z], idx) => {
        const eng = new THREE.Group();

        // 推力室 / 燃烧室
        const chamber = new THREE.Mesh(
          new THREE.CylinderGeometry(0.062, 0.075, 0.34, 28),
          metalMaterial(0x8a7a6a, 0.42)
        );
        chamber.position.y = 0.17;
        eng.add(chamber);

        // 再生冷却管束：16 根细管合并为 InstancedMesh
        const COOL_N = 16;
        const cooler = new THREE.InstancedMesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6),
          metalMaterial(0xb8a890, 0.3),
          COOL_N
        );
        const cm = new THREE.Matrix4();
        for (let k = 0; k < COOL_N; k++) {
          const a = (k / COOL_N) * Math.PI * 2;
          cm.makeTranslation(Math.cos(a) * 0.08, 0.17, Math.sin(a) * 0.08);
          cooler.setMatrixAt(k, cm);
        }
        cooler.instanceMatrix.needsUpdate = true;
        eng.add(cooler);

        // 喷管（钟形，收缩扩张）
        const nozzleProfile: [number, number][] = [
          [0.14, 0.075], [0.1, 0.085], [0.055, 0.09], [0.0, 0.092],
        ];
        const pts = nozzleProfile.map(([yy, rr]) => new THREE.Vector2(rr, yy));
        const nozzle = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), metalMaterial(0x6e6a66, 0.5));
        nozzle.position.y = 0.34;
        eng.add(nozzle);

        // 涡轮泵
        const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.13, 14), metalMaterial(0x5a6a72, 0.4));
        pump.rotation.z = Math.PI / 2;
        pump.position.set(0.11, 0.28, 0);
        eng.add(pump);

        // 传感器与控制器（V3 已内化，取消独立保护罩）
        const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.05), mat({ color: 0x2b3a44, metalness: 0.5, roughness: 0.5 }));
        ctrl.position.set(-0.09, 0.3, 0);
        eng.add(ctrl);

        // 底部安装座
        const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 14), metalMaterial(0x4a5055, 0.45));
        mount.position.y = 0.4;
        eng.add(mount);

        // 进气道
        const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.1, 12), metalMaterial(0x707a80, 0.4));
        intake.position.set(-0.1, 0.42, 0);
        eng.add(intake);

        eng.position.set(x, 0.34, z);
        g.add(eng);
      });

      addEdges(g, 0x8a7a6a, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'raptor3',
        title: '猛禽 3 · 减重 1 吨/台',
        anchor: U(-0.315, 0.2, 0.315),
        body: `猛禽 3 是 V3 全部升级的基础。33 台同时点火，<b>起飞推力 8240 吨力</b>——超过任何历史火箭，约为 SLS 的 2.3 倍、土星五号的近 3 倍。

推力提升：
| | 猛禽 2 | 猛禽 3 | 提升 |
|---|---|---|---|
| 海平面推力 | 230 tf | 250 tf（部分口径 280 tf） | +8.7% |
| 真空推力 | 258 tf | 275 tf | +6.6% |
| 干质量 | 1630 kg | <b>1525 kg</b> | -105 kg |
| 推重比 | — | <b>>180</b> | — |

关键设计是<b>取消独立发动机保护罩</b>：把传感器和控制器整合进发动机内部，由发动机自身的热防护层直接覆盖。V2 的保护罩每台重约 1 吨，33 台就是 33 吨。

配合内部化二次流路和增材制造，外部结构大幅简化。SpaceX 称制造成本约为猛禽 1 的四分之一，单台约 50 万美元（月产 20 台）。

还有个容易被忽略的取舍：<b>V3 从 100–150 吨 LEO 运力"提升"到 200+ 吨，这个宣称被质疑过</b>——一种解释是 V2 运力被高估了。无论如何，这类"提升"数字要结合干重变化一起看。`,
        stats: [
          { label: '单台海平面推力', value: '250 tf（部分口径 280）' },
          { label: '单台真空推力', value: '275 tf' },
          { label: '33 台总推力', value: '约 9240 tf' },
          { label: '干质量', value: '1525 kg（原 1630）' },
          { label: '推重比', value: '>180' },
          { label: '关键改进', value: '取消独立保护罩，-1 吨/台' },
          { label: '制造成本', value: '约 50 万美元/台' },
        ],
      },
    ],
  });

  // ============ 5. Ship 上面级发动机（6 台：3 猛禽3 + 3 真空型） ============
  layers.push({
    id: 'shipengines',
    name: 'Ship 发动机 ×6（3 海平面 + 3 真空）',
    group: '推进',
    explodeDir: U(-0.6, -1.55, 0.75),
    explodeScale: 0.42,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      // SpaceX 官方：Ship 由 6 台发动机驱动 —— 3 台 Raptor + 3 台 Raptor Vacuum，
      // 合计推力 1614 吨力。布局为中心 3 台海平面型 + 外圈 3 台真空型。
      const y0 = 0.55;

      const defs: { x: number; z: number; vac: boolean }[] = [
        { x: 0, z: 0, vac: false },
        { x: Math.cos(Math.PI / 2) * 0.2, z: Math.sin(Math.PI / 2) * 0.2, vac: false },
        { x: Math.cos(Math.PI) * 0.2, z: Math.sin(Math.PI) * 0.2, vac: false },
        { x: Math.cos(Math.PI / 4) * 0.33, z: Math.sin(Math.PI / 4) * 0.33, vac: true },
        { x: Math.cos((Math.PI * 5) / 4) * 0.33, z: Math.sin((Math.PI * 5) / 4) * 0.33, vac: true },
        { x: Math.cos((Math.PI * 7) / 4) * 0.33, z: Math.sin((Math.PI * 7) / 4) * 0.33, vac: true },
      ];

      defs.forEach(({ x, z, vac }) => {
        const eng = new THREE.Group();

        // 燃烧室（真空型更细长）
        const chamber = new THREE.Mesh(
          new THREE.CylinderGeometry(vac ? 0.05 : 0.058, vac ? 0.06 : 0.07, vac ? 0.4 : 0.32, 24),
          metalMaterial(0x8a7a6a, 0.42)
        );
        chamber.position.y = 0.16;
        eng.add(chamber);

        // 喷管：真空型为大幅钟形 extension，海平面型短而粗
        const pts = vac
          ? [[0.12, 0.07], [0.2, 0.14], [0.32, 0.21], [0.44, 0.26]]
          : [[0.1, 0.07], [0.15, 0.1], [0.24, 0.13]];
        const nozzle = new THREE.Mesh(
          new THREE.LatheGeometry(pts.map(([yy, rr]) => new THREE.Vector2(rr, yy)), 28),
          metalMaterial(0x6e6a66, 0.5)
        );
        nozzle.position.y = 0.32;
        eng.add(nozzle);

        // 涡轮泵
        const pump = new THREE.Mesh(
          new THREE.CylinderGeometry(vac ? 0.036 : 0.042, vac ? 0.036 : 0.042, 0.12, 12),
          metalMaterial(0x5a6a72, 0.4)
        );
        pump.rotation.z = Math.PI / 2;
        pump.position.set(0.1, 0.26, 0);
        eng.add(pump);

        // 内置控制器（V3 无独立保护罩）
        const ctrl = new THREE.Mesh(
          new RoundedBoxGeometry(0.045, 0.06, 0.045, 2, 0.015),
          mat({ color: 0x2b3a44, metalness: 0.5, roughness: 0.5 })
        );
        ctrl.position.set(-0.085, 0.28, 0);
        eng.add(ctrl);

        // 安装座
        const mount = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.055, 0.06, 12),
          metalMaterial(0x4a5055, 0.45)
        );
        mount.position.y = 0.38;
        eng.add(mount);

        // 进气道
        const intake = new THREE.Mesh(
          new THREE.CylinderGeometry(vac ? 0.03 : 0.034, 0.04, 0.09, 10),
          metalMaterial(0x707a80, 0.4)
        );
        intake.position.set(-0.095, 0.4, 0);
        eng.add(intake);

        // 真空型额外：RCS 喷口簇（外圈 3 台）
        if (vac) {
          for (let k = 0; k < 4; k++) {
            const rcs = new THREE.Mesh(
              new THREE.ConeGeometry(0.016, 0.05, 8, 1, true),
              metalMaterial(0x60686e, 0.5)
            );
            const a = (k / 4) * Math.PI * 2;
            rcs.position.set(Math.cos(a) * 0.075, 0.44, Math.sin(a) * 0.075);
            rcs.rotation.x = Math.PI;
            eng.add(rcs);
          }
        }

        eng.position.set(x, y0, z);
        g.add(eng);
      });

      // 推力盘（V3 取消了发动机舱，是裸露的推力圆盘）
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.06, 48),
        metalMaterial(0x8c9298, 0.38)
      );
      plate.position.y = 0.52;
      g.add(plate);

      // 密封板环
      const seal = new THREE.Mesh(
        new THREE.TorusGeometry(R * 0.93, 0.035, 10, 48),
        metalMaterial(0x5a6268, 0.45)
      );
      seal.rotation.x = Math.PI / 2;
      seal.position.y = 0.55;
      g.add(seal);

      addEdges(g, 0x8a7a6a, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'shipengines',
        title: 'Ship 6 台发动机 · 1614 吨力',
        anchor: U(0, 0.7, 0.42),
        body: `这是之前容易漏掉的一层：<b>Ship 上面级自己也有 6 台发动机</b>，不只是 Super Heavy 的 33 台。

配置（SpaceX 官网）：<b>3 台海平面型 Raptor + 3 台真空优化型 Raptor Vacuum</b>，合计推力 <b>1614 吨力（3.5 Mlbf）</b>。布局为中心 3 台 + 外圈 3 台真空型。

<b>为什么要真空型？</b>太空���大气压极低，海平面型的喷管在真空中推力效率很差。RVac 用大尺寸钟形延伸喷管（模型里外圈 3 台喷管明显更大更细长）来适配真空环境——这是它和助推器那 33 台海平面型最直观的区别。

<b>Flight 12 首飞实际结果</b>：6 台中<b>一台真空型猛禽 3 在上升段中途熄火</b>。剩余 5 台靠延长点火时间补偿推力损失，仍把 Ship 送入预定轨迹。但这也导致原定的第 4 次在轨点火试验被取消。

V3 取消了发动机舱——现在是裸露的推力圆盘 + 一圈密封板。SpaceX 的说法是"把问题连根拔掉"：过去发动机舱的散热和灭火问题，随着舱体一起消失了。`,
        stats: [
          { label: '发动机总数', value: '6 台（3 海平面 + 3 真空）' },
          { label: '合计推力', value: '1614 吨力（3.5 Mlbf）' },
          { label: '配置', value: '中心 3 + 外圈 3 真空型' },
          { label: 'V3 变化', value: '取消发动机舱，裸露推力盘' },
          { label: 'Flight 12', value: '1 台真空型中途熄火' },
        ],
      },
    ],
  });

  // ============ 6. 热分离结构 ============
  layers.push({
    id: 'hotstage',
    name: '热分离（HOT-STAGING）结构',
    group: '分离',
    explodeDir: U(-0.75, -0.6, -0.85),
    explodeScale: 0.45,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const y0 = H_BOOST;

      // 非结构钢屏蔽层（替代传统一次性整流罩）
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 1.02, R * 1.02, 0.5, 48, 1, true),
        mat({ color: 0x7a6a5a, metalness: 0.8, roughness: 0.55, side: THREE.DoubleSide })
      );
      shield.position.y = y0 - 0.25;
      g.add(shield);

      // 助推器前穹顶（燃料舱前隔板）
      const fwdDome = new THREE.Mesh(
        new THREE.SphereGeometry(R, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2),
        metalMaterial(0x9aa0a6, 0.35)
      );
      fwdDome.position.y = y0 - 0.45;
      g.add(fwdDome);

      // 上面级尾部穹顶（暴露在尾焰中）
      const aftDomeExposed = new THREE.Mesh(
        new THREE.SphereGeometry(R, 48, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        mat({ color: 0x6a5a4a, metalness: 0.7, roughness: 0.7, side: THREE.DoubleSide })
      );
      aftDomeExposed.position.y = y0 + 0.5;
      g.add(aftDomeExposed);

      // 内部加压防护
      const pressur = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.97, R * 0.97, 0.44, 40, 1, true),
        mat({ color: 0x4a5560, metalness: 0.4, roughness: 0.8, side: THREE.DoubleSide })
      );
      pressur.position.y = y0 - 0.22;
      g.add(pressur);

      // 分离机构
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const sep = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.16), metalMaterial(0xd0a050, 0.3));
        sep.position.set(Math.cos(a) * R * 1.01, y0 - 0.05, Math.sin(a) * R * 1.01);
        sep.rotation.y = -a;
        g.add(sep);
      }

      addEdges(g, 0xd0a050, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'hotstage',
        title: '热分离：扔掉整流罩这件事',
        anchor: U(R * 1.05, H_BOOST - 0.25, 0),
        body: `这是 V3 最省钱的设计。

传统火箭的级间分离需要整流罩保护：助推器顶端的<b>整流罩</b>要连着扔掉。但传统整流罩是铝制或复合材料的一次性结构，重量大、且完全无法回收。

V3 的做法：<b>把助推器燃料舱的前穹顶直接暴露在 Ship 发动机的点火环境中</b>。

靠什么保护？
1. 前穹顶外加一层<b>非结构钢屏蔽层</b>（不是承力结构）
2. <b>舱内推进剂自身的压力</b>——液体不可压缩，燃料本身就是最好的抗压层

所以"扔掉整流罩"这件事变成了"扔掉一层薄钢皮"。这不只是减重，是<b>改变了回收物的价值结构</b>——回收的助推器不再带着一个必须抛弃的昂贵大件。

V2 的热分离（首次在 Flight 3 实现）已经验证过这条路可行，V3 是在此基础上的放大。`,
        stats: [
          { label: '替代物', value: '整流罩 → 非结构钢薄层' },
          { label: '防护原理', value: '舱内推进剂压力' },
          { label: '收益', value: '回收物不再带大件抛弃物' },
          { label: '首次验证', value: 'Flight 3（V2 时代）' },
        ],
      },
    ],
  });

  return {
    id: 'starship',
    name: 'SpaceX Starship V3',
    subtitle: 'SpaceX · 2026 年 5 月首飞 · Flight 12',
    tagline: '124.4 米、33 台猛禽 3、约 9240 吨推力——人类目前最强运力',
    background: 0xf1f2f4,
    accent: '#0b7285',
    camera: { position: [13, 7.5, 13], target: [0, 6.2, 0] },
    explodeScale: 1.05,
    sectionable: true,
    fidelity: {
      actualParts: 33,
      source: '33 台猛禽 3（Raptor 单台约 200+ 零件，全箭发动机部分逾 6600 件）；隔热瓦约 18000 片；栅格翼 3 片；前后襟翼各 4 片',
      modeledLayers: 6,
      modeledParts: 652,
      note: 'SpaceX 官方口径：Super Heavy 33 台猛禽 3 + Ship 6 台（3 海平面 + 3 真空型），共 39 台逐台建模，每台含推力室、喷管、涡轮泵、进气道等主要部件——这部分精度较高。真实全箭发动机零件逾 6600 件（Raptor 单台 200+），单台内部零件未展开。18000 片隔热瓦以瓦片阵列示意（26 列×7 行 = 182 片），未按真实片数生成。',
    },
    layers,
    headline: [
      { label: '全堆高度', value: '124.4', unit: 'm' },
      { label: 'LEO 运力', value: '100+', unit: '吨（复用）' },
      { label: '起飞推力', value: '8240', unit: '吨力' },
      { label: '猛禽 3', value: '33', unit: '台' },
    ],
    overview: `Starship V3（Block 3）是 SpaceX 目前最强的运载器，2026 年 5 月 23 日完成 V3 构型首飞（Flight 12）。全堆 <b>124.4 米</b>、直径 9 米、起飞质量约 <b>5533 吨</b>，33 台猛禽 3 同时点火，起飞推力 8240 吨力。

V1 → V2 → V3 按 SpaceX 官方的说法是"几乎所有部件都变了"。V3 的三个核心变化：<b>全面换装猛禽 3</b>（V2 只有部分换装）、<b>热分离构型</b>（不再需要扔整流罩）、<b>栅格翼从 4 片减为 3 片</b>。

需要说明的口径问题：运力数字有 100 吨、150 吨、200 吨多个版本，取决于复用/一次性、是否为原始预测还是实测。官方口径是完全复用状态超 100 吨，一次性构型估 180–200 吨。V2 实际演示约 35 吨且未入轨。发动机推力也有 250 tf 和 280 tf 两个流传值——卫星新闻等早期报道用 250 tf，New Space Economy 等较晚的分析用 280 tf，模型按 250 tf 标注。

<b>Flight 12 首飞结果（2026-05-23）</b>：一级二级成功分离、二级完成再入与落海，但<b>一级分离后点火失败，落海未能软着陆</b>；二级 6 台发动机中<b>一台真空型上升段中途熄火</b>，导致原定的第 4 次在轨点火试验取消。这枚箭至今尚未真正入轨。

建模说明：按 <b>SpaceX 官网技术规格 + Flight 12 实拍</b>参数化重建，非工程图纸复刻。发动机内部流道、瓦片实际排布为结构性示意。V3 尺寸数据以官网为准：全堆 124m、Super Heavy 72m、Ship 52m、起飞推力 8240 吨力。`,
    narrative: [
      `<b>为什么 V3 的核心是"减重"而不是"加力"</b>：猛禽 3 的关键动作是<b>取消独立发动机保护罩</b>——把传感器和控制器整合进发动机内部，由发动机自身的热防护层覆盖。V2 每台保护罩重约 1 吨，33 台就是 33 吨。

对火箭来说，干重是死重。省下 33 吨，全部转化为运力。同一时期干重还有 120 → 105 吨的优化。这些改动加起来，才是"运力从 V2 的 35 吨级跳到 100 吨级"的物理来源。`,
      `<b>热分离改变的是回收物的经济性</b>：传统级间分离要扔掉整流罩——一个昂贵的大件。V3 让助推器燃料舱前穹顶直接暴露在尾焰中，靠<b>非结构钢屏蔽层 + 舱内推进剂压力</b>保护。

结果是回收的助推器不再带着必须抛弃的大件。这对"高频次复用"的影响，比减重本身更直接。`,
      `<b>把着陆用的燃料怎么送到发动机，是这一代最被低估的改动</b>：一级沿用三年的<b>内贮箱被取消</b>，换成一根<b>巨型隧道管</b>，直径<b>比 SpaceX 自己的猎鹰九号一级还粗</b>。

内贮箱的作用是着陆再点火时专门存燃料——因为大贮箱里的推进剂在失重下会乱飘，无法稳定供给发动机。这套系统在 V2 时代多次出问题，甚至直接导致回收失败。改成隧道管是要从根本上解决输送可靠性。Flight 12 的表现说明这个方案<b>可能还需要继续改进</b>。`,
      `<b>33 台同时点火才是真正的工程难点</b>：为了支撑全堆 33 台猛禽 3 同时点火，V3 的燃料输送管径加大到接近猎鹰九号一级的规模，底部快断接口也重新设计以加快地面周转。

地面侧同步升级：Pad 2 用了<b>水冷导流槽</b>（替代混凝土 + 喷水），20 个压紧臂全带保护门，塔架"筷子"从液压改成机电作动。SpaceX 的目标是支持从星舰基地<b>一年 25 次发射</b>——这才是高频次复用的真正瓶颈所在。`,
    ],
    specs: [
      { label: '全堆高度', value: '124.4 m（V2 为 123.1m）' },
      { label: '直径', value: '9 m' },
      { label: '助推器高度', value: '72 m（官网）' },
      { label: '起飞质量', value: '约 5533 吨' },
      { label: '发动机', value: '33 × 猛禽 3' },
      { label: '单台海平面推力', value: '250 tf（另有 280 tf 口径）' },
      { label: '单台真空推力', value: '275 tf' },
      { label: '33 台总推力（官网）', value: '8240 吨力' },
      { label: '猛禽 3 干质量', value: '<1525 kg，推重比 >180' },
      { label: '推进剂', value: '液氧 + 液甲烷（猛禽氧化剂）' },
      { label: 'LEO 运力', value: '100+ 吨（完全复用）' },
      { label: '一次性构型', value: '约 180–200 吨（估算）' },
      { label: '栅格翼', value: '3 片（V2 为 4 片）' },
      { label: 'Ship 发动机', value: '6 台（3 海平面 + 3 真空）' },
      { label: 'Ship 推力', value: '1614 吨力' },
      { label: 'Ship 推进剂', value: '1600 吨' },
      { label: '助推器推进剂', value: '3650 吨' },
      { label: '航电模块', value: '60 台 · 峰值 9MW' },
      { label: '摄像头', value: '约 50 个 · 480Mbps 星链下传' },
      { label: '对接口', value: '背风侧 4 个' },
      { label: '在轨飞行能力', value: '48 小时（真空夹套+低温管理）' },
      { label: '首飞', value: '2026-05-23 Flight 12' },
      { label: '发射场', value: 'Starbase Pad 2（水冷导流槽）' },
    ],
    comparison: {
      title: 'Starship V3 对比 V2',
      note: '基于 SpaceX 官方披露与公开技术分析整理',
      rows: [
        { label: '高度', prev: '123.1 m', curr: '124.4 m', delta: 'up' },
        { label: '发动机', prev: '33 × 猛禽 2（部分换装）', curr: '33 × 猛禽 3（全换）', delta: 'up' },
        { label: '单台海平面推力', prev: '230 tf', curr: '250 tf', delta: 'up' },
        { label: '猛禽干质量', prev: '1630 kg', curr: '1525 kg', delta: 'down' },
        { label: '栅格翼', prev: '4 片', curr: '3 片（单片 +50%）', delta: 'down' },
        { label: '级间分离', prev: '热分离（V2 首次）', curr: '热分离构型（无整流罩）', delta: 'up' },
        { label: '收集管路', prev: '标准', curr: '加大至近猎鹰九号一级', delta: 'up' },
        { label: 'LEO 运力（复用）', prev: '约 35 吨（未入轨）', curr: '100+ 吨', delta: 'up' },
        { label: '上面级回收', prev: '无计划', curr: '预留捕捉硬点', delta: 'up' },
        { label: '塔架作动', prev: '液压', curr: '机电', delta: 'up' },
        { label: '干重', prev: '约 120 吨', curr: '约 105 吨', delta: 'down' },
        { label: '目标发射频次', prev: '—', curr: '星舰基地 25 次/年', delta: 'up' },
      ],
    },
  };
}
