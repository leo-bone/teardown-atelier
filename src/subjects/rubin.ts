import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, dieMaterial, metalMaterial, pcbMaterial, addEdges } from '../core/materials';
import type { Layer, Subject } from '../core/types';

/**
 * NVIDIA Rubin VR200（GTC 2026 公布的四 tile 布局）
 * 真实物理：封装基板约 120×150mm 量级（CoWoS-L）
 * 场景单位：1 = 10mm。基板取 12.0 × 15.0（对应约 120×150mm）
 */
const MM = 0.1;

const PKG_W = 120 * MM;
const PKG_D = 150 * MM;
const PKG_H = 0.55;

const U = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export function rubinVR200(): Subject {
  const layers: Layer[] = [];

  // ============ 1. HBM4 显存堆栈 ×8 ============
  layers.push({
    id: 'hbm',
    refImage: './ref/rubin/hbm.jpg',
    name: 'HBM4 显存堆栈 ×8',
    group: '内存',
    explodeDir: U(0, 0, 2.6),
    explodeScale: 1.15,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const positions: [number, number][] = [];
      const gapX = 3.1;
      const gapY = 3.4;
      for (const sy of [-1, 1]) for (const i of [-1, 1]) positions.push([i * gapX, sy * (PKG_D / 2 - 2.2)]);
      for (const sx of [-1, 1]) for (const i of [-1, 1]) positions.push([sx * (PKG_W / 2 - 1.6), i * gapY]);

      positions.forEach(([x, y]) => {
        const stack = new THREE.Group();
        stack.add(new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.15, 0.14), dieMaterial(0x123a52, 0x5fb8e8)));

        for (let k = 0; k < 8; k++) {
          const d = new THREE.Mesh(
            new THREE.BoxGeometry(1.95, 1.95, 0.085),
            mat({
              color: k % 2 ? 0x1b4a63 : 0x215a78,
              metalness: 0.85,
              roughness: 0.22,
              emissive: 0x0f3550,
              emissiveIntensity: 0.3,
            })
          );
          d.position.y = 0.1 + k * 0.088;
          stack.add(d);
        }

        for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
          const tsv = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 8), metalMaterial(0xe8b84a, 0.3));
          tsv.position.set(ox * 0.94, 0.45, oy * 0.94);
          stack.add(tsv);
        }

        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.06), mat({ color: 0x0f2530, metalness: 0.5, roughness: 0.4 }));
        cap.position.y = 0.86;
        stack.add(cap);

        const lbl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.55), mat({ color: 0x111c24, metalness: 0.1, roughness: 0.85 }));
        lbl.rotation.x = -Math.PI / 2;
        lbl.position.y = 0.9;
        stack.add(lbl);

        stack.position.set(x, y, 0);
        g.add(stack);
      });

      addEdges(g, 0x5fb8e8, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'hbm4',
        title: 'HBM4 · 288GB · 22 TB/s',
        anchor: U(-(PKG_W / 2 - 1.6), PKG_D / 2 - 2.2, 1.15),
        body: `Rubin 最能说明代际差距的一层：<b>8 组 HBM4，总容量 288GB，带宽 22 TB/s</b>。

对比 Blackwell：
- 带宽 8 TB/s → 22 TB/s，<b>2.75 倍</b>
- HBM3e → HBM4，接口宽度翻倍到 <b>2048-bit</b>
- 每 pin 速率 10.8 GT/s

带宽提升是双管齐下：接口位宽翻倍（1024 → 2048 bit）+ 单 pin 速率提升（约 6.4 → 10.8 GT/s）。GTC 2026 披露单堆栈速率已超过 3.0 TB/s。

有个容易被忽略的点：<b>容量和 B300 完全一样（都是 288GB）</b>。Blackwell Ultra 已经先把容量做到 288GB，Rubin 的进步全在带宽。对推理来说这是对的方向——decode 阶段是带宽瓶颈，不是容量瓶颈。

另注：早期传闻曾估 13–14 TB/s，NVIDIA 官方最终给的是 22 TB/s，差了 60%。这类数字要等官方口径。`,
        stats: [
          { label: '容量', value: '288 GB（= B300，无提升）' },
          { label: '带宽', value: '22 TB/s（B300：8 TB/s）' },
          { label: '接口', value: '2048-bit（翻倍）' },
          { label: '单 pin 速率', value: '10.8 GT/s' },
          { label: '单堆栈', value: '>3.0 TB/s' },
        ],
      },
    ],
  });

  // ============ 2. CoWoS-L 中介层 ============
  layers.push({
    id: 'cowos',
    refImage: './ref/rubin/cowos.jpg',
    name: 'CoWoS-L 中介层',
    group: '封装',
    explodeDir: U(0, 0, 1.15),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      g.add(
        new THREE.Mesh(
          new RoundedBoxGeometry(PKG_W - 0.6, PKG_D - 0.6, 0.16, 2, 0.06),
          mat({ color: 0x2b3440, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.92 })
        )
      );

      // TSV 阵列：InstancedMesh 合并
      const TSV_X = 16;
      const TSV_Y = 22;
      const tsvMesh = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.3, 6),
        metalMaterial(0xd8b45a, 0.3),
        TSV_X * TSV_Y
      );
      const tm = new THREE.Matrix4();
      let ti = 0;
      for (let x = 0; x < TSV_X; x++) {
        for (let y = 0; y < TSV_Y; y++) {
          tm.makeTranslation(
            -PKG_W / 2 + 1.0 + x * ((PKG_W - 2.0) / (TSV_X - 1)),
            -PKG_D / 2 + 0.9 + y * ((PKG_D - 1.8) / (TSV_Y - 1)),
            0
          );
          tsvMesh.setMatrixAt(ti++, tm);
        }
      }
      tsvMesh.instanceMatrix.needsUpdate = true;
      tsvMesh.userData.layerId = 'cowos';
      g.add(tsvMesh);

      // RDL 再布线层：合并为两组长条
      const wireMatH = new THREE.MeshBasicMaterial({ color: 0x8fd3f4, transparent: true, opacity: 0.3 });
      const wireMatV = new THREE.MeshBasicMaterial({ color: 0x8fd3f4, transparent: true, opacity: 0.26 });
      for (let i = 0; i < 18; i++) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(PKG_W - 1.0, 0.05, 0.012), wireMatH);
        w.position.set(0, -PKG_D / 2 + 0.8 + i * 0.8, 0.085);
        g.add(w);
      }
      for (let i = 0; i < 14; i++) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.05, PKG_D - 1.0, 0.012), wireMatV);
        w.position.set(-PKG_W / 2 + 0.9 + i * 0.78, 0, 0.088);
        g.add(w);
      }

      addEdges(g, 0x8fd3f4, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'cowos',
        title: 'CoWoS-L 硅中介层',
        anchor: U(PKG_W / 2 - 1.2, -PKG_D / 2 + 1.4, 0.15),
        body: `中介层是整个封装的"高速公路"。RDL 再布线层 + TSV 硅通孔阵列，把 8 组 HBM4、2 颗计算 die、2 颗 I/O die 接进同一套互连。

CoWoS 是台积电的 2.5D 封装平台，L 系列用<b>硅中介层 + 局部硅嵌入（Local Silicon Interconnect）</b>路线。相比 CoWoS-S，L 在大尺寸（9.5 倍光罩级）中介层上更好控制翘曲与良率。

2026 年 4 月有个值得记的教训：Rubin Ultra 原定<b>四 die</b>，因为 CoWoS-L 在四 die 配置下良率不理想、四 die 间互连带宽达不到推理场景的延迟要求，<b>退回双 die</b>，据称仍能保持相对 B300 每瓦推理吞吐 3.5 倍的提升。

中介层良率正是 AI 芯片产能的真实瓶颈——限制出货的从来不只是晶圆产能。`,
        stats: [
          { label: '平台', value: '台积电 CoWoS-L' },
          { label: '互连', value: 'RDL 再布线 + TSV 阵列' },
          { label: '承载', value: '2 计算 die + 2 I/O die + 8 HBM4' },
          { label: 'Rubin Ultra 教训', value: '四 die 退回双 die（良率）' },
        ],
      },
    ],
  });

  // ============ 3. 计算 die ×2 ============
  layers.push({
    id: 'compute',
    refImage: './ref/rubin/compute.jpg',
    name: '计算 die ×2（reticle 级）',
    group: '计算核心',
    explodeDir: U(0, 0, 0.55),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const dieSize = 5.6;

      [-1, 1].forEach((s) => {
        const die = new THREE.Group();
        die.add(new THREE.Mesh(new THREE.BoxGeometry(dieSize, dieSize * 1.18, 0.2), dieMaterial(0x14453f, 0x74e8c4)));

        const cols = 4;
        const rows = 5;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const gpc = new THREE.Mesh(
              new THREE.BoxGeometry(dieSize / cols - 0.22, (dieSize * 1.18) / rows - 0.22, 0.05),
              mat({
                color: [0x1f6b5c, 0x245f7a, 0x5a5f2a, 0x4a2f6f][(r + c) % 4],
                metalness: 0.75,
                roughness: 0.32,
                emissive: [0x0d3b34, 0x123548, 0x2f3212, 0x241636][(r + c) % 4],
                emissiveIntensity: 0.4,
              })
            );
            gpc.position.set(
              -dieSize / 2 + (c + 0.5) * (dieSize / cols),
              -dieSize * 1.18 / 2 + (r + 0.5) * (dieSize * 1.18 / rows),
              0.115
            );
            die.add(gpc);
          }
        }

        const l2 = new THREE.Mesh(
          new THREE.BoxGeometry(dieSize * 0.9, dieSize * 0.16, 0.055),
          mat({ color: 0x3d8f7a, metalness: 0.8, roughness: 0.25, emissive: 0x1d5f4c, emissiveIntensity: 0.5 })
        );
        l2.position.set(0, 0, 0.12);
        die.add(l2);

        const rim = new THREE.Mesh(new THREE.BoxGeometry(dieSize + 0.06, dieSize * 1.18 + 0.06, 0.06), metalMaterial(0xb8b0a0, 0.4));
        rim.position.z = -0.05;
        die.add(rim);

        const reticle = new THREE.Mesh(
          new THREE.BoxGeometry(6.6, 6.9, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.28 })
        );
        reticle.position.z = -0.12;
        die.add(reticle);

        die.position.set(s * 1.5, 0, 0);
        g.add(die);
      });

      addEdges(g, 0x74e8c4, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'compute',
        title: '2 × reticle 计算 die · 3360 亿晶体管',
        anchor: U(0, PKG_D / 2 - 3.0, 0.35),
        body: `Rubin 采用<b>双计算 die</b>，每颗都是 reticle 尺寸（约 850mm²，单次光刻的极限面积），<b>两颗合计 3360 亿晶体管</b>。

对比 Blackwell：2080 亿 → 3360 亿，<b>1.6 倍</b>。工艺从 Blackwell 的 TSMC 4NP 一次跨到 <b>N3/N3P</b>——完整的节点跳跃，不是半代。

性能侧：
- <b>FP4 推理 50 PFLOPS</b>（Blackwell 约 10–20，2.5–5 倍）
- <b>FP4 训练 35 PFLOPS</b>（约 3.5 倍）
- 第三代 Transformer Engine，NVFP4 + 自适应压缩
- 支持 SMT，<b>每 GPU 176 线程</b>（从 warp 级并行转向 CPU 式线程模型的信号）

TDP 从约 1200W 涨到约 2300W，接近翻倍——这是 22 TB/s 和 50 PFLOPS 的另一面。`,
        stats: [
          { label: '晶体管', value: '3360 亿（2 die 合计）' },
          { label: 'vs Blackwell', value: '2080 亿（1.6×）' },
          { label: '工艺', value: 'TSMC N3 / N3P（3nm）' },
          { label: 'die 尺寸', value: 'reticle 级 ×2' },
          { label: 'FP4 推理', value: '50 PFLOPS' },
          { label: 'FP4 训练', value: '35 PFLOPS' },
          { label: '线程', value: '176（支持 SMT）' },
          { label: 'TDP', value: '≈2300 W' },
        ],
      },
    ],
  });

  // ============ 4. I/O die ×2 ============
  layers.push({
    id: 'iodie',
    refImage: './ref/rubin/iodie.jpg',
    name: 'I/O die ×2',
    group: 'I/O',
    explodeDir: U(0, 0, 0.3),
    sectionable: true,
    build() {
      const g = new THREE.Group();

      [-1, 1].forEach((s) => {
        const dio = new THREE.Group();
        dio.add(new THREE.Mesh(new THREE.BoxGeometry(3.0, 5.2, 0.18), dieMaterial(0x2a2350, 0x9d8ff0)));

        const blocks: [number, number, number, number, number][] = [
          [-0.68, 1.85, 1.1, 1.15, 0x3a2f6b],
          [0.68, 1.85, 1.1, 1.15, 0x2f3b6b],
          [0, 0.55, 1.9, 0.95, 0x5a2f4a],
          [0, -0.75, 1.9, 0.95, 0x2f5a4a],
          [0, -2.0, 1.9, 0.9, 0x6b4a2f],
        ];
        blocks.forEach(([bx, by, bw, bh, c]) => {
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(bw, bh, 0.05),
            mat({ color: c, metalness: 0.7, roughness: 0.35, emissive: c, emissiveIntensity: 0.35 })
          );
          b.position.set(bx, by, 0.11);
          dio.add(b);
        });

        const ctrl = new THREE.Mesh(
          new THREE.PlaneGeometry(2.6, 0.3),
          mat({ color: 0x8fd3f4, metalness: 0.2, roughness: 0.4, emissive: 0x3a7a9c, emissiveIntensity: 0.6 })
        );
        ctrl.rotation.x = -Math.PI / 2;
        ctrl.position.set(0, 2.62, 0.16);
        dio.add(ctrl);

        dio.position.set(s * 4.9, 0, 0);
        g.add(dio);
      });

      addEdges(g, 0x9d8ff0, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'iodie',
        title: 'I/O die · 计算与互连解耦',
        anchor: U(4.9, PKG_D / 2 - 2.2, 0.25),
        body: `这是 GTC 2026 披露里最容易被"双 die"说法盖过去的细节：R200 不是简单的两颗计算 die，而是 <b>2 颗计算 die + 2 颗专用 I/O die 的四 tile 布局</b>。

为什么拆出 I/O die：
- <b>计算与互连各自迭代</b>。计算 die 追最先进节点（3nm），I/O die 更看重 I/O 密度与功耗，可用不同工艺
- <b>8 个内存控制器的物理空间</b>。HBM4 接口翻倍到 2048-bit，控制器阵列布线面积巨大，塞进计算 die 会挤压算力密度
- <b>延迟可控</b>。推理瓶颈在 decode 阶段的数据搬运，互连单独成 tile 后调度更精准

I/O die 上还集成了 NVLink 6（3.6 TB/s/GPU）、PCIe、ConnectX-9 SuperNIC 接口和硬件加密单元。`,
        stats: [
          { label: '布局', value: '2 计算 die + 2 I/O die（四 tile）' },
          { label: '作用', value: '内存控制器 / NVLink / PCIe / 加密' },
          { label: 'NVLink 6', value: '3.6 TB/s 每 GPU（双向）' },
          { label: '设计收益', value: '计算与互连独立迭代' },
        ],
      },
    ],
  });

  // ============ 5. VR200 超级芯片（Vera CPU） ============
  layers.push({
    id: 'superchip',
    refImage: './ref/rubin/superchip.jpg',
    name: 'VR200 超级芯片（Vera CPU）',
    group: '系统',
    explodeDir: U(0, -1.2, 0.15),
    explodeScale: 0.85,
    sectionable: true,
    build() {
      const g = new THREE.Group();
      const cpu = new THREE.Group();
      cpu.add(new THREE.Mesh(new THREE.BoxGeometry(5.0, 5.0, 0.32), dieMaterial(0x1d3a5c, 0x7fc0ff)));

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 11; c++) {
          const core = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.36, 0.05),
            mat({
              color: [0x2a5a80, 0x1f4a6b, 0x356a8a][(r + c) % 3],
              metalness: 0.75,
              roughness: 0.3,
              emissive: 0x14415f,
              emissiveIntensity: 0.45,
            })
          );
          core.position.set(-2.1 + c * 0.42, -1.75 + r * 0.5, 0.19);
          cpu.add(core);
        }
      }

      const lpd = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 0.55),
        mat({ color: 0x6fd8c0, metalness: 0.3, roughness: 0.4, emissive: 0x2f8a74, emissiveIntensity: 0.55 })
      );
      lpd.rotation.x = -Math.PI / 2;
      lpd.position.set(0, 2.62, 0.24);
      cpu.add(lpd);

      cpu.position.set(0, -PKG_D / 2 - 2.4, 0);
      g.add(cpu);

      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.55, 0.16),
        mat({ color: 0x2b3a4a, metalness: 0.8, roughness: 0.3, emissive: 0x1a3a5a, emissiveIntensity: 0.4 })
      );
      bridge.position.set(0, -PKG_D / 2 - 0.9, 0);
      g.add(bridge);

      addEdges(g, 0x7fc0ff, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'vera',
        title: 'Vera CPU · 88 颗 Olympus 核心',
        anchor: U(0, -PKG_D / 2 - 4.9, 0.3),
        body: `<b>VR200 是"超级芯片"概念</b>：1 颗 Vera CPU + 2 颗 Rubin GPU 作为不可分割的单元销售。

Vera 是 Grace 的继任者，用 <b>88 颗定制的 Olympus ARM 核心</b>（注意：部分资料仍写 72 颗，是 GTC 早期口径，GTC 2026 最终为 88）。
- LPDDR5X：最高 <b>1.5 TB</b> 容量，<b>1.2 TB/s</b> 带宽
- NVLink-C2C：与 GPU 通信 <b>1.8 TB/s</b>

CPU 的节奏规律是"两代 GPU 换一代 CPU"：Grace 服务 Hopper 和 Blackwell 两代，Vera 服务 Rubin 和 Feynman 两代。

这个封装单元化思路的深层逻辑：<b>GPU 之间的互连带宽最终才是决定 scale-up 效率的天花板</b>。22 TB/s 的 HBM 带宽解决单芯片内的问题，1.8 TB/s 的 C2C 解决 CPU↔GPU 的问题，两者不能互相替代。`,
        stats: [
          { label: '核心', value: '88 颗定制 Olympus ARM' },
          { label: '内存', value: 'LPDDR5X 最高 1.5TB / 1.2 TB/s' },
          { label: 'NVLink-C2C', value: '1.8 TB/s' },
          { label: '代际节奏', value: 'CPU 两代 GPU 一换' },
          { label: '单元构成', value: '1 Vera + 2 Rubin' },
        ],
      },
    ],
  });

  // ============ 6. 封装基板 ============
  layers.push({
    id: 'substrate',
    refImage: './ref/rubin/substrate.jpg',
    name: '封装基板 + 供电',
    group: '封装',
    explodeDir: U(0, 0, -0.7),
    sectionable: true,
    build() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new RoundedBoxGeometry(PKG_W, PKG_D, PKG_H, 2, 0.08), pcbMaterial(0xffffff)));

      for (let i = 0; i < 4; i++) {
        const l = new THREE.Mesh(
          new RoundedBoxGeometry(PKG_W - 0.02, PKG_D - 0.02, 0.09, 2, 0.03),
          mat({ color: i % 2 ? 0x1d4028 : 0x14321f, metalness: 0.08, roughness: 0.88 })
        );
        l.position.y = -PKG_H / 2 + 0.06 + i * 0.13;
        g.add(l);
      }

      // BGA 球焊阵列：用 InstancedMesh 合并成单个 draw call
      const BGA_X = 26;
      const BGA_Y = 34;
      const ballGeo = new THREE.SphereGeometry(0.05, 8, 6);
      const balls = new THREE.InstancedMesh(ballGeo, metalMaterial(0xd8c48a, 0.35), BGA_X * BGA_Y);
      const mtx = new THREE.Matrix4();
      let bi = 0;
      for (let x = 0; x < BGA_X; x++) {
        for (let y = 0; y < BGA_Y; y++) {
          mtx.makeTranslation(
            -PKG_W / 2 + 0.4 + x * ((PKG_W - 0.8) / (BGA_X - 1)),
            -PKG_D / 2 + 0.4 + y * ((PKG_D - 0.8) / (BGA_Y - 1)),
            -PKG_H / 2 - 0.03
          );
          balls.setMatrixAt(bi++, mtx);
        }
      }
      balls.instanceMatrix.needsUpdate = true;
      balls.castShadow = true;
      balls.receiveShadow = true;
      balls.userData.layerId = 'substrate';
      g.add(balls);

      for (let i = 0; i < 6; i++) {
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.14), mat({ color: 0x2a2a30, metalness: 0.5, roughness: 0.55 }));
        v.position.set(PKG_W / 2 - 1.1, -PKG_D / 2 + 1.6 + i * 2.4, -PKG_H / 2 - 0.1);
        g.add(v);
      }

      addEdges(g, 0x4b9e5f, 0.12);
      return g;
    },
    hotspots: [
      {
        id: 'substrate',
        title: 'ABF 载板 · BGA 互连',
        anchor: U(-PKG_W / 2 + 1.4, -PKG_D / 2 + 1.0, -PKG_H / 2 - 0.1),
        body: `基板用 ABF（Ajinomoto Build-up Film）载板，是封装里最"不起眼"但最影响良率的一层。

上千个球焊点（BGA 示意）把整个封装连到主板。2300W 的 TDP 意味着供电网络要扛住远超上一代的电流，这也是为什么基板层数、走线宽度、铜厚都在成为设计瓶颈。

产能视角：CoWoS-L 中介层良率 + ABF 载板供给 + HBM4 产能，三者任意一个卡住，Rubin 的出货就上不来。目前 B300 的交付周期已从 36 周降到 18 周，需求正是在为 Rubin 换代腾空间——这本身是个明确的信号。`,
        stats: [
          { label: '载板', value: 'ABF（Ajinomoto 积层膜）' },
          { label: '互连', value: 'BGA 焊球阵列' },
          { label: 'TDP', value: '≈2300 W（B200 约 1200W）' },
          { label: '基板尺寸级', value: '约 120 × 150 mm' },
        ],
      },
    ],
  });

  return {
    id: 'rubin',
    name: 'NVIDIA Rubin VR200',
    subtitle: 'NVIDIA · 2026 下半年 · Blackwell 之后的第一代',
    tagline: '四 tile 架构：2 计算 die + 2 I/O die + 8 组 HBM4，把带宽推到 22 TB/s',
    background: 0xf2f5f7,
    accent: '#76b900',
    camera: { position: [14, 11, 22], target: [0, 0, 0] },
    explodeScale: 0.72,
    sectionable: true,
    fidelity: {
      actualParts: 8,
      source: '封装本体为 2 计算 die + 2 I/O die + 8 组 HBM4 + CoWoS-L 中介层 + ABF 载板；BGA 焊球阵列约 1428 个焊点',
      modeledLayers: 6,
      modeledParts: 319,
      note: '半导体封装本身接近零件级精度：4 个 tile 与 8 组 HBM4 均为独立建模。BGA 焊球以 InstancedMesh 按真实阵列密度生成（26×34），是全站唯一接近真实零件量的部分。die 内部功能分区为结构性示意，不代表真实版图。',
    },
    layers,
    headline: [
      { label: '晶体管', value: '3360', unit: '亿' },
      { label: '带宽', value: '22', unit: 'TB/s HBM4' },
      { label: 'FP4 推理', value: '50', unit: 'PFLOPS' },
      { label: '工艺', value: '3nm', unit: 'TSMC N3P' },
    ],
    overview: `Rubin 是 Blackwell 之后 NVIDIA 的第一代架构（GTC 2026 完整披露，2026 下半年数据中心落地）。它不是"更大的 Blackwell"，而是一次架构重置——官方措辞是：<b>Vera、Rubin、NVLink 6、HBM4、Groq 3 LPU 是作为一个系统协同设计的</b>。

真正的新东西有三个：四 tile 封装布局（2 计算 + 2 I/O）、HBM4 带来的 22 TB/s、以及从 Hopper/Blackwell 时代的"半代升级"跳到了完整的节点跨越（4NP → N3P）。节点节奏也确认了年度化：Blackwell（2025）→ Rubin（2026 H2）→ Rubin Ultra（2027 H2）→ Feynman（2028）。

建模说明：按 GTC 2026 披露的物理布局做参数化重建（四 tile + 8 组 HBM4 + CoWoS-L 中介层 + ABF 载板），不是显微照片。die 内部的功能分区是结构性示意，不代表真实版图。`,
    narrative: [
      `<b>为什么带宽比容量重要</b>：Rubin 容量 288GB，和 Blackwell Ultra 的 B300 <b>完全一样</b>。Blackwell Ultra 已先把容量做到 288GB，Rubin 的全部增量都在带宽（8 → 22 TB/s）。

这不是巧合。推理的 decode 阶段（逐 token 生成）本质是带宽瓶颈而非算力瓶颈——每生成一个 token 都要把整个模型权重流过一遍。带宽 2.75 倍，直接对应 token 生成吞吐提升。这也是 Rubin 平台宣传"token 成本降至 Blackwell 十分之一"的技术根据。`,
      `<b>四 tile 而不是双 die</b>：早期报道普遍把 Rubin 说成"双 die"。GTC 2026 最终披露是 <b>2 计算 die + 2 颗专用 I/O die</b>。区别很大：I/O die 承载 8 个 HBM4 控制器（HBM4 接口翻倍到 2048-bit，布线面积巨大）、NVLink 6、PCIe 和加密单元。

拆出来的收益是制程解耦——计算 die 用最先进节点追性能，I/O die 按 I/O 密度和功耗优化，两者不必绑定在同一个工艺上。`,
      `<b>CoWoS 良率才是产能瓶颈</b>：2026 年 4 月，Rubin Ultra 从四 die 退回双 die，原因是 TSMC CoWoS-L 在四 die 配置下良率不理想、四 die 间互连带宽达不到推理的延迟要求。

这条信息的价值：<b>限制 AI 芯片出货的从来不只是晶圆产能，还有先进封装产能</b>。Rubin Ultra 退回双 die 版本（仍宣称相对 B300 每瓦推理吞吐 3.5 倍提升），就是封装工程对芯片架构的反向约束。`,
    ],
    specs: [
      { label: '架构代号', value: 'Rubin（GTC 2026 披露）' },
      { label: '封装', value: 'R200：2 计算 die + 2 I/O die' },
      { label: '晶体管', value: '3360 亿' },
      { label: '工艺', value: 'TSMC N3 / N3P（3nm）' },
      { label: '内存', value: '288 GB HBM4（8 组堆栈）' },
      { label: '带宽', value: '22 TB/s' },
      { label: 'FP4 推理 / 训练', value: '50 / 35 PFLOPS' },
      { label: 'NVLink 6', value: '3.6 TB/s 每 GPU（双向）' },
      { label: '线程数', value: '176（支持 SMT）' },
      { label: 'TDP', value: '≈2300 W' },
      { label: '超级芯片', value: 'VR200 = 1 Vera + 2 Rubin' },
      { label: 'Vera CPU', value: '88 颗 Olympus ARM 核心' },
      { label: '量产时间', value: 'R100 采样 2026 Q4 / 量产 2027 Q1' },
    ],
    comparison: {
      title: 'Rubin VR200 对比 Blackwell Ultra B300',
      note: '官方规格对比；Rubin 为官方发布值，B300 为 NVIDIA 数据表值',
      rows: [
        { label: '晶体管', prev: '2080 亿', curr: '3360 亿', delta: 'up' },
        { label: '工艺', prev: 'TSMC 4NP', curr: 'TSMC N3P', delta: 'up' },
        { label: 'die 布局', prev: '双 chiplet', curr: '2 计算 + 2 I/O（四 tile）', delta: 'up' },
        { label: '内存容量', prev: '288 GB HBM3e', curr: '288 GB HBM4', delta: 'flat' },
        { label: '带宽', prev: '8 TB/s', curr: '22 TB/s', delta: 'up' },
        { label: 'HBM 接口', prev: '1024-bit', curr: '2048-bit', delta: 'up' },
        { label: 'FP4 推理', prev: '≈15 PFLOPS', curr: '50 PFLOPS', delta: 'up' },
        { label: 'FP4 训练', prev: '≈10 PFLOPS', curr: '35 PFLOPS', delta: 'up' },
        { label: 'NVLink', prev: '5 · 1.8 TB/s', curr: '6 · 3.6 TB/s', delta: 'up' },
        { label: 'TDP', prev: '≈1200 W', curr: '≈2300 W', delta: 'up' },
        { label: '机架功率', prev: 'GB300 NVL72 ≈140 kW', curr: 'VR200 NVL72 ≈190–230 kW', delta: 'up' },
        { label: '机架 HBM 总量', prev: '20.7 TB', curr: '20.7 TB', delta: 'flat' },
      ],
    },
  };
}
