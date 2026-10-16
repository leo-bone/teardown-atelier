import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * PlayStation 5 Pro — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / hotspot stats / step stats,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must keep
 * the same length as the Chinese array (4 paragraphs), otherwise the merge step falls
 * back to Chinese wholesale.
 *
 * Numbers, units and product names carry across verbatim: 390 × 260 × 460 mm, 3.1 kg,
 * 390 W, 576 GB/s, +28%, 36 → 60 CUs, 16 GB GDDR6, RDNA 2, PCIe 4.0 ×4, M.2 2280,
 * 7 GB/s, 10 Gbps, 120 mm, 3–6 months, 3–5 minutes.
 *
 * Note on hotspot / step `stats`: applyEn only swaps `label` and always keeps the Chinese
 * `value`, so only labels are mapped here. `specs` values are full overrides.
 *
 * Terminology: 均热板 → vapor chamber, 液态金属 → liquid metal, 拆机 → teardown,
 * 前置接口板 → front I/O board, 保条 → warranty. Right-to-repair framing (user-replaceable
 * SSD and optical drive, no impact on warranty) is kept factual and neutral.
 */
export const ps5ProEn: SubjectEn = {
  name: 'PlayStation 5 Pro',
  subtitle: 'Sony Interactive · November 2024 · ninth-generation high-performance console',
  tagline: 'GPU compute units from 36 to 60, bandwidth +28%, a 390 W PSU — the completed form of the same architecture',
  overview:
    "The PS5 Pro is the completed form of 'same architecture, larger power budget': the chip did not get a new generation, and **more headroom on power delivery and cooling** is what takes the GPU from 36 compute units to 60 and lifts memory bandwidth by 28%.\n" +
    '\n' +
    "What is worth looking at on this machine is not the chip but **how cooling and power delivery set the performance ceiling** — vapor chamber + liquid metal + a 390 W PSU, all three together carrying that gain.",
  headline: {
    'GPU 计算单元': 'GPU compute units',
    '内存带宽': 'Memory bandwidth',
    '内置电源': 'Internal PSU',
    '机身重量': 'Chassis weight',
  },
  specs: {
    '机身尺寸': { label: 'Chassis dimensions', value: 'Approx. 390 × 260 × 460 mm (vertical)' },
    '重量': { label: 'Weight', value: 'Approx. 3.1 kg' },
    'GPU': { label: 'GPU', value: '60 compute units (36 at launch)', note: 'RDNA 2 architecture, higher clock' },
    '内存': { label: 'Memory', value: '16 GB GDDR6', note: '576 GB/s bandwidth, +28%' },
    '内置电源': { label: 'Internal PSU', value: '390 W (350 W at launch)' },
    '存储扩展': { label: 'Storage expansion', value: 'M.2 PCIe 4.0 ×4', note: 'User-installable, no impact on the warranty' },
    '光驱': { label: 'Optical drive', value: 'Detachable Ultra HD Blu-ray drive' },
    '散热': { label: 'Cooling', value: 'Vapor chamber + liquid metal + dual 120 mm fans' },
  },
  narrative: [
    "<b>The performance ceiling is set by cooling and power delivery, not by the chip.</b> On the same APU architecture, the launch PS5 runs at 350 W and the Pro at 390 W — the entire difference sits in the power budget. This is also the shared pattern behind every console generation: the chip stays put, the power budget and the cooling go up.",
    "<b>The architectural dividing line between a console and a PC is memory.</b> The CPU and GPU share the same 16 GB of GDDR6 and the same address space, with no discrete graphics memory. That saves cost and saves latency, but memory bandwidth is graphics memory bandwidth, and how much of it the GPU can claim is a hard ceiling.",
    "<b>The removable optical drive is an inventory decision.</b> Rather than building two SKUs, Sony leaves the 'do I want a drive' choice to the user — at the cost of one more mechanical connector, and therefore one more failure point.",
    '<b>An all-clip shell.</b> Not a single screw is visible on the front or the bottom. It is fast to open and reassemble, but clips have a service life and loosen with repeated disassembly.',
  ],
  repairability: {
    difficulty: 'Moderate',
    tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
    note:
      'Screwless shell; the SSD and the optical drive are both user-replaceable. Field repair of the internal PSU and the APU is not advised. Compressed air and a soft brush are needed in addition to the listed tools, but they have no entry in the tool gallery.',
  },
  fidelity: {
    source:
      'No authoritative teardown reference has been counted part by part; this subject is modeled from published specifications and standard engineering practice',
    note:
      'The model expresses 7 functional subsystems, not a part-level bill of materials. This is a parametric rebuild from published specifications, not a physical scan.',
  },
  layers: {
    shell: {
      name: 'Shell · top cover and side panels',
      group: 'Structure',
      hotspots: {
        'shell-clip': {
          title: 'An all-clip structure, with no screws',
          body:
            "The PS5 shell is **held entirely by clips** — you will not find a single screw on the front or the bottom. The upside is fast assembly and disassembly with no driver hunting; the cost is that clips have a service life and loosen with repeated opening. **The correct technique is to start prying from the bottom** — forcing the top cover will snap a hook.",
          stats: {
            '固定方式': 'Retention method',
            '螺丝数量': 'Screw count',
            '拆解顺序': 'Disassembly order',
          },
        },
      },
    },
    cooling: {
      name: 'Cooling system · vapor chamber and dual fans',
      group: 'Thermal',
      hotspots: {
        'cooling-vapor': {
          title: 'Vapor chamber + liquid metal',
          body:
            'The PS5 Pro APU uses a **large-area vapor chamber** in direct contact with the top cover, paired with a liquid metal thermal interface. That is the key to fitting more compute units into a smaller volume — **the cooling design directly determines how much power the SoC can be given**. The cost is that liquid metal can migrate: do not carry the console upright while removing the thermal module.',
          stats: {
            '导热介质': 'Thermal interface material',
            '风扇': 'Fans',
            '风道': 'Airflow path',
          },
        },
        'cooling-dust': {
          title: 'The dust filters are the first stop for cleaning',
          body:
            'The dust filters at the two side intakes are the parts most prone to clogging. Once clogged, airflow drops, temperature rises and fan speed goes up — **extra noise is usually dust rather than a failing bearing**. Take the filters off, rinse them with water, let them dry and refit them; do not try to suck them clean with a vacuum.',
          stats: {
            '位置': 'Location',
            '清理周期': 'Cleaning interval',
            '可水洗': 'Washable',
          },
        },
      },
    },
    power: {
      name: 'Internal PSU · 390 W',
      group: 'Energy',
      hotspots: {
        'power-390': {
          title: '390 W, 40 W more than the launch model',
          body:
            "The PS5 Pro raises the internal PSU from 350 W to **390 W**, and the entire increase goes to the GPU. **A console's performance ceiling is usually set by power delivery and cooling rather than by the chip itself** — which is also how the Pro model reaches 60 compute units from 36 on the same architecture.",
          stats: {
            '额定功率': 'Rated power',
            '初代 PS5': 'Launch PS5',
            'GPU 计算单元': 'GPU compute units',
          },
        },
        'power-danger': {
          title: 'The power supply is the most dangerous layer in the console',
          body:
            'Even with the mains cord unplugged, **the bulk capacitors in the internal PSU still hold high voltage** and need time to discharge naturally. The first thing in any teardown is to unplug and wait several minutes; do not reach for the power board straight away. This is the only layer in the machine capable of injuring you.',
          stats: {
            '危险等级': 'Hazard level',
            '操作': 'Procedure',
            '可否外场维修': 'Field repair',
          },
        },
      },
    },
    ssd: {
      name: 'M.2 SSD expansion slot',
      group: 'Storage',
      hotspots: {
        'ssd-pcie4': {
          title: 'PCIe 4.0 ×4, but no Gen5 support',
          body:
            "The expansion slot runs **PCIe 4.0 ×4**, on the order of 7 GB/s of bandwidth. Sony sets a minimum read speed for SSDs — too slow a drive will affect game loading, and that is a measured threshold rather than marketing language. Fitting a third-party SSD **does not affect the warranty**; Sony has stated this explicitly.",
          stats: {
            '接口': 'Interface',
            '规格': 'Form factor',
            '保条': 'Warranty',
          },
        },
      },
    },
    board: {
      name: 'Mainboard · APU and memory',
      group: 'Electronics',
      hotspots: {
        'board-soc': {
          title: 'The CPU and the GPU sit in the same package',
          body:
            "The PS5 APU puts **the CPU and the GPU into a single package**, sharing 16 GB of GDDR6 unified memory. This is the biggest architectural difference between a console and a PC: a PC has discrete graphics memory and system memory, while a console has one memory pool and one address space. The benefit is lower cost and lower latency; the cost is that **memory bandwidth is graphics memory bandwidth** — how much of it the GPU can claim is a hard ceiling.",
          stats: {
            '架构': 'Architecture',
            '统一内存': 'Unified memory',
            'Pro 计算单元': 'Pro compute units',
          },
        },
      },
    },
    disc: {
      name: 'Detachable Ultra HD Blu-ray drive',
      group: 'Storage',
      hotspots: {
        'disc-detachable': {
          title: 'The optical drive is removable, not soldered down',
          body:
            "The PS5 optical drive is a **separately removable module**, fixed with a screw and a connector, so digital-edition owners can add one later. Behind that sits a commercial judgement: leaving the 'do I want a drive' choice to the user is cheaper on inventory than building two SKUs. **The cost is that the connector becomes an extra failure point** — a poor contact causes disc read failures.",
          stats: {
            '安装方式': 'Mounting',
            '格式': 'Format',
            '兼容': 'Compatibility',
          },
        },
      },
    },
    io: {
      name: 'Front I/O board · USB-C / USB-A',
      group: 'Electronics',
      hotspots: {
        'io-usbc': {
          title: 'The front USB-C is a new high-speed port on the Pro',
          body:
            'The PS5 Pro adds a **USB-C (10 Gbps)** port at the front and upgrades one at the rear as well. An external SSD used for gaming has to go through one of these high-speed ports — USB-A does not have the bandwidth and will slow loading down. **When choosing an external drive, look at the interface first and the rated speed second.**',
          stats: {
            '前置 USB-C': 'Front USB-C',
            '前置 USB-A': 'Front USB-A',
            '外接 SSD': 'External SSD',
          },
        },
      },
    },
  },
  steps: {
    'p-s1': {
      title: 'Unplug the mains cord and let the capacitors discharge',
      body:
        'The first step of any teardown is to cut power. The bulk capacitors in the internal PSU still hold high voltage after the cord is out, and **the console has to sit for several minutes**. This is the only layer in the machine capable of injuring you.',
      tools: ['None'],
      stats: {
        '等待': 'Wait',
      },
    },
    'p-s2': {
      title: 'Pry the shell clips open from the bottom',
      body:
        'The shell is all clips, with no screws. **Start prying at the bottom** and work along the side panels a row at a time; forcing the top cover will snap a hook. Lay the white side panels down flat once they are off — scratches cannot be undone.',
      tools: ['Spudger / pry tool / suction cup'],
      stats: {
        '螺丝': 'Screws',
        '起点': 'Starting point',
      },
    },
    'p-s3': {
      title: 'Remove the dust filters and clean them out',
      body:
        'Take the dust filters off the two side intakes first, rinse them and dry them. **Doing this makes every later stage of disassembly considerably cleaner**, and it lets you see how blocked the airflow path has become.',
      tools: ['Soft brush', 'Clean water'],
      stats: {
        '周期': 'Interval',
      },
    },
    'p-s4': {
      title: 'Disconnect the fan flex cables and remove the thermal module',
      body:
        'Disconnect the flex cables on both fans, then release the screws holding the thermal module. **Note that the console must not be carried upright** — liquid metal migrates under gravity, so it has to be translated while keeping its original orientation.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '风险': 'Risk',
        '朝向': 'Orientation',
      },
    },
    'p-s5': {
      title: 'Remove the power supply module',
      body:
        'Release the PSU mounting screws and disconnect the mainboard power connector. The power supply is a heavy metal assembly that one hand cannot support — loosen the screws first, then support it from underneath.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '重量': 'Weight',
      },
    },
    'p-s6': {
      title: 'Remove the M.2 SSD and the optical drive module',
      body:
        'The SSD expansion slot and the optical drive are both removable modules, each held by a single screw. **The user can replace both of them without affecting the warranty** — they are the two most accommodating parts in the console.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '保条': 'Warranty',
      },
    },
    'p-s7': {
      title: 'Disconnect the front I/O board and lift out the mainboard',
      body:
        'Finally, disconnect the flex cables on the front USB board and the wireless module antennas, then lift out the mainboard. At this level you are down to a single APU + GDDR6 package — **the entire dividing point between console and PC architecture**.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      stats: {
        '核心': 'Core',
      },
    },
  },
};

export const ps5ProMetaEn: SubjectMetaEn = {
  name: 'PlayStation 5 Pro',
  subtitle: 'Sony Interactive · November 2024 · ninth-generation high-performance console',
  tagline: 'GPU compute units from 36 to 60, bandwidth +28%, a 390 W PSU — the completed form of the same architecture',
};