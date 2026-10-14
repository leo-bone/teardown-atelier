import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, metalMaterial, pcbMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * PlayStation 5 Pro —— 索尼第九世代高性能主机
 *
 * 公开规格：机身约 390 × 260 × 460 mm（竖放），重约 3.1 kg，
 * 内置电源升级到 390W（初代 PS5 为 350W），GPU 计算单元 60 个（初代 36），
 * 内存带宽提升 28%，支持 PCIe 4.0 M.2 SSD 扩展与可拆卸超高清蓝光光驱。
 *
 * 场景单位：1 = 100mm。整机 3.9 × 2.6 × 4.6
 */

const W = 3.9;   // 宽
const D = 2.6;   // 深
const H = 4.6;   // 高（竖放）

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// PS5 Pro 标志性的哑光白外壳（比纯白略灰，避免塑料感的"惨白"）
const SHELL = () => mat({ color: 0xeef0f2, metalness: 0.04, roughness: 0.44 });
const SHELL_INNER = () => mat({ color: 0xd8dbe0, metalness: 0.04, roughness: 0.5 });
const DARK = () => mat({ color: 0x23272c, metalness: 0.18, roughness: 0.52 });
const BLACK = () => mat({ color: 0x14171a, metalness: 0.1, roughness: 0.62 });
const ALU = () => metalMaterial(0xb9bec5, 0.3);
const FIN = () => mat({ color: 0xc6ccd3, metalness: 0.95, roughness: 0.24 });
const PCB = () => pcbMaterial();
const BLADE = () => mat({ color: 0x191d21, metalness: 0.05, roughness: 0.45, transparent: true, opacity: 0.86 });

