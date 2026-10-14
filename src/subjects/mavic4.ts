import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, metalMaterial, dieMaterial, carbonMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * DJI Mavic 4 Pro —— 三摄旗舰航拍无人机
 * 公开规格：机身重量 1000g（含电池不含桨），电池 95.3Wh，最大飞行时间 51 分钟，
 * 轴距约 400mm 级，抗风 12m/s。1 亿像素 4/3 CMOS 哈苏主摄 + 1/1.3" + 1/1.5" 双长焦
 * 场景单位：1 = 100mm。展开尺寸约 400mm 轴距 → 4.0
 */
const MM = 0.01; // 1 = 100mm

const BODY_W = 8.4 * MM;  // 折叠态机身宽
const BODY_L = 9.8 * MM;
const BODY_H = 3.4 * MM;
const ARM = 2.05 * MM;   // 机臂长度

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function mavic4Pro(): Subject {
  const layers: Layer[] = [];

  // ============ 1. 四臂机架 + 折叠机构 ============
  layers.push({
    id: 'frame',
    refImage: './ref/mavic4/frame.jpg',
    name: '四臂机架 + 折叠机构',
    group: '结构',
    explodeDir: U(0, -0.9, 0.5),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // 中央机身
      const body = new THREE.Mesh(
        new RoundedBoxGeometry(BODY_W, BODY_H, BODY_L, 3, 0.12),
        mat({ color: 0x2b2f33, metalness: 0.15, roughness: 0.58 })
      );
      g.add(body);

      // 上盖（可拆）
      const shell = new THREE.Mesh(
        new RoundedBoxGeometry(BODY_W * 0.94, BODY_H * 0.55, BODY_L * 0.92, 3, 0.1),
        mat({ color: 0x3a3f44, metalness: 0.12, roughness: 0.52 })
      );
      shell.position.y = BODY_H * 0.5;
      g.add(shell);

      // 四条机臂
      const angles = [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4];
      angles.forEach((a) => {
        const arm = new THREE.Group();

        // 碳纤维臂管（航空级碳纤）
        const armTube = new THREE.Mesh(
          new RoundedBoxGeometry(0.24, 0.16, ARM, 2, 0.05),
          carbonMaterial()
        );
        armTube.position.z = ARM / 2;
        arm.add(armTube);

        // 折叠铰链座
        const hinge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.26, 20),
          metalMaterial(0x8a9096, 0.3)
        );
        hinge.rotation.x = Math.PI / 2;
        arm.add(hinge);

        // 电机座
        const motorBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.19, 0.22, 0.2, 24),
          mat({ color: 0x22262a, metalness: 0.4, roughness: 0.45 })
        );
        motorBase.rotation.x = Math.PI / 2;
        motorBase.position.z = ARM;
        arm.add(motorBase);

        arm.rotation.y = a;
        g.add(arm);
      });

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'carbon',
        title: '碳纤维机臂 · 折叠寿命 5000 次',
        anchor: U(0, 0, ARM + 0.3),
        body: `机臂是<b>航空级碳纤维管</b>，四个角各一条，折叠收纳时前后臂<b>空间折叠</b>（Mavic 系列的经典设计）。

沿用 Mavic Pro 时代的技术规格：机臂折叠可承受约 <b>5000 次</b>折叠。

这里有个实用设计：<b>前机臂平面折叠，后机臂空间折叠</b>。两对机臂的折叠方向不同，折叠后机身更紧凑，但也正因为如此——折叠状态下机臂上没有传感器，<b>无法判断自己处于折叠还是展开状态，不建议在折叠状态下启动电机</b>（这是大疆官方 FAQ 明确写的一条）。

机身底部铝合金面板<b>不防水</b>。Mavic 底盘较低，起降要避开不平地面和水坑。`,
        stats: [
          { label: '机臂材质', value: '航空级碳纤维' },
          { label: '折叠寿命', value: '约 5000 次' },
          { label: '折叠方式', value: '前臂平面 / 后臂空间' },
          { label: '底部材质', value: '铝合金，不防水' },
        ],
      },
    ],
  });

  // ============ 2. 动力系统：电机 + 折叠桨 ============
  layers.push({
    id: 'motors',
    refImage: './ref/mavic4/motors.jpg',
    name: '无刷电机 ×4 + 折叠桨叶',
    group: '动力',
    explodeDir: U(0.4, 0.5, 0.9),
    explodeScale: 0.9,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const angles = [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4];

      angles.forEach((a, i) => {
        const m = new THREE.Group();
        const x = Math.cos(a) * ARM;
        const z = Math.sin(a) * ARM;

        // 电机定子
        const stator = new THREE.Mesh(
          new THREE.CylinderGeometry(0.17, 0.17, 0.16, 24),
          metalMaterial(0x9aa0a6, 0.32)
        );
        stator.rotation.x = Math.PI / 2;
        m.add(stator);

        // 转子磁铁
        const rotor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.135, 0.135, 0.14, 20),
          mat({ color: 0x3a3f45, metalness: 0.6, roughness: 0.4 })
        );
        rotor.rotation.x = Math.PI / 2;
        m.add(rotor);

        // 桨叶（两叶折叠桨）
        for (let b = 0; b < 2; b++) {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.014, 0.09),
            mat({ color: 0x16181b, metalness: 0.2, roughness: 0.6, opacity: 0.9 })
          );
          blade.position.set(Math.cos(b * Math.PI) * 0.28, 0, Math.sin(b * Math.PI) * 0.28);
          blade.rotation.y = -b * Math.PI + 0.3;
          m.add(blade);
        }

        // 桨毂
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.1, 16), mat({ color: 0x22262a, metalness: 0.4, roughness: 0.5 }));
        hub.rotation.x = Math.PI / 2;
        hub.position.y = 0.09;
        m.add(hub);

        m.position.set(x, 0.06, z);
        m.rotation.y = a + (i % 2 ? Math.PI : 0);
        g.add(m);
      });

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'props',
        title: '折叠桨 · 免拆装运输',
        anchor: U(Math.cos(Math.PI / 4) * ARM, 0.12, Math.sin(Math.PI / 4) * ARM),
        body: `快拆折叠桨，<b>运输过程中不需要拆卸桨叶</b>——折叠后与桨毂一起收在机身上。

配合整机 1000g 的重量，Mavic 4 Pro 的定位很清楚：<b>不需要外挂负载的最大航拍机</b>。京东上"最大载重"一栏写的是"其他"，即 Mavic 系列不做载货。

续航是这一代的硬指标：<b>最大飞行时间 51 分钟</b>，电池 95.3Wh，抗风 12 m/s。51 分钟是靠什么换来的——机身 1000g 加上优化的气动和动力效率，不是靠堆电池。

对比早期 Mavic Pro 的 27 分钟（初代）到 51 分钟，八年提升接近一倍。`,
        stats: [
          { label: '电机', value: '无刷 ×4' },
          { label: '桨叶', value: '快拆折叠，运输免拆' },
          { label: '整机重量', value: '1000 g' },
          { label: '最大载重', value: '无（不作载货）' },
          { label: '最大抗风', value: '12 m/s' },
        ],
      },
    ],
  });

  // ============ 3. 三摄云台模组 ============
  layers.push({
    id: 'gimbal',
    refImage: './ref/mavic4/gimbal.jpg',
    name: '三摄云台模组（360° 万象云台）',
    group: '光学',
    explodeDir: U(-0.85, 0.15, 0.75),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const base = new THREE.Vector3(0, -0.1, BODY_L / 2 + 0.5);

      // 云台臂
      const yawArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 20), mat({ color: 0x2b2f33, metalness: 0.4, roughness: 0.5 }));
      yawArm.position.copy(base).add(new THREE.Vector3(0, 0.12, -0.1));
      g.add(yawArm);

      // 相机主体
      const camBody = new THREE.Mesh(
        new RoundedBoxGeometry(0.72, 0.56, 0.66, 3, 0.1),
        mat({ color: 0x25282c, metalness: 0.18, roughness: 0.5 })
      );
      camBody.position.copy(base).add(new THREE.Vector3(0, -0.14, 0.05));
      g.add(camBody);

      // 三个镜头
      const lensDefs: [number, number, number, string, number][] = [
        [-0.2, 0.06, 0.17, '4/3 主摄', 0x1a3f6b],
        [0.22, 0.14, 0.115, '1/1.3" 中长焦', 0x1f5c4a],
        [0.22, -0.11, 0.095, '1/1.5" 长焦', 0x5c3a1f],
      ];

      lensDefs.forEach(([lx, ly, lr, , lc]) => {
        const lens = new THREE.Group();
        lens.add(new THREE.Mesh(new THREE.CylinderGeometry(lr, lr * 1.08, 0.24, 32), metalMaterial(0x8a9096, 0.26)));

        for (let k = 0; k < 3; k++) {
          const glass = new THREE.Mesh(
            new THREE.CylinderGeometry(lr * (0.8 - k * 0.15), lr * (0.8 - k * 0.15), 0.035, 32),
            mat({ color: [0x6f9ab8, 0x5f8f9a, 0x8f7f5f][k], metalness: 0.2, roughness: 0.08, opacity: 0.55 })
          );
          glass.rotation.x = Math.PI / 2;
          glass.position.z = 0.07 + k * 0.06;
          lens.add(glass);
        }

        // 传感器
        const sensor = new THREE.Mesh(new THREE.BoxGeometry(lr * 0.85, lr * 0.85, 0.02), dieMaterial(0x14304d, 0x66a8ff));
        sensor.position.z = -0.06;
        lens.add(sensor);

        lens.rotation.x = Math.PI / 2;
        lens.position.copy(base).add(new THREE.Vector3(lx, -0.14 + ly, 0.4));
        g.add(lens);
      });

      // 云台电机（三个轴）
      const gimbalMotors: [number, number, number][] = [
        [0, 0.2, -0.05],
        [0.36, -0.14, 0.05],
        [0, -0.4, 0.05],
      ];
      gimbalMotors.forEach(([gx, gy, gz]) => {
        const gm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 18), metalMaterial(0x7d848a, 0.3));
        gm.rotation.z = Math.PI / 2;
        gm.position.copy(base).add(new THREE.Vector3(gx, gy, gz));
        g.add(gm);
      });

      addEdges(g, 0x94a3b8, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'gimbal',
        title: '360° 旋转万象云台',
        anchor: U(-0.5, 0.1, BODY_L / 2 + 0.9),
        body: `这一代的云台是<b>360° 旋转"万象云台"</b>——机身上的结构本身不限制云台的俯仰和偏转范围，配合机臂的避障几何，实现"运镜灵动自由"。

原理上和手机云台手机是两回事：航拍云台靠三轴电机（偏航/俯仰/横滚）在飞行中抵消机身姿态变化。云台上那三个小圆柱就是三个轴的电机。

这套云台承载的是三个物理尺寸完全不同的镜头，同时要保证<b>三轴一致性</b>——这是最难的部分。三颗镜头的光轴要在俯仰和偏转到任何角度时保持平行，否则拍出的素材无法拼接。`,
        stats: [
          { label: '结构', value: '360° 旋转万象云台' },
          { label: '轴数', value: '三轴（三电机）' },
          { label: '关键指标', value: '三轴光轴一致性' },
          { label: '夜景', value: '0.1 Lux 级别' },
        ],
      },
    ],
  });

  // ============ 4. 1 英寸哈苏主摄传感器 ============
  layers.push({
    id: 'sensor',
    refImage: './ref/mavic4/sensor.jpg',
    name: '1 英寸哈苏主摄传感器',
    group: '光学',
    explodeDir: U(-1.15, 0.45, 1.15),
    explodeScale: 0.55,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const pos = new THREE.Vector3(-0.2, -0.08, BODY_L / 2 + 0.95);

      // 传感器基板
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.36, 0.04),
        mat({ color: 0x0f3d2e, metalness: 0.15, roughness: 0.85 })
      );
      board.position.copy(pos);
      g.add(board);

      // 1 英寸 CMOS 感光面（约 13.2 × 9.9mm）
      const die = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.225, 0.025),
        dieMaterial(0x123a52, 0x5fb8e8)
      );
      die.position.copy(pos).add(new THREE.Vector3(0, 0, 0.04));
      g.add(die);

      // 像素阵列网格
      for (let i = 0; i < 14; i++) {
        for (let j = 0; j < 11; j++) {
          const px = new THREE.Mesh(
            new THREE.PlaneGeometry(0.018, 0.018),
            mat({ color: [0x1b5a7a, 0x2a7a9a, 0x7a2a5a][(i + j) % 3], metalness: 0.4, roughness: 0.4, emissive: 0x0f3550, emissiveIntensity: 0.35 })
          );
          px.position.copy(pos).add(new THREE.Vector3(-0.14 + i * 0.0215, -0.1 + j * 0.02, 0.055));
          g.add(px);
        }
      }

      // 光学防抖（OIS）音圈
      const vcm = new THREE.Mesh(
        new THREE.TorusGeometry(0.19, 0.025, 10, 40),
        metalMaterial(0xc0a060, 0.3)
      );
      vcm.position.copy(pos).add(new THREE.Vector3(0, 0, 0.08));
      g.add(vcm);

      // 哈苏 HNCS 处理层
      const proc = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.03),
        dieMaterial(0x2a4a2f, 0x7fe8a0)
      );
      proc.position.copy(pos).add(new THREE.Vector3(0.24, -0.02, 0.03));
      g.add(proc);

      addEdges(g, 0x5fb8e8, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'hasselblad',
        title: '4/3 CMOS · 1 亿像素 · 哈苏',
        anchor: U(-0.55, 0.05, BODY_L / 2 + 1.0),
        body: `主摄是这一代的绝对核心：<b>4/3 画幅、1 亿像素哈苏相机</b>，28mm 等效焦距，f/2.0 到 f/11 可变光圈。

为什么用"1 英寸"这个说法要小心：<b>1 英寸是行业沿用的对角线命名惯例，不是传感器的实际物理尺寸</b>。1 英寸传感器的实际对角线约 16mm，4/3 画幅的实际尺寸比它大一圈。厂商沿用"1 英寸"是为了延续消费认知。

真正值得说的是技术点：
- <b>双原生 ISO 融合</b>：同时用高低两挡感光度曝光并自动融合，动态范围显著提升。这是大疆在 Mavic 3 Pro 上首次引入，Mavic 4 Pro 延续
- <b>1 亿像素高像素堆栈</b>：三个相机都支持 RAW 格式下最高 5 帧高像素堆栈拍摄
- <b>6K/60fps HDR 视频</b>：这是主摄独占的能力
- <b>哈苏 HNCS 自然色彩方案</b>：哈苏在色彩科学上的积累，不是换个 logo

数据上：主摄 1 亿像素，超广角/中长焦 4800 万像素，长焦 5000 万像素。`,
        stats: [
          { label: '主摄', value: '4/3 CMOS · 1 亿像素' },
          { label: '等效焦距', value: '28 mm' },
          { label: '光圈', value: 'f/2.0 – f/11 可变' },
          { label: '视频', value: '6K/60fps HDR' },
          { label: '色彩', value: '哈苏 HNCS' },
          { label: '堆栈拍摄', value: 'RAW 下 5 帧' },
        ],
      },
    ],
  });

  // ============ 5. 电池 95.3Wh ============
  layers.push({
    id: 'battery',
    refImage: './ref/mavic4/battery.jpg',
    name: '智能飞行电池 95.3Wh',
    group: '能源',
    explodeDir: U(0.75, 0.6, -0.9),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      const pack = new THREE.Mesh(
        new RoundedBoxGeometry(BODY_W * 0.72, BODY_H * 0.8, BODY_L * 0.62, 3, 0.08),
        mat({ color: 0x30353a, metalness: 0.16, roughness: 0.62 })
      );
      g.add(pack);

      // 电芯
      for (let i = 0; i < 6; i++) {
        const cell = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, BODY_H * 0.62, BODY_L * 0.52),
          metalMaterial(0xb8bcc0, 0.4)
        );
        cell.position.set(-1.05 + i * 0.42, 0, 0);
        g.add(cell);
      }

      // 电量指示灯
      for (let i = 0; i < 4; i++) {
        const led = new THREE.Mesh(
          new THREE.PlaneGeometry(0.07, 0.07),
          mat({ color: i < 3 ? 0x4ade80 : 0x4a5058, emissive: i < 3 ? 0x4ade80 : 0x1a1a1a, emissiveIntensity: 1.6 })
        );
        led.position.set(-0.5 + i * 0.11, BODY_H * 0.41, BODY_L * 0.2);
        g.add(led);
      }

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'battery',
        title: '95.3Wh · 51 分钟续航',
        anchor: U(1.3, 0.1, BODY_L * 0.32),
        body: `<b>95.3Wh 智能飞行电池，最大飞行时间 51 分钟。</b>

换算一下能量密度：95.3Wh / 整机 1000g（含电池不含桨）——这个比例是 Mavic 4 Pro 能做到 51 分钟的物理基础。

续航的几个约束条件，选购时要看清：
- <b>51 分钟</b>是理想条件下的最大飞行时间
- <b>抗风 12 m/s</b>——超过这个值要收桨
- 真实可用时间要扣掉返航余量，实际作业通常按 <b>电池容量的 70–80%</b> 规划

大疆的电池管理有<b>同型号电池智能配对</b>机制：多电池作业时，无线链路里只有同型号电池才会被识别为可用。混用不同型号或不同批次的电池会直接无法起飞——这不是限制，是防止混用导致事故。`,
        stats: [
          { label: '容量', value: '95.3 Wh' },
          { label: '最大飞行时间', value: '51 分钟' },
          { label: '整机重量', value: '1000 g' },
          { label: '抗风', value: '12 m/s' },
          { label: '电池管理', value: '同型号智能配对' },
        ],
      },
    ],
  });

  // ============ 6. 图传 + 感知系统 ============
  layers.push({
    id: 'link',
    refImage: './ref/mavic4/link.jpg',
    name: 'O4+ 图传 + 全向感知',
    group: '通信',
    explodeDir: U(0.55, -0.45, -1.15),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      // O4+ 图传模块（机身后部）
      const linkMod = new THREE.Mesh(
        new THREE.BoxGeometry(BODY_W * 0.8, BODY_H * 0.6, 0.5),
        mat({ color: 0x1a1d21, metalness: 0.3, roughness: 0.6 })
      );
      linkMod.position.set(0, 0, -BODY_L * 0.42);
      g.add(linkMod);

      // 天线阵列（8 方向）
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const ant = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.06, 0.16),
          mat({ color: 0x2a3a4a, metalness: 0.4, roughness: 0.5, emissive: 0x1a3a5a, emissiveIntensity: 0.3 })
        );
        ant.position.set(Math.cos(a) * BODY_W * 0.42, Math.sin(a * 2) * 0.05, Math.sin(a) * BODY_L * 0.42);
        ant.rotation.y = -a;
        g.add(ant);
      }

      // 前后视觉感知（双摄鱼眼）
      const senseDefs: [number, number, number][] = [
        [0, 0.2, BODY_L / 2 + 0.1],
        [0, 0.2, -BODY_L / 2 - 0.1],
        [BODY_W / 2 + 0.1, 0.2, 0],
        [-BODY_W / 2 - 0.1, 0.2, 0],
      ];
      senseDefs.forEach(([sx, sy, sz]) => {
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 20, 14),
          mat({ color: 0x0d1117, metalness: 0.5, roughness: 0.15 })
        );
        s.position.set(sx, sy, sz);
        g.add(s);
      });

      // 机腹激光测距 + 辅助灯
      const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20), mat({ color: 0x1a1d21, metalness: 0.4, roughness: 0.4 }));
      lidar.position.set(0, -BODY_H * 0.5, 0.3);
      g.add(lidar);

      addEdges(g, 0x60a5fa, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'o4',
        title: 'O4+ · 30km 10-bit HDR 图传',
        anchor: U(0, 0.25, -BODY_L * 0.5),
        body: `<b>DJI O4+ 图传，30 公里，10-bit HDR</b>。这是这一代画质链条的最后一环。

三摄能拍 6K/60fps HDR 是不够的——<b>如果图传环节压成 8-bit 4K，所有机内算力都白费</b>。所以 O4+ 提供 10-bit HDR 图传，把机内处理后的画面完整传回。

三个关键数字：
- <b>30 km</b> 传输距离
- <b>10-bit</b> 色深（8-bit 只有 256 级，10-bit 是 1024 级，直播宽容度差别巨大）
- <b>HDR</b> 直传（不是先压 SDR 再提亮，是直接传 HDR）

<b>0.1 Lux 夜景级全向主动避障</b>是感知系统的规格：主动 = 机头发射光，不是靠环境光。0.1 Lux 大致相当于极暗环境，这是夜航的安全底线。

京东参数里"实时图传质量"写的是 1080p——那是实时预览的规格，录制规格另算。`,
        stats: [
          { label: '图传', value: 'O4+ · 30 km · 10-bit HDR' },
          { label: '实时预览', value: '1080p' },
          { label: '避障', value: '0.1 Lux 夜景级全向主动' },
          { label: '感知方向', value: '前后左右四向 + 机腹' },
          { label: '天线', value: '8 方向阵列' },
        ],
      },
    ],
  });

  // ============ 7. 遥控器 ============
  layers.push({
    id: 'remote',
    refImage: './ref/mavic4/remote.jpg',
    name: 'DJI RC 2 折叠遥控器',
    group: '操控',
    explodeDir: U(-0.6, -1.2, -0.75),
    explodeScale: 0.85,
    build() {
      const g = new THREE.Group();
      g.position.set(-2.4, -1.4, -1.6);

      // 主体
      const rc = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.42, 2.0),
        mat({ color: 0x2a2e33, metalness: 0.25, roughness: 0.65 })
      );
      g.add(rc);

      // 可旋转高亮屏
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.06, 0.86),
        mat({ color: 0x0d1117, metalness: 0.2, roughness: 0.25, emissive: 0x1a3a5a, emissiveIntensity: 0.35 })
      );
      screen.position.y = 0.24;
      screen.rotation.x = -0.35;
      g.add(screen);

      // 摇杆
      const stickDefs: [number, number][] = [[-0.42, 0.62], [0.42, 0.62], [-0.42, -0.2], [0.42, -0.2]];
      stickDefs.forEach(([sx, sz], i) => {
        if (i === 2 || i === 3) return; // 折叠态收起两根
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 20), mat({ color: 0x1a1d21, metalness: 0.3, roughness: 0.6 }));
        base.position.set(sx, 0.26, sz);
        g.add(base);
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.28, 16), mat({ color: 0x3a3f45, metalness: 0.3, roughness: 0.5 }));
        stick.position.set(sx, 0.42, sz);
        g.add(stick);
      });

      // 摇杆收纳槽
      [-0.42, 0.42].forEach((sx) => {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.34), mat({ color: 0x1e2126, metalness: 0.2, roughness: 0.7 }));
        slot.position.set(sx, 0.24, -0.2);
        g.add(slot);
      });

      addEdges(g, 0x64748b, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'rc2',
        title: '7 英寸可旋转屏 · 内置天线',
        anchor: U(-2.4, -1.0, -1.6),
        body: `DJI RC 2 折叠遥控器，核心是<b>7 英寸可旋转高亮屏</b>。

"可旋转"和"高亮"是配套的：竖屏适合构图（接近手机竖拍），横屏适合看全景。在户外强光下，普通屏幕基本看不清——高亮屏的典型亮度在 1000 nit 以上。

屏幕旋转时，天线也跟着转。因为图传天线在遥控器内部是分角度布置的（对应 O4+ 的 8 方向阵列），屏幕转到哪个角度，实际就优先用上那个方向的天线链路。这是"屏转、天线跟着转"的联动设计。

另注意<b>标准套装配 RC 2、增强图传套装配 RC Pro 2</b>，两者不是同一款。`,
        stats: [
          { label: '屏幕', value: '7 英寸可旋转高亮' },
          { label: '标配', value: 'DJI RC 2' },
          { label: '高配', value: 'DJI RC Pro 2（增强图传）' },
          { label: '天线', value: '内置，屏转联动' },
        ],
      },
    ],
  });

  return {
    id: 'mavic4',
    name: 'DJI Mavic 4 Pro',
    subtitle: '大疆创新 · 三摄旗舰影像航拍机',
    tagline: '1 亿像素哈苏主摄 + 双长焦 + 360° 万象云台 + 30km 10-bit 图传',
    background: 0xf5f6f8,
    accent: '#0a7ea4',
    camera: { position: [4.5, 3.2, 6.5], target: [0, 0.1, 0] },
    explodeScale: 1.15,
    sectionable: true,
    fidelity: {
      actualParts: 16,
      source: '官方用户手册标注 16 个可识别部件（前向 LiDAR、全方向视觉系统、云台与相机、辅助灯、3D 红外检测系统、电池卡扣、LED、起落架兼天线、状态指示灯、电机、螺旋桨、电池、电源键、电量 LED、USB-C、microSD 卡槽）；RC 2 遥控器另标 12 项',
      modeledLayers: 7,
      modeledParts: 245,
      note: '本模型按官方手册的部件划分组织，是四个主体中颗粒度最贴近官方口径的。部分部件（辅助灯、起落架天线、状态指示灯、3D 红外检测系统）已合并进对应结构层，未单独拆出。',
    },
    layers,
    steps: [
      {
        id: 's1-battery',
        title: '先取电池',
        body: '拆任何东西之前先把智能飞行电池拔掉。95.3Wh 已经超过随身行李 100Wh 的红线边缘，带电拆机既危险也容易烧电调。',
        layers: ['battery'],
        tools: ['无（卡扣式快拆）'],
        stats: [
          { label: '容量', value: '95.3 Wh' },
          { label: '安装方式', value: '卡扣快拆' },
        ],
      },
      {
        id: 's2-motors',
        title: '卸桨叶，拆四台无刷电机',
        body: '折叠桨先拆，再卸电机。电机是易损件，摔机后按"换不修"处理——单台成本远低于拆开重绕。',
        layers: ['motors'],
        tools: ['桨叶拆装扳手', '电机固定螺丝刀'],
        stats: [
          { label: '电机数', value: '4 台无刷' },
          { label: '桨叶', value: '折叠低噪' },
        ],
      },
      {
        id: 's3-gimbal',
        title: '拆三摄万象云台',
        body: '云台是整个飞机上最精密的模组，三轴增稳 + 三摄共路。拆的时候先断排线再松减震球，硬掰会直接废掉增稳电机。',
        layers: ['gimbal'],
        tools: ['精密螺丝刀', '防静电镊子'],
        stats: [
          { label: '轴数', value: '三轴' },
          { label: '摄像头', value: '3 摄共路' },
        ],
      },
      {
        id: 's4-sensor',
        title: '取出 1 英寸主摄传感器',
        body: '云台内部是 1 英寸 CMOS + 镜头组。传感器与镜筒的对位精度要求极高，属于"不可外场维修"件，坏了整组更换。',
        layers: ['sensor'],
        tools: ['无尘环境', '光学对准工装'],
        stats: [
          { label: '传感器', value: '1 英寸 CMOS' },
          { label: '维护性', value: '整组更换' },
        ],
      },
      {
        id: 's5-link',
        title: '拆 O4+ 图传与全向感知模组',
        body: '图传板 + 全向避障的视觉/红外孔径都集中在这块。排线密、屏蔽要求高，拆的时候注意别把射频同轴线折死。',
        layers: ['link'],
        tools: ['防静电镊子', '射频线压接工具'],
        stats: [
          { label: '图传', value: 'O4+' },
          { label: '感知', value: '全向视觉 + 红外' },
        ],
      },
      {
        id: 's6-frame',
        title: '更换碳纤维机臂',
        body: '机臂是碳纤维折叠结构，摔裂了按"件"换。碳纤维的优点是轻和刚，缺点是坏了不能像不锈钢那样现场焊。',
        layers: ['frame'],
        tools: ['碳纤维切割工具', '机臂校准工装'],
        stats: [
          { label: '机臂', value: '碳纤维折叠' },
          { label: '折叠方式', value: '四臂内折' },
        ],
      },
      {
        id: 's7-remote',
        title: '遥控器（配件，不在机身上）',
        body: 'RC 2 是独立配件，但拆解流程里常一起看：屏幕、摇杆、天线与电调遥测都集中在这个折叠遥控器里。',
        layers: ['remote'],
        tools: ['精密螺丝刀'],
        stats: [
          { label: '型号', value: 'DJI RC 2' },
          { label: '形式', value: '折叠 + 触屏' },
        ],
      },
    ],
    headline: [
      { label: '主摄', value: '1 亿', unit: '像素 4/3' },
      { label: '续航', value: '51', unit: '分钟' },
      { label: '图传', value: '30', unit: 'km · 10-bit' },
      { label: '避障', value: '0.1', unit: 'Lux 全向主动' },
    ],
    overview: `Mavic 4 Pro 是大疆目前的三摄旗舰航拍机。核心是<b>影像系统</b>：4/3 画幅 1 亿像素哈苏主摄，加上 1/1.3" 和 1/1.5" 两颗大底长焦，配 360° 旋转万象云台。

配套的两个容易被忽略但同样重要的升级：<b>O4+ 图传</b>（30km、10-bit HDR 直传）和 <b>0.1 Lux 夜景级全向主动避障</b>。

整机 1000g、电池 95.3Wh、最大飞行时间 51 分钟、最大抗风 12 m/s。

建模说明：按 DJI 官方公开规格参数化重建，非真机扫描或工程图复刻。云台内部传动机构、传感器像素排布等为结构性示意。RC 2 遥控器为同画面参考，不是 Mavic 4 Pro 主机的一部分。`,
    narrative: [
      `<b>三颗镜头为什么要用三种画幅</b>：主摄 4/3 画幅（28mm 等效）负责大场景和画质，双长焦用 1/1.3"（70mm）和 1/1.5"（168mm）负责人像和远景。

关键在于<b>两颗长焦都是大底</b>。消费级航拍机的长焦通常配小底传感器，代价是进光量不足、画质随倍率崩塌。这里用 1/1.3" 和 1/1.5" 两级大底，是为了在 3 倍和 7 倍变焦时仍能保住可用画质。

这实际改变了使用逻辑：不用飞近就能拍到中远景人像，光线差的时候也不必硬推 ISO。`,
      `<b>10-bit 图传是被低估的一环</b>：三摄能拍 6K/60fps HDR，但如果图传压成 8-bit，机内算力就浪费了。O4+ 提供 <b>10-bit HDR 直传</b>，10-bit 是 1024 级色深 vs 8-bit 的 256 级。

差别在实际流程里很明显：8-bit 直播画面在暗部会出现明显色带，10-bit 才能保住 HDR 的宽动态范围。这是从"能拍"到"能交付"的一步。`,
      `<b>0.1 Lux 主动避障对应的真实场景</b>：主动避障是机头发射光做主动探测，不依赖环境光。0.1 Lux 是接近极暗环境的水平。

这一项决定的是夜航和低光作业能不能做。比如室内演出、烛光场景、日落后蓝调时段的航拍——这些场景传统上要么靠飞手经验硬飞，要么干脆放弃。夜间长曝光是航拍的重要手法，安全底线必须先有。`,
    ],
    specs: [
      { label: '主摄', value: '4/3 CMOS · 1 亿像素 · 哈苏', note: '28mm 等效，f/2.0–f/11' },
      { label: '主摄视频', value: '6K/60fps HDR', note: '1 亿像素照片' },
      { label: '中长焦', value: '1/1.3" CMOS · 4800 万像素', note: '70mm 等效 f/2.8' },
      { label: '长焦', value: '1/1.5" CMOS · 5000 万像素', note: '168mm 等效 f/2.8' },
      { label: '云台', value: '360° 旋转万象云台', note: '运镜灵动自由' },
      { label: '避障', value: '0.1 Lux 夜景级全向主动', note: '四向感知 + 机腹' },
      { label: '图传', value: 'DJI O4+ · 30 km · 10-bit HDR', note: '实时预览 1080p' },
      { label: '续航', value: '51 分钟', note: '理想条件最大飞行时间' },
      { label: '电池', value: '95.3 Wh 智能飞行电池', note: '同型号智能配对' },
      { label: '整机重量', value: '1000 g', note: '含电池，不含桨' },
      { label: '最大抗风', value: '12 m/s', note: '超此值需收桨' },
      { label: '机臂材质', value: '航空级碳纤维', note: '折叠寿命约 5000 次' },
      { label: '遥控器', value: 'DJI RC 2（7 英寸可旋转屏）', note: '增强图传套装为 RC Pro 2' },
      { label: '影像功能', value: '双原生 ISO 融合 · RAW 5 帧堆栈', note: '主体跟焦 / 自由全景' },
    ],
    comparison: {
      title: 'Mavic 4 Pro 对比 Mavic 3 Pro',
      note: '基于 DJI 官方公开规格整理',
      rows: [
        { label: '主摄', prev: '4/3 CMOS · 2000 万像素', curr: '4/3 CMOS · 1 亿像素', delta: 'up' },
        { label: '主摄传感器', prev: '常规堆栈', curr: '哈苏 HNCS + 更大堆栈', delta: 'up' },
        { label: '中长焦', prev: '1/1.3" · 4800 万像素', curr: '1/1.3" · 4800 万像素', delta: 'flat' },
        { label: '长焦', prev: '1/1.5" · 4800 万像素', curr: '1/1.5" · 5000 万像素', delta: 'up' },
        { label: '光圈', prev: '固定 f/2.0', curr: '主摄可变 f/2.0–f/11', delta: 'up' },
        { label: '主摄视频', prev: '4K/60fps', curr: '6K/60fps HDR', delta: 'up' },
        { label: '图传', prev: 'O3+', curr: 'O4+ · 10-bit HDR', delta: 'up' },
        { label: '云台', prev: '三轴机械云台', curr: '360° 旋转万象云台', delta: 'up' },
        { label: '避障', prev: '全向主动避障', curr: '0.1 Lux 夜景级全向主动', delta: 'up' },
        { label: '续航', prev: '43 分钟', curr: '51 分钟', delta: 'up' },
        { label: '整机重量', prev: '≈920 g', curr: '1000 g', delta: 'up' },
        { label: '双原生 ISO', prev: '不支持', curr: '三摄均支持', delta: 'up' },
      ],
    },
  };
}
