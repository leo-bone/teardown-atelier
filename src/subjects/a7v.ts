import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, metalMaterial, pcbMaterial, glassMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * Sony A7 V —— 全画幅微单（第七代基准机型）
 *
 * 公开规格：约 131 × 63 × 79.4 mm，机身重约 614 g（含电池与存储卡），
 * 3300 万像素全画幅堆栈式 CMOS，BIONZ XR 处理器，8 级 5 轴防抖，
 * 944 万点 EVF，双卡槽 CFexpress Type A / SD，NP-FZ100 电池。
 *
 * 场景单位：1 = 10mm。机身 13.1 × 6.3 × 7.94
 */

const S = 0.1; // 1mm = 0.1 单位 => 1 单位 = 10mm
const W = 131 * S;
const H = 79.4 * S;
const D = 63 * S;

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const BODY = () => mat({ color: 0x1b1e22, metalness: 0.25, roughness: 0.55 });
const BODY_LIGHT = () => mat({ color: 0x2a2e33, metalness: 0.2, roughness: 0.5 });
const RUBBER = () => mat({ color: 0x14161a, metalness: 0.05, roughness: 0.85 });
const ALU = () => metalMaterial(0xa8adb4, 0.28);
const PCB = () => pcbMaterial();
const LENS_GLASS = () => glassMaterial(0x1a2a3a, 0.55);
const SENSOR_GLASS = () => glassMaterial(0x0a1420, 0.35);

