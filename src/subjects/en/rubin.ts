import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * NVIDIA Rubin VR200 — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / stats / comparison rows,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must
 * keep the same length as the Chinese array (3 paragraphs), otherwise the merge
 * step falls back to Chinese wholesale.
 *
 * Numbers, units and technology names are carried across verbatim: HBM4,
 * CoWoS-L, Blackwell, Rubin, Vera, NVLink 6, NVLink-C2C, TSV, RDL, ABF,
 * BGA, SMT, SerDes, reticle, 22 TB/s, 288 GB, 336 billion transistors,
 * 50 / 35 PFLOPS, ≈2300 W.
 *
 * Two caveats from the Chinese source are preserved deliberately: the model is a
 * parametric rebuild from the GTC 2026 disclosure rather than a micrograph, and
 * the early 13–14 TB/s bandwidth rumor is kept alongside the official 22 TB/s.
 *
 * Known type-contract gap: headline `unit` fields are not overridable through
 * SubjectEn, so the Chinese unit "亿" (10^8) on the transistor tile still shows
 * up as-is. The headline label is translated here.
 */
export const rubinVR200En: SubjectEn = {
  name: 'NVIDIA Rubin VR200',
  subtitle: 'NVIDIA · H2 2026 · the first generation after Blackwell',
  tagline: 'Four-tile architecture: 2 compute dies + 2 I/O dies + 8 HBM4 stacks, pushing bandwidth to 22 TB/s',
  overview:
    'Rubin is the first NVIDIA architecture after Blackwell (fully disclosed at GTC 2026, landing in data centers in H2 2026). It is not "a bigger Blackwell" but an architectural reset — in official wording, <b>Vera, Rubin, NVLink 6, HBM4 and the Groq 3 LPU were designed together as one system</b>.\n' +
    '\n' +
    'Three things are genuinely new: the four-tile package layout (2 compute + 2 I/O), the 22 TB/s that HBM4 brings, and the move from the "half-generation" upgrades of the Hopper/Blackwell era to a full node jump (4NP → N3P). The node cadence is now confirmed as annual: Blackwell (2025) → Rubin (H2 2026) → Rubin Ultra (H2 2027) → Feynman (2028).\n' +
    '\n' +
    'Modeling note: this is a parametric rebuild from the physical layout disclosed at GTC 2026 (four tiles + 8 HBM4 stacks + CoWoS-L interposer + ABF substrate), not a micrograph. The functional partitioning inside each die is a structural illustration and does not represent the real layout.',
  headline: {
    '晶体管': 'Transistors',
    '带宽': 'Bandwidth',
    'FP4 推理': 'FP4 inference',
    '工艺': 'Process node',
  },
  specs: {
    '架构代号': { label: 'Architecture', value: 'Rubin (disclosed at GTC 2026)' },
    '封装': { label: 'Package', value: 'R200: 2 compute dies + 2 I/O dies' },
    '晶体管': { label: 'Transistors', value: '336 billion' },
    '工艺': { label: 'Process', value: 'TSMC N3 / N3P (3nm)' },
    '内存': { label: 'Memory', value: '288 GB HBM4 (8 stacks)' },
    '带宽': { label: 'Bandwidth', value: '22 TB/s' },
    'FP4 推理 / 训练': { label: 'FP4 inference / training', value: '50 / 35 PFLOPS' },
    'NVLink 6': { label: 'NVLink 6', value: '3.6 TB/s per GPU (bidirectional)' },
    '线程数': { label: 'Thread count', value: '176 (SMT supported)' },
    'TDP': { label: 'TDP', value: '≈2300 W' },
    '超级芯片': { label: 'Superchip', value: 'VR200 = 1 Vera + 2 Rubin' },
    'Vera CPU': { label: 'Vera CPU', value: '88 custom Olympus ARM cores' },
    '量产时间': { label: 'Production', value: 'R100 sampling 2026 Q4 / volume 2027 Q1' },
  },
  narrative: [
    '<b>Why bandwidth matters more than capacity</b>: Rubin\'s capacity is 288GB, <b>exactly the same</b> as Blackwell Ultra\'s B300. Blackwell Ultra had already pushed capacity to 288GB; all of Rubin\'s increment is in bandwidth (8 → 22 TB/s).\n' +
      '\n' +
      'This is not a coincidence. The decode phase of inference (generating one token at a time) is fundamentally bandwidth-bound rather than compute-bound — every generated token has to stream the entire set of model weights through the part once. A 2.75× bandwidth increase maps directly onto higher token-generation throughput. That is also the technical basis for the Rubin platform\'s claim that token cost falls to one tenth of Blackwell.',
    '<b>Four tiles rather than two dies</b>: early reporting consistently described Rubin as a "dual-die" part. What GTC 2026 finally disclosed is <b>2 compute dies + 2 dedicated I/O dies</b>. The difference is substantial: the I/O dies carry the 8 HBM4 controllers (the HBM4 interface doubles to 2048-bit, so the routing area is enormous), plus NVLink 6, PCIe and the encryption units.\n' +
      '\n' +
      'The payoff of splitting them out is process-node decoupling — the compute dies chase performance on the most advanced node, while the I/O dies are optimized for I/O density and power, and the two no longer have to be bound to the same process.',
    '<b>CoWoS yield is the real capacity bottleneck</b>: in April 2026 Rubin Ultra was walked back from four dies to two, because TSMC CoWoS-L yield in a four-die configuration was unsatisfactory and the interconnect bandwidth between four dies could not meet the latency requirements of inference.\n' +
      '\n' +
      'Why that datapoint matters: <b>what limits AI chip shipments has never been wafer capacity alone — advanced packaging capacity is a constraint too</b>. Rubin Ultra falling back to a two-die version (still claimed to hold a 3.5× gain in inference throughput per watt versus B300) is advanced packaging engineering pushing back on the chip architecture.',
  ],
  comparison: {
    title: 'Rubin VR200 vs Blackwell Ultra B300',
    note: 'Official specification comparison; Rubin figures as published by NVIDIA, B300 figures from the NVIDIA data sheet',
    rows: {
      '晶体管': { prev: '208 billion', curr: '336 billion' },
      '工艺': { prev: 'TSMC 4NP', curr: 'TSMC N3P' },
      'die 布局': { prev: 'Dual chiplet', curr: '2 compute + 2 I/O (four tiles)' },
      '内存容量': { prev: '288 GB HBM3e', curr: '288 GB HBM4' },
      '带宽': { prev: '8 TB/s', curr: '22 TB/s' },
      'HBM 接口': { prev: '1024-bit', curr: '2048-bit' },
      'FP4 推理': { prev: '≈15 PFLOPS', curr: '50 PFLOPS' },
      'FP4 训练': { prev: '≈10 PFLOPS', curr: '35 PFLOPS' },
      'NVLink': { prev: '5 · 1.8 TB/s', curr: '6 · 3.6 TB/s' },
      'TDP': { prev: '≈1200 W', curr: '≈2300 W' },
      '机架功率': { prev: 'GB300 NVL72 ≈140 kW', curr: 'VR200 NVL72 ≈190–230 kW' },
      '机架 HBM 总量': { prev: '20.7 TB', curr: '20.7 TB' },
    },
  },
  fidelity: {
    source:
      'The package itself consists of 2 compute dies + 2 I/O dies + 8 HBM4 stacks + a CoWoS-L interposer + an ABF substrate; the BGA solder-ball array is about 1428 balls.',
    note:
      'Semiconductor packaging is close to part-level fidelity here: the 4 tiles and the 8 HBM4 stacks are each modeled independently. The BGA balls are generated as an InstancedMesh at realistic array density (26×34) and are the only element anywhere on this site that approaches a true part count. Functional partitioning inside the dies is a structural illustration, not the real layout.',
  },
  layers: {
    hbm: {
      name: 'HBM4 memory stacks ×8',
      group: 'Memory',
      hotspots: {
        hbm4: {
          title: 'HBM4 · 288GB · 22 TB/s',
          body:
            "The layer that best expresses the generational gap in Rubin: <b>8 HBM4 stacks, 288GB total capacity, 22 TB/s of bandwidth</b>.\n" +
            '\n' +
            'Against Blackwell:\n' +
            '- Bandwidth 8 TB/s → 22 TB/s, <b>2.75×</b>\n' +
            '- HBM3e → HBM4, interface width doubled to <b>2048-bit</b>\n' +
            '- 10.8 GT/s per pin\n' +
            '\n' +
            'The bandwidth gain comes from two changes at once: doubled interface width (1024 → 2048 bit) plus a higher per-pin rate (roughly 6.4 → 10.8 GT/s). GTC 2026 disclosed a per-stack rate already above 3.0 TB/s.\n' +
            '\n' +
            'One point is easy to overlook: <b>capacity is exactly the same as B300 (288GB in both cases)</b>. Blackwell Ultra had already taken capacity to 288GB; all of the progress Rubin makes is in bandwidth. For inference that is the right direction — the decode phase is bandwidth-bound, not capacity-bound.\n' +
            '\n' +
            'One more note: early rumors estimated 13–14 TB/s, while NVIDIA officially landed on 22 TB/s, a 60% gap. Numbers like this have to wait for the official line.',
          stats: {
            '容量': 'Capacity',
            '带宽': 'Bandwidth',
            '接口': 'Interface',
            '单 pin 速率': 'Per-pin rate',
            '单堆栈': 'Per stack',
          },
        },
      },
    },
    cowos: {
      name: 'CoWoS-L interposer',
      group: 'Packaging',
      hotspots: {
        cowos: {
          title: 'CoWoS-L silicon interposer',
          body:
            'The interposer is the "freeway" of the whole package. The RDL redistribution layer plus the TSV through-silicon-via array bring 8 HBM4 stacks, 2 compute dies and 2 I/O dies into a single interconnect.\n' +
            '\n' +
            'CoWoS is TSMC\'s 2.5D packaging platform, and the L series follows a <b>silicon interposer + local silicon interconnect</b> route. Compared with CoWoS-S, the L series controls warpage and yield better on a large-size (9.5 reticle-limit) interposer.\n' +
            '\n' +
            'April 2026 carries a lesson worth remembering: Rubin Ultra was originally specified with <b>four dies</b>, but because CoWoS-L yield in a four-die configuration was unsatisfactory and the interconnect bandwidth between four dies could not meet the latency requirements of inference, it was <b>walked back to two dies</b> — reportedly still holding a 3.5× gain in inference throughput per watt versus B300.\n' +
            '\n' +
            'Interposer yield is the true capacity bottleneck for AI silicon — what limits shipments has never been wafer capacity alone.',
          stats: {
            '平台': 'Platform',
            '互连': 'Interconnect',
            '承载': 'Carries',
            'Rubin Ultra 教训': 'Rubin Ultra lesson',
          },
        },
      },
    },
    compute: {
      name: 'Compute dies ×2 (reticle class)',
      group: 'Compute',
      hotspots: {
        compute: {
          title: '2 × reticle compute die · 336 billion transistors',
          body:
            'Rubin uses <b>two compute dies</b>, each of reticle size (about 850mm², the maximum area a single lithography pass can print), <b>336 billion transistors across the two</b>.\n' +
            '\n' +
            'Against Blackwell: 208 billion → 336 billion, <b>1.6×</b>. The process moves in one step from Blackwell\'s TSMC 4NP to <b>N3/N3P</b> — a full node jump, not a half-generation.\n' +
            '\n' +
            'On performance:\n' +
            '- <b>50 PFLOPS FP4 inference</b> (Blackwell roughly 10–20, i.e. 2.5–5×)\n' +
            '- <b>35 PFLOPS FP4 training</b> (roughly 3.5×)\n' +
            '- Third-generation Transformer Engine, NVFP4 + adaptive compression\n' +
            '- SMT supported, <b>176 threads per GPU</b> (a signal of the shift from warp-level parallelism toward a CPU-style threading model)\n' +
            '\n' +
            'TDP rises from roughly 1200W to roughly 2300W, close to doubling — the other side of 22 TB/s and 50 PFLOPS.',
          stats: {
            '晶体管': 'Transistors',
            'vs Blackwell': 'vs Blackwell',
            '工艺': 'Process',
            'die 尺寸': 'Die size',
            'FP4 推理': 'FP4 inference',
            'FP4 训练': 'FP4 training',
            '线程': 'Threads',
            'TDP': 'TDP',
          },
        },
      },
    },
    iodie: {
      name: 'I/O dies ×2',
      group: 'I/O',
      hotspots: {
        iodie: {
          title: 'I/O die · decoupling compute from interconnect',
          body:
            'This is the detail in the GTC 2026 disclosure most easily glossed over by the "dual-die" framing: R200 is not simply two compute dies, it is <b>a four-tile layout of 2 compute dies + 2 dedicated I/O dies</b>.\n' +
            '\n' +
            'Why the I/O dies are split out:\n' +
            '- <b>Compute and interconnect iterate independently</b>. The compute dies chase the most advanced node (3nm), while the I/O dies care more about I/O density and power, so they can use a different process\n' +
            '- <b>Physical space for 8 memory controllers</b>. With the HBM4 interface doubling to 2048-bit, the controller array needs enormous routing area; packing it into the compute dies would squeeze compute density\n' +
            '- <b>Controllable latency</b>. Inference is bottlenecked on data movement in the decode phase, and a dedicated interconnect tile schedules it more precisely\n' +
            '\n' +
            'The I/O dies also integrate NVLink 6 (3.6 TB/s per GPU), PCIe, ConnectX-9 SuperNIC interfaces and a hardware encryption unit.',
          stats: {
            '布局': 'Layout',
            '作用': 'Function',
            'NVLink 6': 'NVLink 6',
            '设计收益': 'Design benefit',
          },
        },
      },
    },
    superchip: {
      name: 'VR200 superchip (Vera CPU)',
      group: 'System',
      hotspots: {
        vera: {
          title: 'Vera CPU · 88 Olympus cores',
          body:
            '<b>VR200 is a "superchip" concept</b>: 1 Vera CPU + 2 Rubin GPUs sold as one indivisible unit.\n' +
            '\n' +
            'Vera is the successor to Grace and uses <b>88 custom Olympus ARM cores</b> (note: some sources still say 72 cores, which is the early GTC figure; GTC 2026 settled on 88).\n' +
            '- LPDDR5X: up to <b>1.5 TB</b> of capacity, <b>1.2 TB/s</b> of bandwidth\n' +
            '- NVLink-C2C: <b>1.8 TB/s</b> to the GPU\n' +
            '\n' +
            'The CPU cadence follows a "one CPU per two GPU generations" rule: Grace served both Hopper and Blackwell, Vera serves both Rubin and Feynman.\n' +
            '\n' +
            'The deeper logic behind unitizing the package this way: <b>interconnect bandwidth between GPUs is ultimately what caps scale-up efficiency</b>. 22 TB/s of HBM bandwidth solves the problem inside a single chip, 1.8 TB/s of C2C solves the CPU↔GPU problem, and the two cannot substitute for each other.',
          stats: {
            '核心': 'Cores',
            '内存': 'Memory',
            'NVLink-C2C': 'NVLink-C2C',
            '代际节奏': 'Cadence',
            '单元构成': 'Unit composition',
          },
        },
      },
    },
    substrate: {
      name: 'Package substrate + power delivery',
      group: 'Packaging',
      hotspots: {
        substrate: {
          title: 'ABF substrate · BGA interconnect',
          body:
            'The substrate is an ABF (Ajinomoto Build-up Film) carrier — the least conspicuous layer in the package and the one that affects yield the most.\n' +
            '\n' +
            'Thousands of solder balls (BGA representation) connect the whole package to the motherboard. A 2300W TDP means the power delivery network has to carry currents far beyond the previous generation, which is why substrate layer count, trace width and copper thickness are all becoming design bottlenecks.\n' +
            '\n' +
            'From a capacity standpoint: CoWoS-L interposer yield + ABF substrate supply + HBM4 output — if any one of the three jams up, Rubin shipments cannot rise. B300 lead times have already come down from 36 weeks to 18, and demand is making room for the Rubin transition, which is itself a clear signal.',
          stats: {
            '载板': 'Carrier',
            '互连': 'Interconnect',
            'TDP': 'TDP',
            '基板尺寸级': 'Substrate size class',
          },
        },
      },
    },
  },
  steps: {
    's1-superchip': {
      title: 'Lift the superchip package off the motherboard',
      body:
        'The whole VR200 package is removed from the motherboard. This is the most expensive single part in the system, so one removal effectively scraps it — which is why this step only ever happens in yield analysis or failure analysis, never on a production line.',
      tools: ['BGA rework station', 'X-ray NDT'],
      stats: {
        '封装形式': 'Package type',
        '拆解场景': 'Teardown scenario',
      },
    },
    's2-substrate': {
      title: 'Separate the package substrate and power layers',
      body:
        'The organic substrate carries all power delivery and signal redistribution, and the BGA balls connect the package to the motherboard. The number of substrate layers directly determines power-delivery capability — current demand is the biggest engineering challenge in an AI chip.',
      tools: ['BGA rework station', 'X-ray NDT'],
      stats: {
        '连接方式': 'Connection method',
        '作用': 'Function',
      },
    },
    's3-cowos': {
      title: 'Open up the CoWoS-L silicon interposer',
      body:
        'The interposer is the "freeway" that brings multiple dies and the HBM onto one plane. TSV through-silicon vias plus the redistribution layer are already close to optical limits in line width — this is the real technical barrier of advanced packaging.',
      tools: ['BGA rework station', 'Probe station / microscope'],
      stats: {
        '类型': 'Type',
        '关键结构': 'Key structure',
      },
    },
    's4-compute': {
      title: 'Lift out the reticle-class compute dies',
      body:
        'The compute dies are built at the reticle size limit (on the order of 800 mm²), packing hundreds of billions of transistors into a single die. Once that ceiling is reached, the only way forward is multi-die stitching — the fundamental reason behind the move to chiplets.',
      tools: ['BGA rework station', 'Probe station / microscope'],
      stats: {
        '尺寸量级': 'Size class',
        '晶体管': 'Transistors',
      },
    },
    's5-iodie': {
      title: 'Remove the I/O dies',
      body:
        'The I/O dies handle external communication, and the number of SerDes lanes determines how much interconnect bandwidth they can carry. Building them separately from the compute dies lets both be optimized independently on the same process node.',
      tools: ['BGA rework station', 'Probe station / microscope'],
      stats: {
        '职责': 'Responsibility',
        '关键指标': 'Key metric',
      },
    },
    's6-hbm': {
      title: 'Lift off the HBM4 memory stacks',
      body:
        'Last are the 8 HBM4 stacks. The DRAM in a 3D stack is vertically interconnected with TSVs and delivers several times the bandwidth of conventional GDDR — the bottleneck in AI compute is often not the arithmetic but whether data can be fed in fast enough.',
      tools: ['BGA rework station', 'Probe station / microscope'],
      stats: {
        '数量': 'Count',
        '代际': 'Generation',
      },
    },
  },
};

export const rubinVR200MetaEn: SubjectMetaEn = {
  name: 'NVIDIA Rubin VR200',
  subtitle: 'NVIDIA · H2 2026 · the first generation after Blackwell',
  tagline: 'Four-tile architecture: 2 compute dies + 2 I/O dies + 8 HBM4 stacks, pushing bandwidth to 22 TB/s',
};