export function ps5Pro(): Subject {
  const layers: Layer[] = [];

  // ============ 1. 外壳（顶盖 + 两侧板，全卡扣无螺丝） ============
  layers.push({
    id: 'shell',
    refImage: './ref/ps5/shell.jpg',
    name: '外壳 · 顶盖与两侧板',
    group: '结构',
    explodeDir: U(0, 1.5, -0.4),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const t = 0.09; // 壁厚

      // 左侧板（可整片拆下）
      const left = new THREE.Mesh(new RoundedBoxGeometry(t, H - 0.3, D - 0.2, 3, 0.05), SHELL());
      left.position.set(-W / 2 + t / 2, 0, 0);
      g.add(left);

      // 右侧板
      const right = left.clone();
      right.position.x = W / 2 - t / 2;
      g.add(right);

      // 顶盖（带弧面，PS5 的辨识特征）
      const top = new THREE.Mesh(new RoundedBoxGeometry(W - 0.12, t, D - 0.2, 4, 0.07), SHELL());
      top.position.y = H / 2 - 0.15 - t / 2;
      g.add(top);

      // 前面板（电源键 + USB）
      const front = new THREE.Mesh(new RoundedBoxGeometry(W - 0.1, 0.5, t, 3, 0.04), SHELL());
      front.position.set(0, H / 2 - 0.55, D / 2 - t / 2);
      g.add(front);

      // 卡扣示意：侧板内侧的卡钩
      [-1, 1].forEach((s) => {
        for (let i = 0; i < 4; i++) {
          const clip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), DARK());
          clip.position.set(s * (W / 2 - 0.12), -H / 2 + 0.6 + i * 0.75, D / 2 - 0.18);
          g.add(clip);
        }
      });

      // 底部支架孔位
      const base = new THREE.Mesh(new RoundedBoxGeometry(W - 0.1, t, D - 0.25, 3, 0.05), SHELL_INNER());
      base.position.y = -H / 2 + 0.15 + t / 2;
      g.add(base);

      return g;
    },
    hotspots: [
      {
        id: 'shell-clip',
        title: '全卡扣结构，没有螺丝',
        body: 'PS5 的外壳**完全靠卡扣固定**，正面和底面看不到一颗螺丝。好处是拆装快、不用找批头；代价是卡扣有寿命，反复拆会松。**正确手法是从底部开始撬**，从上盖硬掰会断钩。',
        anchor: U(-W / 2, H / 2 - 0.5, 0),
        dir: U(-1, 0.3, 0),
        stats: [
          { label: '固定方式', value: '卡扣' },
          { label: '螺丝数量', value: '外壳 0 颗' },
          { label: '拆解顺序', value: '从底部起' },
        ],
      },
    ],
  });

  // ============ 2. 散热系统（均热板 + 双进风风扇） ============
  layers.push({
    id: 'cooling',
    refImage: './ref/ps5/cooling.jpg',
    name: '散热系统 · 均热板与双风扇',
    group: '热学',
    explodeDir: U(0, 1.1, 0.9),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 均热板（覆盖 APU 的大面积铜腔）
      const vapor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 1.15), mat({ color: 0xb98a4a, metalness: 0.9, roughness: 0.32 }));
      vapor.position.set(0, 0.1, 0.15);
      g.add(vapor);

      // 散热鳍片阵列
      const finGroup = new THREE.Group();
      for (let i = 0; i < 26; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.52, 0.014), FIN());
        fin.position.set(0, 0.62, -0.55 + i * 0.044);
        finGroup.add(fin);
      }
      g.add(finGroup);

      // 热管（贯穿鳍片）
      [-0.55, 0, 0.55].forEach((x) => {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25, 12), mat({ color: 0xb98a4a, metalness: 0.92, roughness: 0.28 }));
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(x, 0.62, 0.05);
        g.add(pipe);
      });

      // 双进风风扇（120mm 级）
      [-0.72, 0.72].forEach((x) => {
        const fan = new THREE.Group();
        const frame = new THREE.Mesh(new RoundedBoxGeometry(1.05, 1.05, 0.1, 3, 0.06), DARK());
        fan.add(frame);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 20), BLACK());
        hub.rotation.x = Math.PI / 2;
        fan.add(hub);
        // 七叶扇
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const blade = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.012, 0.13, 2, 0.02), BLADE());
          blade.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0);
          blade.rotation.z = a + 0.5;
          fan.add(blade);
        }
        fan.position.set(x, -0.75, -0.15);
        g.add(fan);
      });

      // 防尘网
      const filter = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.02, 1.5), mat({ color: 0x2a2e33, metalness: 0.3, roughness: 0.85 }));
      filter.position.set(0, -1.42, -0.1);
      g.add(filter);

      return g;
    },
    hotspots: [
      {
        id: 'cooling-vapor',
        title: '均热板 + 液态金属',
        body: 'PS5 Pro 的 APU 用了**大面积均热板**直接接触顶盖，配合液态金属导热。这是它能在更小体积里塞进更多计算单元的关键——**散热设计直接决定了 SoC 能给多高的功耗**。代价是液态金属有偏移风险，拆散热模组时不能竖着搬机器。',
        anchor: U(0, 0.2, 0.2),
        dir: U(0, 1, 0.4),
        stats: [
          { label: '导热介质', value: '液态金属' },
          { label: '风扇', value: '双 120mm 级' },
          { label: '风道', value: '前进后出' },
        ],
      },
      {
        id: 'cooling-dust',
        title: '防尘网是清灰第一站',
        body: '两侧进风口的防尘网是最容易堵的件。堵了之后风量下降、温度上升、风扇转速拉高——**噪音变大往往是灰尘而不是轴承坏了**。拆下来用水冲、晾干再装，别用吸尘器硬吸。',
        anchor: U(0, -1.42, -0.1),
        dir: U(0, -1, 0),
        stats: [
          { label: '位置', value: '两侧进风口' },
          { label: '清理周期', value: '3–6 个月' },
          { label: '可水洗', value: '是' },
        ],
      },
    ],
  });

  // ============ 3. 电源（内置 390W） ============
  layers.push({
    id: 'power',
    refImage: './ref/ps5/power.jpg',
    name: '内置电源 · 390W',
    group: '能源',
    explodeDir: U(-1.4, -0.6, 0.5),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const housing = new THREE.Mesh(new RoundedBoxGeometry(1.15, 1.0, 1.5, 3, 0.05), DARK());
      g.add(housing);

      // 变压器（最重的单件）
      const trafo = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.5, 0.7, 2, 0.03), mat({ color: 0x1b1f24, metalness: 0.3, roughness: 0.6 }));
      trafo.position.set(0, 0.1, -0.2);
      g.add(trafo);

      // 主电容组（直立圆筒）
      for (let i = 0; i < 3; i++) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 16), mat({ color: 0x2b3a4a, metalness: 0.55, roughness: 0.4 }));
        cap.position.set(-0.35 + i * 0.35, 0.18, 0.42);
        g.add(cap);
      }

      // 电源风扇（对内吸风）
      const psuFan = new THREE.Group();
      const fr = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.75, 0.08, 3, 0.05), BLACK());
      psuFan.add(fr);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 18), DARK());
      hub.rotation.x = Math.PI / 2;
      psuFan.add(hub);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const b = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.01, 0.1, 2, 0.015), BLADE());
        b.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0);
        b.rotation.z = a + 0.5;
        psuFan.add(b);
      }
      psuFan.position.set(0, 0.62, 0.1);
      g.add(psuFan);

      // 交流输入座
      const inlet = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.22, 0.1, 2, 0.03), BLACK());
      inlet.position.set(0, -0.3, -0.78);
      g.add(inlet);

      return g;
    },
    hotspots: [
      {
        id: 'power-390',
        title: '390W，比初代多 40W',
        body: 'PS5 Pro 把内置电源从 350W 提到 **390W**，多出来的预算全给了 GPU。**主机的性能上限往往是供电和散热，而不是芯片本身**——这也是为什么 Pro 版能在同样架构下把计算单元从 36 个提到 60 个。',
        anchor: U(0, 0.2, 0.3),
        dir: U(-1, 0.2, 0.4),
        stats: [
          { label: '额定功率', value: '390 W' },
          { label: '初代 PS5', value: '350 W' },
          { label: 'GPU 计算单元', value: '60（初代 36）' },
        ],
      },
      {
        id: 'power-danger',
        title: '电源是整机最危险的一层',
        body: '内置电源即使拔掉电源线，**主电容里仍然存着高压电**，需要时间自然放电。拆机第一件事是拔线、等几分钟，不要一上手就去碰电源板。这是全机唯一能伤到人的一层。',
        anchor: U(0, -0.3, -0.78),
        dir: U(-0.6, -0.5, -0.6),
        stats: [
          { label: '危险等级', value: '高' },
          { label: '操作', value: '拔线后等待放电' },
          { label: '可否外场维修', value: '不建议' },
        ],
      },
    ],
  });

  // ============ 4. SSD 扩展槽 + 读卡器 ============
  layers.push({
    id: 'ssd',
    refImage: './ref/ps5/ssd.jpg',
    name: 'M.2 SSD 扩展槽',
    group: '存储',
    explodeDir: U(0, -0.4, 1.6),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 扩展槽托架
      const tray = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.06, 1.5, 3, 0.03), DARK());
      g.add(tray);

      // M.2 插槽
      const slot = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.05, 0.8, 2, 0.02), BLACK());
      slot.position.set(0, 0.05, -0.2);
      g.add(slot);

      // SSD 本体（2280 规格示意）
      const ssd = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.03, 0.8, 2, 0.015), mat({ color: 0x1d5f5a, metalness: 0.4, roughness: 0.4 }));
      ssd.position.set(0, 0.09, -0.2);
      g.add(ssd);

      // 散热片
      const spreader = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.03, 0.85, 2, 0.02), ALU());
      spreader.position.set(0, 0.13, -0.2);
      g.add(spreader);

      // 固定螺丝柱
      [-0.32, 0.32].forEach((z) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 10), ALU());
        post.position.set(0, 0.06, z);
        g.add(post);
      });

      return g;
    },
    hotspots: [
      {
        id: 'ssd-pcie4',
        title: 'PCIe 4.0 ×4，但不支持 Gen5',
        body: '扩展槽走 **PCIe 4.0 ×4**，带宽约 7 GB/s 量级。索尼对 SSD 有最低读取速度要求，太慢的盘会影响游戏加载——这不是营销话术，是实测门限。装第三方 SSD **不影响保修**，这是索尼明确表态过的。',
        anchor: U(0, 0.1, -0.2),
        dir: U(0, 0.6, 1),
        stats: [
          { label: '接口', value: 'PCIe 4.0 ×4' },
          { label: '规格', value: 'M.2 2280' },
          { label: '保条', value: '允许加装' },
        ],
      },
    ],
  });

  // ============ 5. 主板（APU + GDDR6） ============
  layers.push({
    id: 'board',
    refImage: './ref/ps5/board.jpg',
    name: '主板 · APU 与显存',
    group: '电子',
    explodeDir: U(0, -1.3, 0.3),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const board = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.05, 1.6, 3, 0.03), PCB());
      g.add(board);

      // APU（CPU+GPU 单封装，PS5 的核心特征）
      const apu = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.09, 0.62, 3, 0.03), mat({ color: 0x1a1f24, metalness: 0.55, roughness: 0.3 }));
      apu.position.set(-0.35, 0.06, 0.1);
      g.add(apu);
      const apuDie = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.4), mat({ color: 0x2f7f6f, metalness: 0.8, roughness: 0.22 }));
      apuDie.position.set(-0.35, 0.11, 0.1);
      g.add(apuDie);

      // GDDR6 显存颗粒（围绕 APU 一圈）
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const mem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.12), BLACK());
        mem.position.set(-0.35 + Math.cos(a) * 0.52, 0.045, 0.1 + Math.sin(a) * 0.52);
        g.add(mem);
      }

      // 供电模组（多相）
      for (let i = 0; i < 6; i++) {
        const ch = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.06, 0.22, 2, 0.02), mat({ color: 0x2a2f35, metalness: 0.6, roughness: 0.4 }));
        ch.position.set(0.55, 0.05, -0.5 + i * 0.2);
        g.add(ch);
      }

      // 内存（统一 16GB GDDR6）
      const ram = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.05, 0.18, 2, 0.02), mat({ color: 0x0f3f6b, metalness: 0.3, roughness: 0.5 }));
      ram.position.set(0.45, 0.045, 0.5);
      g.add(ram);

      // 无线模块
      const wifi = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.04, 0.22, 2, 0.02), mat({ color: 0x2a2f35, metalness: 0.4, roughness: 0.5 }));
      wifi.position.set(0.7, 0.04, -0.5);
      g.add(wifi);

      return g;
    },
    hotspots: [
      {
        id: 'board-soc',
        title: 'CPU 与 GPU 在同一颗封装里',
        body: 'PS5 的 APU 把 **CPU 和 GPU 做进同一颗芯片**，共享 16GB GDDR6 统一内存。这是主机与 PC 最大的架构差异：PC 有独立显存和系统内存，主机只有一份内存、一个地址空间。好处是省成本、省延迟；代价是**内存带宽就是显存带宽**，GPU 能分到多少是硬上限。',
        anchor: U(-0.35, 0.12, 0.1),
        dir: U(0, 1, 0.3),
        stats: [
          { label: '架构', value: 'CPU+GPU 单封装' },
          { label: '统一内存', value: '16 GB GDDR6' },
          { label: 'Pro 计算单元', value: '60 CUs' },
        ],
      },
    ],
  });

  // ============ 6. 可拆卸超高清蓝光光驱 ============
  layers.push({
    id: 'disc',
    refImage: './ref/ps5/disc.jpg',
    name: '可拆卸超高清蓝光光驱',
    group: '存储',
    explodeDir: U(1.5, -0.3, 0.6),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const housing = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.55, 1.35, 3, 0.05), DARK());
      g.add(housing);

      // 托盘
      const tray = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.04, 1.2, 3, 0.03), BLACK());
      tray.position.y = 0.2;
      g.add(tray);

      // 光盘（示意）
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.012, 32), mat({ color: 0xc8ccd2, metalness: 0.7, roughness: 0.15, side: THREE.DoubleSide }));
      disc.rotation.x = Math.PI / 2;
      disc.position.y = 0.23;
      g.add(disc);

      // 激光头
      const laser = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.1, 0.2, 2, 0.02), mat({ color: 0x8a3a3a, metalness: 0.4, roughness: 0.4 }));
      laser.position.set(0, -0.1, 0.2);
      g.add(laser);

      // 接口
      const connector = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.06, 0.08, 2, 0.02), ALU());
      connector.position.set(0, 0.3, -0.7);
      g.add(connector);

      return g;
    },
    hotspots: [
      {
        id: 'disc-detachable',
        title: '光驱是可拆卸的，不是焊死的',
        body: 'PS5 的光驱是**独立可拆卸模块**，用螺丝和接口固定，数字版用户后期可以自己加装。这背后是一个商业判断：把"要不要光驱"的选择权留给用户，比做两个 SKU 更省库存。**代价是接口成为额外故障点**，接触不良会导致读盘失败。',
        anchor: U(0, 0.3, -0.7),
        dir: U(1, 0.2, -0.4),
        stats: [
          { label: '安装方式', value: '可拆卸模块' },
          { label: '格式', value: '超高清蓝光' },
          { label: '兼容', value: 'PS4 / 蓝光影片' },
        ],
      },
    ],
  });

  // ============ 7. 前置接口板 ============
  layers.push({
    id: 'io',
    refImage: './ref/ps5/io.jpg',
    name: '前置接口板 · USB-C / USB-A',
    group: '电子',
    explodeDir: U(0, 1.6, 1.2),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const board = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.05, 0.3, 3, 0.03), PCB());
      g.add(board);

      // USB-C（前置高速口，手柄充电 / 扩展坞）
      const usbc = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.07, 0.14, 3, 0.02), metalMaterial(0x8a9096, 0.25));
      usbc.position.set(-0.42, 0.03, 0);
      g.add(usbc);

      // USB-A ×2
      [-0.05, 0.2].forEach((x) => {
        const usba = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.06, 0.12, 2, 0.015), metalMaterial(0x8a9096, 0.25));
        usba.position.set(x, 0.03, 0);
        g.add(usba);
      });

      // 电源键排线
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.3), mat({ color: 0xd4a017, metalness: 0.5, roughness: 0.4 }));
      ribbon.position.set(0.55, 0.02, -0.05);
      g.add(ribbon);

      // 电源指示灯导光柱
      const led = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), mat({ color: 0xffffff, emissive: 0x66aaff, emissiveIntensity: 0.8 }));
      led.rotation.z = Math.PI / 2;
      led.position.set(0.5, 0.03, 0.05);
      g.add(led);

      return g;
    },
    hotspots: [
      {
        id: 'io-usbc',
        title: '前置 USB-C 是 Pro 新增的高速口',
        body: 'PS5 Pro 在前面加了一个 **USB-C（10 Gbps）**，后面也升级了一个。插外置 SSD 打游戏要走这种高速口——USB-A 的口带宽不够，会拖慢加载。**选外接盘先看接口，再看标称速度。**',
        anchor: U(-0.42, 0.04, 0),
        dir: U(0, 0.5, 1),
        stats: [
          { label: '前置 USB-C', value: '10 Gbps' },
          { label: '前置 USB-A', value: '高速（Hi-Speed）' },
          { label: '外接 SSD', value: '须走 USB-C' },
        ],
      },
    ],
  });

  return {
    id: 'ps5',
    name: 'PlayStation 5 Pro',
    subtitle: 'Sony Interactive · 2024 年 11 月 · 第九世代高性能主机',
    tagline: 'GPU 计算单元从 36 提到 60、带宽 +28%、390W 电源——同架构下的完全体',
    headline: [
      { label: 'GPU 计算单元', value: '60', unit: 'CUs' },
      { label: '内存带宽', value: '576', unit: 'GB/s' },
      { label: '内置电源', value: '390', unit: 'W' },
      { label: '机身重量', value: '3.1', unit: 'kg' },
    ],
    background: 0xeef1f4,
    accent: '#2b6cb0',
    camera: { position: [4.2, 3.4, 6.6], target: [0, 0, 0] },
    explodeScale: 1,
    sectionable: true,
    overview:
      'PS5 Pro 是"同架构、更高功耗预算"的完全体：芯片没换代，靠**更大的供电与散热余量**把 GPU 计算单元从 36 个开到 60 个，内存带宽提升 28%。' +
      '这台机器最值得看的不是芯片，而是**散热与供电如何决定性能上限**——均热板 + 液态金属 + 390W 电源，三者共同撑起了这部分提升。',
    narrative: [
      '**性能上限由散热和供电决定，不由芯片决定。** 同样的 APU 架构，初代 350W / Pro 390W，差距全在能耗预算上。这也是所有主机代际改良的共同套路：芯片不变，功耗与散热升级。',
      '**主机与 PC 的架构分界在内存。** CPU 与 GPU 共享同一份 16GB GDDR6、同一个地址空间，没有独立显存。省成本、省延迟，但内存带宽就是显存带宽，GPU 能分到多少是硬上限。',
      '**可拆卸光驱是一个库存决策。** 不做两个 SKU，而是让用户自己决定要不要光驱——代价是多一个机械接口，也就多一个故障点。',
      '**全卡扣外壳。** 正面和底面看不到一颗螺丝，拆装快，但卡扣有寿命，反复拆会松。',
    ],
    specs: [
      { label: '机身尺寸', value: '约 390 × 260 × 460 mm（竖放）' },
      { label: '重量', value: '约 3.1 kg' },
      { label: 'GPU', value: '60 计算单元（初代 36）', note: 'RDNA 2 架构，频率提升' },
      { label: '内存', value: '16 GB GDDR6', note: '带宽 576 GB/s，+28%' },
      { label: '内置电源', value: '390 W（初代 350 W）' },
      { label: '存储扩展', value: 'M.2 PCIe 4.0 ×4', note: '允许用户加装，不影响保条' },
      { label: '光驱', value: '可拆卸超高清蓝光' },
      { label: '散热', value: '均热板 + 液态金属 + 双 120mm 风扇' },
    ],
    repairability: {
      score: 7,
      difficulty: '中等',
      tools: ['十字螺丝刀', '塑料撬片', '压缩空气 / 软毛刷'],
      note: '外壳无螺丝、SSD 与光驱可自行更换；电源与 APU 不建议外场维修',
    },
    fidelity: {
      actualParts: 0,
      source: '无权威拆解资料逐件清点（本主体按公开规格与工程常理建模）',
      modeledLayers: 7,
      modeledParts: 62,
      note: '模型表达 7 个功能子系统，不是零件级清单。',
    },
    layers,
    steps: [
      {
        id: 'p-s1',
        title: '拔电源线，静置等待电容放电',
        body: '拆机第一步永远是断电。内置电源的主电容在拔线后仍存有高压电，**必须静置几分钟**。这是全机唯一能伤到人的一层。',
        layers: ['power'],
        tools: ['无'],
        stats: [{ label: '等待', value: '3–5 分钟' }],
      },
      {
        id: 'p-s2',
        title: '从底部撬开外壳卡扣',
        body: '外壳全卡扣、无螺丝。**从底部开始撬**，沿侧板逐排松开；从上盖硬掰会断钩。拆下的白色侧板要放平，刮花很难补救。',
        layers: ['shell'],
        tools: ['塑料撬片'],
        stats: [{ label: '螺丝', value: '0 颗' }, { label: '起点', value: '底部' }],
      },
      {
        id: 'p-s3',
        title: '取下防尘网，清灰',
        body: '两侧进风口的防尘网先拆下来冲水晾干。**这一步做了，后面所有拆卸都干净得多**，也能顺便看清风道堵塞情况。',
        layers: ['cooling'],
        tools: ['软毛刷', '清水'],
        stats: [{ label: '周期', value: '3–6 个月' }],
      },
      {
        id: 'p-s4',
        title: '断开风扇排线，拆散热模组',
        body: '断开两个风扇的排线，再松开散热模组固定螺丝。**注意：整机不能竖着搬**——液态金属在重力下会偏移，必须保持原朝向平移。',
        layers: ['cooling'],
        tools: ['十字螺丝刀'],
        stats: [{ label: '风险', value: '液态金属偏移' }, { label: '朝向', value: '保持水平平移' }],
      },
      {
        id: 'p-s5',
        title: '拆下电源模块',
        body: '松开电源固定螺丝，断开主板供电接口。电源是重金属件，单手托不住——先松螺丝再托底。',
        layers: ['power'],
        tools: ['十字螺丝刀'],
        stats: [{ label: '重量', value: '约 1 kg 级' }],
      },
      {
        id: 'p-s6',
        title: '取下 M.2 SSD 与光驱模块',
        body: 'SSD 扩展槽和光驱都是可拆卸模块，各一颗螺丝。**这两项用户可自行更换，不影响保条**——是整机里最"友好"的两个件。',
        layers: ['ssd', 'disc'],
        tools: ['十字螺丝刀'],
        stats: [{ label: '保条', value: '不影响' }],
      },
      {
        id: 'p-s7',
        title: '断开前置接口板，取出主板',
        body: '最后断开前置 USB 板的排线与无线模块天线，取出主板。到这一层就是 APU + GDDR6 单封装——**主机与 PC 架构差异的全部分界点**。',
        layers: ['io', 'board'],
        tools: ['十字螺丝刀', '防静电镊子'],
        stats: [{ label: '核心', value: 'APU 单封装' }],
      },
    ],
  };
}