export function sonyA7V(): Subject {
  const layers: Layer[] = [];

  // ============ 1. 机身外壳（镁合金 + 蒙皮） ============
  layers.push({
    id: 'body',
    refImage: './ref/a7v/body.jpg',
    name: '机身外壳 · 镁合金骨架',
    group: '结构',
    explodeDir: U(0, 1.6, -0.5),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const t = 0.06;

      // 前壳（卡口座 + 手柄前沿）
      const front = new THREE.Mesh(new RoundedBoxGeometry(W, H, t, 4, 0.08), BODY());
      front.position.z = D / 2 - t / 2;
      g.add(front);

      // 后背（含屏幕位置）
      const back = new THREE.Mesh(new RoundedBoxGeometry(W - 0.2, H - 0.2, t, 4, 0.08), BODY());
      back.position.set(0, -0.1, -D / 2 + t / 2);
      g.add(back);

      // 顶盖（含军舰部 EVF 隆起）
      const top = new THREE.Mesh(new RoundedBoxGeometry(W - 0.1, t, D - 0.2, 4, 0.07), BODY_LIGHT());
      top.position.y = H / 2 - t / 2;
      g.add(top);
      const hump = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.22, D * 0.72, 4, 0.06), BODY_LIGHT());
      hump.position.set(-0.1, H / 2 + 0.08, -0.15);
      g.add(hump);

      // 底盖
      const bottom = new THREE.Mesh(new RoundedBoxGeometry(W - 0.1, t, D - 0.2, 4, 0.07), BODY_LIGHT());
      bottom.position.y = -H / 2 + t / 2;
      g.add(bottom);

      // 手柄蒙皮
      const grip = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.95, D * 0.78, 5, 0.09), RUBBER());
      grip.position.set(W / 2 - 0.2, -0.28, -0.12);
      g.add(grip);

      // 拇指托蒙皮
      const thumb = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.5, 0.1, 4, 0.04), RUBBER());
      thumb.position.set(-W / 2 + 0.2, -0.25, -D / 2 + 0.12);
      g.add(thumb);

      // 卡口（E 卡口，金属）
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32), ALU());
      mount.rotation.x = Math.PI / 2;
      mount.position.set(0, 0.05, D / 2 + 0.02);
      g.add(mount);

      return g;
    },
    hotspots: [
      {
        id: 'body-mg',
        title: '镁合金骨架，不是塑料壳',
        body: 'A7 系列的骨架是**镁合金压铸**，外面再包工程塑料与蒙皮。镁合金的比强度高、减震好，所以相机能在 600g 出头的重量里撑住全画幅的刚度需求。**摔机时最先碎的是卡口和军舰部**，这两处是力流集中的地方。',
        anchor: U(0, H / 2, 0),
        dir: U(0, 1, 0.3),
        stats: [
          { label: '骨架材料', value: '镁合金' },
          { label: '机身重量', value: '约 614 g' },
          { label: '易损点', value: '卡口 / 军舰部' },
        ],
      },
    ],
  });

  // ============ 2. 传感器（3300 万像素堆栈式 CMOS） ============
  layers.push({
    id: 'sensor',
    refImage: './ref/a7v/sensor.jpg',
    name: '传感器 · 3300 万像素堆栈 CMOS',
    group: '光学',
    explodeDir: U(0, 0.1, 1.9),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 传感器安装板
      const plate = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.75, 0.05, 3, 0.03), BODY_LIGHT());
      g.add(plate);

      // 传感器本体
      const sensor = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.48, 0.05, 3, 0.02), mat({ color: 0x1a2530, metalness: 0.4, roughness: 0.35 }));
      sensor.position.z = 0.04;
      g.add(sensor);

      // 保护玻璃（低通 + 防污涂层）
      const coverGlass = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.5, 0.012), SENSOR_GLASS());
      coverGlass.position.z = 0.075;
      g.add(coverGlass);

      // 柔性排线
      const flex = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.012, 0.5), mat({ color: 0xd4a017, metalness: 0.5, roughness: 0.4 }));
      flex.position.set(-0.3, 0, -0.28);
      g.add(flex);

      // 堆栈式示意：背照式 + 缓存层的分层色
      const stack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.46, 0.02), mat({ color: 0x2f5f7f, metalness: 0.6, roughness: 0.25 }));
      stack.position.z = 0.015;
      g.add(stack);

      return g;
    },
    hotspots: [
      {
        id: 'sensor-stacked',
        title: '堆栈式：像素层与电路层分离',
        body: '堆栈式 CMOS 把**像素层和电路层做成两颗片子再键合在一起**，缓存放在像素旁边。好处是读取速度快一个量级——这才是电子快门能跟上、果冻效应能压住的根本原因。**传感器是相机里唯一不可"修"的核心件**，进灰可以清洁，坏点只能换。',
        anchor: U(0, 0, 0.08),
        dir: U(0, 0.3, 1),
        stats: [
          { label: '有效像素', value: '约 3300 万' },
          { label: '画幅', value: '全画幅 35.6 × 23.8 mm' },
          { label: '结构', value: '堆栈式（背照 + 缓存）' },
        ],
      },
      {
        id: 'sensor-dust',
        title: '传感器进灰是微单的宿命',
        body: '可换镜头意味着卡口永远对大气开放，换镜时灰尘必然往里跑。**低通玻璃上的灰能用气吹吹掉，落在传感器上的必须用传感器清洁模式 + 专用棒**。别用嘴吹——唾液会永久污染镀膜。',
        anchor: U(0.2, 0.2, 0.09),
        dir: U(0.5, 0.4, 1),
        stats: [
          { label: '风险', value: '换镜进灰' },
          { label: '处理', value: '气吹 / 清洁棒' },
          { label: '禁忌', value: '不要用嘴吹' },
        ],
      },
    ],
  });

  // ============ 3. 电子取景器（944 万点 EVF） ============
  layers.push({
    id: 'evf',
    refImage: './ref/a7v/evf.jpg',
    name: '电子取景器 · 944 万点',
    group: '光学',
    explodeDir: U(-0.3, 1.9, -0.2),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // EVF 模组外壳
      const housing = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.5, 0.42, 4, 0.05), BODY());
      g.add(housing);

      // 目镜罩
      const eyecup = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.38, 0.16, 5, 0.07), RUBBER());
      eyecup.position.set(0, 0.05, -0.26);
      g.add(eyecup);

      // 微型 OLED 面板
      const micro = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.02), mat({ color: 0x0a1a2a, metalness: 0.3, roughness: 0.2 }));
      micro.position.set(0, 0, 0.14);
      g.add(micro);

      // 取景器镜片组
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20), LENS_GLASS());
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, -0.12);
      g.add(lens);

      // 眼启动传感器
      const eyeSensor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), mat({ color: 0x3a2a2a, metalness: 0.3, roughness: 0.5 }));
      eyeSensor.position.set(0.2, 0.14, -0.2);
      g.add(eyeSensor);

      return g;
    },
    hotspots: [
      {
        id: 'evf-944',
        title: '944 万点，取景器也是主显示',
        body: 'A7 V 的 EVF 是 **944 万点 OLED**，放大倍率与清晰度已经接近光学取景器的观感。它还有一个实用价值：**强光下屏幕看不见，取景器照样能构图**——这是微单相对单反最大的体验优势之一。',
        anchor: U(0, 0, -0.2),
        dir: U(-0.4, 0.6, -1),
        stats: [
          { label: '点数', value: '944 万' },
          { label: '类型', value: 'OLED' },
          { label: '眼启动', value: '支持' },
        ],
      },
    ],
  });

  // ============ 4. 快门与五轴防抖机构 ============
  layers.push({
    id: 'shutter',
    refImage: './ref/a7v/shutter.jpg',
    name: '快门与五轴防抖机构',
    group: '机械',
    explodeDir: U(0, -1.5, 1.1),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 快门组件（前帘 + 后帘）
      const shutterBox = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.62, 0.22, 3, 0.03), BODY_LIGHT());
      g.add(shutterBox);

      // 帘幕（两道狭缝）
      [0.06, -0.06].forEach((y) => {
        const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.05, 0.16), mat({ color: 0x2a2f36, metalness: 0.4, roughness: 0.5 }));
        curtain.position.y = y;
        g.add(curtain);
      });

      // 传感器位移平台（5 轴防抖的执行端）
      const platform = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.6, 0.08, 4, 0.04), ALU());
      platform.position.z = -0.16;
      g.add(platform);

      // 防抖作动器（四角 + 三轴）
      const corners: [number, number][] = [
        [-0.32, 0.24],
        [0.32, 0.24],
        [-0.32, -0.24],
        [0.32, -0.24],
      ];
      corners.forEach(([x, y]) => {
        const act = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 12), metalMaterial(0x8a9096, 0.2));
        act.position.set(x, y, -0.2);
        g.add(act);
      });

      // 中心悬浮磁体
      const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 16), mat({ color: 0x4a4f55, metalness: 0.9, roughness: 0.3 }));
      magnet.position.z = -0.2;
      g.add(magnet);

      return g;
    },
    hotspots: [
      {
        id: 'shutter-ibis',
        title: '5 轴防抖靠的是传感器自己动',
        body: '机身防抖（IBIS）不是靠镜头，而是**把传感器装在一个能微动的平台上，用电磁作动器做五个自由度的补偿**。这就是为什么带防抖的机身配任何镜头都能获得稳定收益。**机械快门有寿命（约 30 万次量级），电子快门没有**——拍高帧率视频时优先用电子快门。',
        anchor: U(0, 0, -0.2),
        dir: U(0, -0.4, 1),
        stats: [
          { label: '补偿轴数', value: '5 轴' },
          { label: '效果', value: '约 8 级' },
          { label: '快门寿命', value: '约 30 万次' },
        ],
      },
    ],
  });

  // ============ 5. 主板（BIONZ XR + 电源管理） ============
  layers.push({
    id: 'board',
    refImage: './ref/a7v/board.jpg',
    name: '主板 · BIONZ XR 图像处理器',
    group: '电子',
    explodeDir: U(1.5, -0.6, -0.4),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const board = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.95, 0.05, 3, 0.03), PCB());
      g.add(board);

      // BIONZ XR 处理器
      const soc = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.28, 0.07, 3, 0.02), mat({ color: 0x1a1f24, metalness: 0.55, roughness: 0.3 }));
      soc.position.set(-0.25, 0.2, 0.04);
      g.add(soc);

      // 缓存内存
      const ram = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.14, 0.04, 2, 0.015), mat({ color: 0x0f3f6b, metalness: 0.3, roughness: 0.5 }));
      ram.position.set(0.1, 0.28, 0.04);
      g.add(ram);

      // 供电模组（相机最热的区域之一）
      for (let i = 0; i < 5; i++) {
        const ch = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.1, 0.05, 2, 0.015), mat({ color: 0x2a2f35, metalness: 0.6, roughness: 0.4 }));
        ch.position.set(-0.5 + i * 0.22, -0.25, 0.04);
        g.add(ch);
      }

      // 无线模块（Wi-Fi / 蓝牙）
      const wifi = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.2, 0.04, 2, 0.015), mat({ color: 0x2a2f35, metalness: 0.4, roughness: 0.5 }));
      wifi.position.set(0.42, -0.22, 0.04);
      g.add(wifi);

      // 接口板连接器（HDMI / USB-C / 麦克风）
      const ports = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.12, 0.06, 3, 0.02), metalMaterial(0x8a9096, 0.25));
      ports.position.set(0, -0.42, 0.03);
      g.add(ports);

      return g;
    },
    hotspots: [
      {
        id: 'board-soc',
        title: 'BIONZ XR：相机算力比像素更重要',
        body: '3300 万像素的原始数据量极大，**处理器算力直接决定了连拍张数、对焦响应和噪点控制**。BIONZ XR 相比前代算力提升约 8 倍，这才是新一代机型真正"新一代"的地方——传感器像素常常原地踏步。',
        anchor: U(-0.25, 0.22, 0.05),
        dir: U(-0.5, 0.6, 0.6),
        stats: [
          { label: '处理器', value: 'BIONZ XR' },
          { label: '算力提升', value: '约 8×（对前代）' },
          { label: '连拍', value: '10 fps（机械）' },
        ],
      },
    ],
  });

  // ============ 6. 电池与手柄（NP-FZ100） ============
  layers.push({
    id: 'battery',
    refImage: './ref/a7v/battery.jpg',
    name: '电池仓 · NP-FZ100',
    group: '能源',
    explodeDir: U(0, -1.9, -0.6),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 电池本体（插入手柄内部）
      const battery = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.62, 0.28, 4, 0.04), mat({ color: 0x2b3038, metalness: 0.3, roughness: 0.5 }));
      battery.position.set(W / 2 - 0.32, -0.34, -0.05);
      g.add(battery);

      // 电池标签面
      const label = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.01), mat({ color: 0xd8dbe0, metalness: 0.05, roughness: 0.7 }));
      label.position.set(W / 2 - 0.32, -0.34, 0.1);
      g.add(label);

      // 触点
      for (let i = 0; i < 4; i++) {
        const contact = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), metalMaterial(0xd4af37, 0.2));
        contact.position.set(W / 2 - 0.32, -0.5 + i * 0.08, 0.2);
        g.add(contact);
      }

      // 电池仓门
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.66, 0.04, 4, 0.03), BODY_LIGHT());
      door.position.set(W / 2 - 0.32, -0.34, -0.22);
      g.add(door);

      return g;
    },
    hotspots: [
      {
        id: 'battery-fz100',
        title: 'NP-FZ100：一块电池撑一整天',
        body: '2280 mAh 的 NP-FZ100 在 A7 系列上能拍 **600–700 张（CIPA）**，是微单里续航最好的梯队之一。它是**插拔式设计，用户可以自己换**——这是相机与手机在维护性上最大的分野：手机电池换起来是破坏性作业，相机是设计好的日常操作。',
        anchor: U(W / 2 - 0.32, -0.34, -0.05),
        dir: U(1, -0.3, -0.4),
        stats: [
          { label: '型号', value: 'NP-FZ100' },
          { label: '容量', value: '2280 mAh / 7.2 V' },
          { label: '续航', value: '约 600–700 张' },
        ],
      },
    ],
  });

  // ============ 7. 双卡槽（CFexpress Type A + SD） ============
  layers.push({
    id: 'slots',
    refImage: './ref/a7v/slots.jpg',
    name: '双卡槽 · CFexpress A + SD',
    group: '存储',
    explodeDir: U(-1.6, -1.0, 0.4),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const housing = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.42, 0.34, 4, 0.04), BODY_LIGHT());
      g.add(housing);

      // CFexpress Type A 槽
      const cfa = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.24), metalMaterial(0x8a9096, 0.25));
      cfa.position.set(-0.13, 0.06, 0);
      g.add(cfa);

      // SD 槽（UHS-II）
      const sd = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.035, 0.22), metalMaterial(0x8a9096, 0.25));
      sd.position.set(0.17, 0.06, 0);
      g.add(sd);

      // 卡片（示意，CFexpress 更短）
      const cardA = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.2), mat({ color: 0x1a2530, metalness: 0.4, roughness: 0.4 }));
      cardA.position.set(-0.13, 0.12, 0);
      g.add(cardA);
      const cardB = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.028, 0.18), mat({ color: 0x2a1f30, metalness: 0.4, roughness: 0.4 }));
      cardB.position.set(0.17, 0.12, 0);
      g.add(cardB);

      // 仓门
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.46, 0.04, 4, 0.03), BODY());
      door.position.set(0, 0, -0.19);
      g.add(door);

      return g;
    },
    hotspots: [
      {
        id: 'slots-dual',
        title: '为什么专业机身要双卡槽',
        body: 'CFexpress Type A 负责高速连拍与高码率视频，SD 负责兼容与备份。**双卡最大的价值不是容量，是可以设置"同时写入两张卡"**——婚礼、新闻这类不可重拍的场景，丢一张卡的代价远大于一张卡的钱。',
        anchor: U(-0.13, 0.06, 0),
        dir: U(-0.6, -0.5, 0.6),
        stats: [
          { label: '槽 1', value: 'CFexpress Type A' },
          { label: '槽 2', value: 'SD UHS-II' },
          { label: '备份模式', value: '支持双写' },
        ],
      },
    ],
  });

  return {
    id: 'a7v',
    name: 'Sony A7 V',
    subtitle: 'Sony · 全画幅微单 · 第七代基准机型',
    tagline: '3300 万像素堆栈 CMOS + BIONZ XR + 8 级五轴防抖，影像旗舰的工程基准',
    headline: [
      { label: '有效像素', value: '3300', unit: '万' },
      { label: '机身防抖', value: '8', unit: '级' },
      { label: '机身重量', value: '614', unit: 'g' },
      { label: 'EVF', value: '944', unit: '万点' },
    ],
    background: 0xeef1f4,
    accent: '#b11226',
    camera: { position: [12, 9, 20], target: [0, 0, 0] },
    explodeScale: 1,
    sectionable: true,
    overview:
      'A7 V 代表全画幅微单的工程基准：3300 万像素**堆栈式 CMOS**、BIONZ XR 处理器、8 级五轴机身防抖、944 万点 EVF。' +
      '这台机器真正值得看的不是参数表，而是**"堆栈式传感器 + 传感器位移防抖 + 单封装处理器"这三件事如何互相成就**——它们共同决定了相机能不能跟上移动的被摄体。',
    narrative: [
      '**堆栈式是响应速度的分水岭。** 像素层与电路层分离、缓存就近放置，读取速度提升一个量级。没有它，电子快门跟不上、果冻效应压不住、连拍缓存也撑不起来。',
      '**机身防抖把稳定收益从镜头解放出来。** IBIS 让传感器自己动，配任何镜头都能获得稳定。这是微单相对单反最被低估的优势——单反靠反光镜预升，本质上是在回避问题。',
      '**相机算力比像素更决定体验。** BIONZ XR 的提升幅度远大于传感器像素的提升幅度。传感器常常原地踏步，处理器才是代际差。',
      '**可换镜头与可换电池是相机最后的结构性优势。** 进灰、触点氧化、电池老化都是可维护的；手机把这些都焊死了。',
    ],
    specs: [
      { label: '机身尺寸', value: '约 131 × 63 × 79.4 mm' },
      { label: '机身重量', value: '约 614 g（含电池与卡）' },
      { label: '传感器', value: '3300 万像素全画幅堆栈 CMOS', note: '35.6 × 23.8 mm' },
      { label: '处理器', value: 'BIONZ XR', note: '算力约为前代 8 倍' },
      { label: '防抖', value: '5 轴机身防抖，约 8 级' },
      { label: '取景器', value: '944 万点 OLED EVF' },
      { label: '存储', value: 'CFexpress Type A + SD UHS-II 双卡槽' },
      { label: '电池', value: 'NP-FZ100，约 600–700 张' },
    ],
    repairability: {
      score: 8,
      difficulty: '中等',
      tools: ['十字螺丝刀', '塑料撬片', '气吹 / 传感器清洁棒', '防静电手环'],
      note: '电池与存储卡可自行更换；传感器与快门组件建议送修',
    },
    fidelity: {
      actualParts: 0,
      source: '无权威拆解资料逐件清点（本主体按公开规格与工程常理建模）',
      modeledLayers: 7,
      modeledParts: 54,
      note: '模型表达 7 个功能子系统，不是零件级清单。',
    },
    layers,
    steps: [
      {
        id: 'a-s1',
        title: '取电池与存储卡',
        body: '微单拆机从取电池开始——**这是全机唯一"设计好让你日常拆"的件**。顺手把两张卡也取出，避免排线拉扯时带松卡槽。',
        layers: ['battery', 'slots'],
        tools: ['无'],
        stats: [{ label: '顺序', value: '先取电' }],
      },
      {
        id: 'a-s2',
        title: '拆底盖与侧盖，露主板',
        body: '松开底盖与左侧盖的螺丝。**螺丝要按位置分类摆放**——A7 系列机身螺丝规格不统一，混装会拧花螺纹。',
        layers: ['body'],
        tools: ['十字螺丝刀'],
        stats: [{ label: '注意', value: '螺丝按位分类' }],
      },
      {
        id: 'a-s3',
        title: '断开排线，取出主板',
        body: '依次断开传感器排线、EVF 排线与接口板排线，再取出主板。**排线扣件要垂直抬起，不要平着撕**——平撕是扯断排线最常见的原因。',
        layers: ['board'],
        tools: ['防静电镊子', '塑料撬片'],
        stats: [{ label: '风险', value: '排线撕裂' }],
      },
      {
        id: 'a-s4',
        title: '拆 EVF 模组',
        body: '从军舰部取出 EVF 模组。944 万点的微型 OLED 是**整套系统里最贵的单件之一**，拆卸时不要压到目镜罩。',
        layers: ['evf'],
        tools: ['十字螺丝刀'],
        stats: [{ label: '点数', value: '944 万' }],
      },
      {
        id: 'a-s5',
        title: '拆快门与传感器防抖平台',
        body: '松开快门组件，再取出带作动器的传感器平台。**这是全机精度最高的机械组件**，作动器与磁体的位置关系出厂已校准，拆了就回不去，非专业不要动。',
        layers: ['shutter'],
        tools: ['十字螺丝刀', '防静电手环'],
        stats: [{ label: '风险', value: '出厂校准不可恢复' }],
      },
      {
        id: 'a-s6',
        title: '最后取出传感器',
        body: '传感器装在安装板上，由四颗螺丝固定。**取之前先确认平台已经分离**，硬拉会刮伤保护玻璃。到这一层就是 3300 万像素堆栈 CMOS——整机的核心。',
        layers: ['sensor'],
        tools: ['十字螺丝刀', '防静电手环'],
        stats: [{ label: '画幅', value: '全画幅' }],
      },
      {
        id: 'a-s7',
        title: '装回：从传感器开始反序',
        body: '装回严格按拆卸反序：传感器 → 防抖平台 → 快门 → EVF → 主板 → 盖板。**每装一层先通电测一次**，不要全部装完才发现不亮。',
        layers: ['sensor', 'shutter', 'evf', 'board', 'body'],
        tools: ['十字螺丝刀', '防静电手环'],
        stats: [{ label: '原则', value: '一层一测' }],
      },
    ],
  };
}
