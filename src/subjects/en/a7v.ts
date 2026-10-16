import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * Sony A7 V — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / hotspot stats / step stats,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must keep
 * the same length as the Chinese array (4 paragraphs), otherwise the merge step falls
 * back to Chinese wholesale.
 *
 * Numbers, units and product names carry across verbatim: 131 × 63 × 79.4 mm, 614 g,
 * 35.6 × 23.8 mm, 2280 mAh / 7.2 V, 600–700 shots, 10 fps, 8 stops, 300,000 cycles.
 * Chinese myriad units are rendered in the standard English convention:
 * 3300 万 → 33 MP, 944 万点 → 9.44 MP, 8 级 → 8 stops.
 *
 * Note on hotspot / step `stats`: applyEn only swaps `label` and always keeps the Chinese
 * `value`, so only labels are mapped here. `specs` values are full overrides.
 */
export const sonyA7VEn: SubjectEn = {
  name: 'Sony A7 V',
  subtitle: 'Sony · full-frame mirrorless · seventh-generation reference body',
  tagline: '33 MP stacked CMOS + BIONZ XR + 8-stop 5-axis IBIS — the engineering baseline for the imaging flagship',
  overview:
    'The A7 V represents the engineering baseline of the full-frame mirrorless: a 33 MP <b>stacked CMOS</b> sensor, the BIONZ XR processor, 8-stop 5-axis in-body stabilization, and a 9.44 MP EVF. ' +
    'What is actually worth looking at here is not the spec sheet but <b>how three decisions reinforce each other: the stacked sensor, sensor-shift stabilization, and a single-package processor</b> — together they decide whether the camera can keep up with a moving subject.',
  headline: {
    '有效像素': 'Effective pixels',
    '机身防抖': 'In-body stabilization',
    '机身重量': 'Body weight',
    'EVF': 'EVF',
  },
  specs: {
    '机身尺寸': { label: 'Body dimensions', value: 'Approx. 131 × 63 × 79.4 mm' },
    '机身重量': { label: 'Body weight', value: 'Approx. 614 g (battery and cards included)' },
    '传感器': { label: 'Sensor', value: '33 MP full-frame stacked CMOS', note: '35.6 × 23.8 mm, back-illuminated with a cache layer' },
    '处理器': { label: 'Processor', value: 'BIONZ XR', note: 'Approx. 8× the processing power of the previous generation' },
    '防抖': { label: 'Stabilization', value: '5-axis IBIS, approx. 8 stops' },
    '取景器': { label: 'Viewfinder', value: '9.44 MP OLED EVF' },
    '存储': { label: 'Storage', value: 'CFexpress Type A + SD UHS-II dual card slots' },
    '电池': { label: 'Battery', value: 'NP-FZ100, approx. 600–700 shots' },
  },
  narrative: [
    '<b>Stacked architecture is the dividing line for response speed.</b> The pixel layer and the logic layer are fabricated as two separate dies and bonded together, with the cache memory sitting right beside the pixels. That buys roughly an order of magnitude in readout speed. Without it, the electronic shutter cannot keep up, rolling shutter cannot be suppressed, and the burst buffer cannot support high frame rates.',
    '<b>In-body stabilization frees the stabilization gain from the lens.</b> IBIS moves the sensor itself and delivers a consistent benefit with any lens mounted. This is the most underrated advantage of mirrorless over DSLRs — a DSLR relies on mirror pre-lift, which is fundamentally an avoidance strategy rather than a solution.',
    '<b>Compute power determines the experience more than pixel count does.</b> The gain from BIONZ XR is far larger than the gain in sensor pixels. Sensor resolution frequently stands still between generations; the processor is what separates them.',
    '<b>Interchangeable lenses and a user-replaceable battery are the last structural advantages the camera still has.</b> Dust ingress, corroded contacts and battery aging are all serviceable; a phone has all of them soldered shut.',
  ],
  repairability: {
    difficulty: 'Moderate',
    tools: [
      'Precision / pentalobe screwdriver',
      'Spudger / pry tool / suction cup',
      'Anti-static tweezers',
      'Blower / sensor-cleaning swab',
      'Anti-static wrist strap',
    ],
    note:
      'Battery and memory cards are user-replaceable. The sensor and the shutter assembly are best left to a service center. The blower, sensor-cleaning swabs and the anti-static wrist strap have no entry in the tool gallery, so they render without an illustration.',
  },
  fidelity: {
    source:
      'No authoritative teardown reference has been counted part by part; this subject is modeled from published specifications and standard engineering practice',
    note:
      'The model expresses 7 functional subsystems, not a part-level bill of materials. Figures are taken from published specifications; internal mechanical detail is schematic.',
  },
  layers: {
    body: {
      name: 'Body shell · magnesium-alloy chassis',
      group: 'Structure',
      hotspots: {
        'body-mg': {
          title: 'Magnesium-alloy chassis, not a plastic shell',
          body:
            'The A7-series chassis is a <b>die-cast magnesium alloy</b>, wrapped in engineering plastic and rubber skin. Magnesium alloy offers high specific strength and good vibration damping, which is how the camera meets full-frame stiffness requirements at a body weight a little over 600 g. <b>In a drop, the first parts to break are the lens mount and the viewfinder hump</b> — both are force-concentration points.',
          stats: {
            '骨架材料': 'Chassis material',
            '机身重量': 'Body weight',
            '易损点': 'Fracture-prone points',
          },
        },
      },
    },
    sensor: {
      name: 'Sensor · 33 MP stacked CMOS',
      group: 'Optics',
      hotspots: {
        'sensor-stacked': {
          title: 'Stacked architecture: the pixel layer is separated from the logic layer',
          body:
            'A stacked CMOS builds the <b>pixel layer and the logic layer as two separate dies and bonds them together</b>, with the cache memory placed beside the pixels instead of behind them. The result is roughly an order of magnitude faster readout — and that is the underlying reason the electronic shutter can keep pace and rolling shutter can be held down. <b>The sensor is the one core component in the camera that cannot be "repaired"</b>: dust can be cleaned, but a defective pixel can only be replaced by a new sensor.',
          stats: {
            '有效像素': 'Effective pixels',
            '画幅': 'Format',
            '结构': 'Architecture',
          },
        },
        'sensor-dust': {
          title: 'Sensor dust is the mirrorless condition to live with',
          body:
            'An interchangeable lens mount is permanently open to the atmosphere, so dust gets in every time a lens is swapped. <b>Dust on the low-pass glass can be blown off; anything landing on the imaging surface has to be removed with the sensor-cleaning mode and a dedicated swab.</b> Never blow with your mouth — saliva permanently contaminates the coatings.',
          stats: {
            '风险': 'Risk',
            '处理': 'Remedy',
            '禁忌': 'Prohibition',
          },
        },
      },
    },
    evf: {
      name: 'Electronic viewfinder · 9.44 MP',
      group: 'Optics',
      hotspots: {
        'evf-944': {
          title: '9.44 MP — the viewfinder is a primary display',
          body:
            'The A7 V EVF is a <b>9.44 MP OLED</b>, and its magnification and clarity now approach the viewing feel of an optical finder. It also carries a practical benefit: <b>in bright light the rear screen becomes unreadable while the viewfinder still allows framing</b> — one of the largest experiential advantages of mirrorless over DSLR.',
          stats: {
            '点数': 'Dot count',
            '类型': 'Type',
            '眼启动': 'Eye-start',
          },
        },
      },
    },
    shutter: {
      name: 'Shutter and 5-axis stabilization mechanism',
      group: 'Mechanics',
      hotspots: {
        'shutter-ibis': {
          title: '5-axis stabilization works by moving the sensor itself',
          body:
            'In-body stabilization (IBIS) does not rely on the lens. It <b>mounts the sensor on a platform that can move by micrometres, driven by electromagnetic actuators across five degrees of freedom</b>. That is why a stabilized body delivers a consistent gain with any lens. <b>The mechanical shutter has a rated life (on the order of 300,000 cycles); the electronic shutter does not</b> — prefer the electronic shutter for high-frame-rate video.',
          stats: {
            '补偿轴数': 'Axes of correction',
            '效果': 'Performance',
            '快门寿命': 'Shutter life',
          },
        },
      },
    },
    board: {
      name: 'Main board · BIONZ XR image processor',
      group: 'Electronics',
      hotspots: {
        'board-soc': {
          title: 'BIONZ XR: compute power matters more than pixel count',
          body:
            'The raw data volume from a 33 MP sensor is large, so <b>processor throughput directly determines burst depth, autofocus response and noise control</b>. BIONZ XR delivers roughly 8× the processing power of its predecessor, and that is where this generation is genuinely new — sensor resolution frequently stands still.',
          stats: {
            '处理器': 'Processor',
            '算力提升': 'Processing gain',
            '连拍': 'Burst rate',
          },
        },
      },
    },
    battery: {
      name: 'Battery compartment · NP-FZ100',
      group: 'Energy',
      hotspots: {
        'battery-fz100': {
          title: 'NP-FZ100: one battery covers a full day',
          body:
            'The 2280 mAh NP-FZ100 delivers <b>600–700 shots (CIPA)</b> on the A7 series, placing it among the best endurance tiers in mirrorless. It uses a <b>user-replaceable design, so the owner can swap it</b> — and this is the sharpest divide in serviceability between a camera and a phone: replacing a phone battery is a destructive operation, whereas on a camera it is a designed, routine task.',
          stats: {
            '型号': 'Model',
            '容量': 'Capacity',
            '续航': 'Endurance',
          },
        },
      },
    },
    slots: {
      name: 'Dual card slots · CFexpress Type A + SD',
      group: 'Storage',
      hotspots: {
        'slots-dual': {
          title: 'Why a professional body needs dual card slots',
          body:
            'CFexpress Type A handles high-speed burst and high-bitrate video; the SD slot handles compatibility and backup. <b>The real value of dual slots is not capacity but the option to write both cards simultaneously</b> — for weddings, news and other events that cannot be reshot, losing one card costs far more than the price of a card.',
          stats: {
            '槽 1': 'Slot 1',
            '槽 2': 'Slot 2',
            '备份模式': 'Backup mode',
          },
        },
      },
    },
  },
  steps: {
    'a-s1': {
      title: 'Remove the battery and memory cards',
      body:
        'A mirrorless teardown starts with the battery — <b>the only part of the camera designed for you to remove daily</b>. Take out both cards at the same time so that a loose card cannot catch on the flex cables as they are released.',
      tools: ['None'],
      stats: {
        '顺序': 'Order',
      },
    },
    'a-s2': {
      title: 'Remove the bottom plate and side covers to expose the main board',
      body:
        'Back out the screws on the bottom plate and the left side cover. <b>Sorted by position, the screws must be laid out separately</b> — screw sizes are not consistent across the A7-series body, and mixing them will strip the threads.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '注意': 'Caveat',
      },
    },
    'a-s3': {
      title: 'Disconnect the flex cables and lift out the main board',
      body:
        'Disconnect the sensor flex, the EVF flex and the interface-board flex in turn, then lift the main board out. <b>Connector latches must be released vertically rather than pulled sideways</b> — sideways peeling is the most common cause of torn flex cables.',
      tools: ['Anti-static tweezers', 'Spudger / pry tool / suction cup'],
      stats: {
        '风险': 'Risk',
      },
    },
    'a-s4': {
      title: 'Remove the EVF module',
      body:
        'Lift the EVF module out of the viewfinder hump. The 9.44 MP micro-OLED is <b>one of the single most expensive parts in the system</b>; do not press on the eyecup during removal.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '点数': 'Dot count',
      },
    },
    'a-s5': {
      title: 'Remove the shutter and the sensor stabilization platform',
      body:
        'Release the shutter assembly, then remove the sensor platform together with its actuators. <b>This is the most precisely engineered mechanical assembly in the camera</b>. The positional relationship between the actuators and the magnets is calibrated at the factory and cannot be restored once disassembled — do not attempt this without training.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static wrist strap'],
      stats: {
        '风险': 'Risk',
      },
    },
    'a-s6': {
      title: 'Finally remove the sensor',
      body:
        'The sensor is mounted on its carrier plate and fixed by four screws. <b>Confirm the platform is already separated before pulling</b>, otherwise the cover glass gets scratched. At this level you have reached the 33 MP stacked CMOS — the core of the entire camera.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static wrist strap'],
      stats: {
        '画幅': 'Format',
      },
    },
    'a-s7': {
      title: 'Reassembly: work back from the sensor outward',
      body:
        'Reassembly follows the exact reverse order: sensor → stabilization platform → shutter → EVF → main board → covers. <b>Power up and test after each layer</b> rather than assembling everything and only then finding that it does not turn on.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static wrist strap'],
      stats: {
        '原则': 'Principle',
      },
    },
  },
};

export const sonyA7VMetaEn: SubjectMetaEn = {
  name: 'Sony A7 V',
  subtitle: 'Sony · full-frame mirrorless · seventh-generation reference body',
  tagline: '33 MP stacked CMOS + BIONZ XR + 8-stop 5-axis IBIS — the engineering baseline for the imaging flagship',
};