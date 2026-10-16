import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * DJI Mavic 4 Pro — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / hotspot stats / step stats /
 * comparison rows, ASCII ids for layers, hotspots and steps. Narrative is index-aligned
 * and must keep the same length as the Chinese array (3 paragraphs), otherwise the merge
 * step falls back to Chinese wholesale.
 *
 * Numbers, units and product names carry across verbatim: 1000 g, 95.3 Wh, 51 min,
 * 12 m/s, 4/3 CMOS, 1/1.3", 1/1.5", 28 mm, 70 mm, 168 mm, f/2.0–f/11, 6K/60fps HDR,
 * O4+, 10-bit HDR, 0.1 Lux, Hasselblad HNCS, DJI RC 2 / RC Pro 2, LiDAR, 5000 cycles.
 *
 * Note on hotspot / step `stats`: applyEn only swaps `label` and always keeps the Chinese
 * `value`, so only labels are mapped here. `specs` values are full overrides.
 */
export const mavic4ProEn: SubjectEn = {
  name: 'DJI Mavic 4 Pro',
  subtitle: 'DJI Innovation · triple-camera flagship imaging drone',
  tagline: '100 MP Hasselblad main camera + dual telephoto + 360° gimbal + 30 km 10-bit image transmission',
  overview:
    'The Mavic 4 Pro is DJI\'s current triple-camera flagship aerial camera. Its core is the <b>imaging system</b>: a 4/3-format, 100 MP Hasselblad main camera, plus 1/1.3" and 1/1.5" large-sensor telephotos, on a 360° rotating gimbal.\n' +
    '\n' +
    'Two companion upgrades are easy to overlook and just as important: <b>O4+ image transmission</b> (30 km, 10-bit HDR pass-through) and <b>0.1 Lux night-grade omnidirectional active obstacle avoidance</b>.\n' +
    '\n' +
    '1000 g total weight, 95.3 Wh battery, 51 minutes maximum flight time, 12 m/s maximum wind resistance.\n' +
    '\n' +
    'Modelling note: this is a <b>parametric rebuild from DJI\'s official published specifications</b>, not a physical scan or a reproduction from engineering drawings. Internal gimbal transmission mechanisms and sensor pixel layout are structural schematics. The RC 2 remote controller is included as a same-scene reference and is not part of the Mavic 4 Pro airframe.',
  headline: {
    '主摄': 'Main camera',
    '续航': 'Flight time',
    '图传': 'Image transmission',
    '避障': 'Obstacle avoidance',
  },
  specs: {
    '主摄': { label: 'Main camera', value: '4/3 CMOS · 100 MP · Hasselblad', note: '28 mm equivalent, f/2.0–f/11' },
    '主摄视频': { label: 'Main camera video', value: '6K/60fps HDR', note: '100 MP stills' },
    '中长焦': { label: 'Medium telephoto', value: '1/1.3" CMOS · 48 MP', note: '70 mm equivalent, f/2.8' },
    '长焦': { label: 'Telephoto', value: '1/1.5" CMOS · 50 MP', note: '168 mm equivalent, f/2.8' },
    '云台': { label: 'Gimbal', value: '360° rotating gimbal', note: 'Free, fluid camera movement' },
    '避障': { label: 'Obstacle avoidance', value: '0.1 Lux night-grade omnidirectional active', note: 'Four-direction sensing + belly' },
    '图传': { label: 'Image transmission', value: 'DJI O4+ · 30 km · 10-bit HDR', note: '1080p live preview' },
    '续航': { label: 'Flight time', value: '51 min', note: 'Maximum under ideal conditions' },
    '电池': { label: 'Battery', value: '95.3 Wh intelligent flight battery', note: 'Same-model intelligent pairing' },
    '整机重量': { label: 'Total weight', value: '1000 g', note: 'Battery included, propellers excluded' },
    '最大抗风': { label: 'Max wind resistance', value: '12 m/s', note: 'Retract props above this' },
    '机臂材质': { label: 'Arm material', value: 'Aerospace-grade carbon fibre', note: 'Folding life approx. 5000 cycles' },
    '遥控器': { label: 'Remote controller', value: 'DJI RC 2 (7" rotatable screen)', note: 'Enhanced transmission bundle ships RC Pro 2' },
    '影像功能': { label: 'Imaging features', value: 'Dual native ISO fusion · 5-frame RAW stacking', note: 'Subject tracking / free pano' },
  },
  narrative: [
    '<b>Why the three lenses use three sensor formats</b>: the 4/3 main camera (28 mm equivalent) covers large scenes and image quality, while the two telephotos use 1/1.3" (70 mm) and 1/1.5" (168 mm) for portraits and distant subjects.\n' +
      '\n' +
      'The key point is that <b>both telephotos are large-sensor</b>. Consumer drones normally pair telephotos with small sensors, and the price is insufficient light intake plus image quality that collapses as magnification rises. Using two large formats — 1/1.3" and 1/1.5" — here is what keeps usable image quality at 3× and 7× zoom.\n' +
      '\n' +
      'That changes the usage logic in practice: medium and long portraits can be framed without flying close, and in poor light there is no need to push ISO.',
    '<b>10-bit transmission is the underrated link</b>: three cameras that can shoot 6K/60fps HDR are wasted if the link compresses to 8-bit. O4+ provides <b>10-bit HDR pass-through</b>, 1024 levels of colour depth against the 256 of 8-bit.\n' +
      '\n' +
      'The difference is obvious in a real workflow: an 8-bit live feed shows visible banding in the shadows, and only 10-bit preserves the wide dynamic range that HDR depends on. This is the step from “can shoot it” to “can deliver it”.',
    '<b>What 0.1 Lux active obstacle avoidance actually buys you</b>: active avoidance works by having the aircraft emit its own light for active detection rather than relying on ambient light, and 0.1 Lux is close to the limit of near-total darkness.\n' +
      '\n' +
      'This one figure decides whether night and low-light work is possible at all — indoor performances, candlelit scenes, aerial work in the blue hour after sunset. Historically those were either flown on pilot judgement alone or skipped entirely. Long-exposure night aerial photography is an important technique, and the safety floor has to come first.',
  ],
  comparison: {
    title: 'Mavic 4 Pro vs Mavic 3 Pro',
    note: 'Compiled from DJI official published specifications',
    rows: {
      '主摄': { prev: '4/3 CMOS · 20 MP', curr: '4/3 CMOS · 100 MP' },
      '主摄传感器': { prev: 'Conventional stacked', curr: 'Hasselblad HNCS + larger stack' },
      '中长焦': { prev: '1/1.3" · 48 MP', curr: '1/1.3" · 48 MP' },
      '长焦': { prev: '1/1.5" · 48 MP', curr: '1/1.5" · 50 MP' },
      '光圈': { prev: 'Fixed f/2.0', curr: 'Main camera variable f/2.0–f/11' },
      '主摄视频': { prev: '4K/60fps', curr: '6K/60fps HDR' },
      '图传': { prev: 'O3+', curr: 'O4+ · 10-bit HDR' },
      '云台': { prev: 'Three-axis mechanical gimbal', curr: '360° rotating gimbal' },
      '避障': { prev: 'Omnidirectional active', curr: '0.1 Lux night-grade omnidirectional active' },
      '续航': { prev: '43 min', curr: '51 min' },
      '整机重量': { prev: '≈920 g', curr: '1000 g' },
      '双原生 ISO': { prev: 'Not supported', curr: 'Supported on all three cameras' },
    },
  },
  fidelity: {
    source:
      'The official user manual identifies 16 recognisable parts (forward LiDAR, omnidirectional vision system, gimbal and camera, auxiliary light, 3D infrared sensing system, battery latch, LED, landing gear doubling as antennas, status indicator, motors, propellers, battery, power button, battery-level LEDs, USB-C, microSD card slot); a further 12 items are listed for the RC 2 remote controller.',
    note:
      'This model is organised around the part breakdown in the official manual — of the four subjects it is the one whose granularity sits closest to the official wording. Several parts (auxiliary light, landing-gear antennas, status indicator, 3D infrared sensing system) are merged into the corresponding structural layers rather than broken out on their own.',
  },
  layers: {
    frame: {
      name: 'Four-arm airframe + folding mechanism',
      group: 'Structure',
      hotspots: {
        carbon: {
          title: 'Carbon fibre arms · 5000-cycle folding life',
          body:
            'The arms are <b>aerospace-grade carbon fibre tubes</b>, one at each corner, and for transport the front and rear pairs fold <b>through the vertical plane</b> — a classic Mavic design.\n' +
            '\n' +
            'Carrying over the specification from the Mavic Pro era, the arm hinges tolerate roughly <b>5000 folding cycles</b>.\n' +
            '\n' +
            'There is a practical detail here: <b>the front arms fold in a plane, the rear arms fold through the vertical plane</b>. The two pairs fold in different directions, which makes the folded body more compact — but precisely because of that, the arms carry no position sensors when folded, so <b>the aircraft cannot tell whether it is folded or unfolded, and the motors should not be started in the folded state</b>. DJI states this explicitly in its official FAQ.\n' +
            '\n' +
            'The aluminium-alloy bottom panel is <b>not waterproof</b>. The Mavic sits low, so take-off and landing have to avoid uneven ground and puddles.',
          stats: {
            '机臂材质': 'Arm material',
            '折叠寿命': 'Folding life',
            '折叠方式': 'Folding style',
            '底部材质': 'Bottom material',
          },
        },
      },
    },
    motors: {
      name: '4× brushless motors + folding propellers',
      group: 'Propulsion',
      hotspots: {
        props: {
          title: 'Folding propellers · no removal for transport',
          body:
            'Quick-release folding propellers mean <b>the blades do not have to be removed for transport</b> — folded, they stow on the airframe together with the hub.\n' +
            '\n' +
            'Against a 1000 g all-up weight, the Mavic 4 Pro\'s positioning is unambiguous: <b>the heaviest aerial camera that needs no external payload</b>. The “max payload” field on the JD.com listing reads “other”, i.e. the Mavic line is not a cargo platform.\n' +
            '\n' +
            'Endurance is the hard number for this generation: <b>51 minutes maximum flight time</b>, a 95.3 Wh battery, 12 m/s wind resistance. What buys the 51 minutes is the 1000 g airframe plus improved aerodynamics and powertrain efficiency — not a bigger battery stack.\n' +
            '\n' +
            'From the original Mavic Pro\'s 27 minutes to 51 minutes is close to double in eight years.',
          stats: {
            '电机': 'Motors',
            '桨叶': 'Propellers',
            '整机重量': 'Total weight',
            '最大载重': 'Max payload',
            '最大抗风': 'Max wind resistance',
          },
        },
      },
    },
    gimbal: {
      name: 'Triple-camera gimbal module (360° gimbal)',
      group: 'Optics',
      hotspots: {
        gimbal: {
          title: '360° rotating gimbal',
          body:
            'This generation\'s gimbal is a <b>360° rotating “universal” gimbal</b> — the airframe structure itself places no limit on the gimbal\'s pitch or yaw range, and combined with the obstacle-avoidance geometry of the arms it delivers free, fluid camera movement.\n' +
            '\n' +
            'The principle is not the same as a phone gimbal: an aerial gimbal uses three motors (yaw / pitch / roll) to cancel airframe attitude changes during flight. The three small cylinders on the gimbal are the motors for those three axes.\n' +
            '\n' +
            'This gimbal has to carry three lenses of completely different physical sizes while still guaranteeing <b>three-axis consistency</b> — the hardest part. The three optical axes have to stay parallel at any pitch and yaw angle, otherwise the captured footage cannot be stitched together.',
          stats: {
            '结构': 'Mechanism',
            '轴数': 'Axes',
            '关键指标': 'Key metric',
            '夜景': 'Low light',
          },
        },
      },
    },
    sensor: {
      name: '1-inch Hasselblad main sensor',
      group: 'Optics',
      hotspots: {
        hasselblad: {
          title: '4/3 CMOS · 100 MP · Hasselblad',
          body:
            'The main camera is the absolute core of this generation: a <b>4/3-format, 100 MP Hasselblad camera</b>, 28 mm equivalent focal length, with a variable aperture from f/2.0 to f/11.\n' +
            '\n' +
            'Be careful with the “1 inch” label: <b>1 inch is an industry naming convention carried over from diagonal measurements, not the sensor\'s actual physical size</b>. The real diagonal of a 1-inch sensor is about 16mm, and a 4/3 format is a size class larger than that. Vendors keep the “1 inch” wording to preserve consumer recognition.\n' +
            '\n' +
            'The technically interesting parts are these:\n' +
            '- <b>Dual native ISO fusion</b>: a high and a low sensitivity exposure captured simultaneously and fused automatically, which substantially extends dynamic range. DJI introduced this first on the Mavic 3 Pro, and the Mavic 4 Pro carries it over\n' +
            '- <b>100 MP high-resolution stacking</b>: all three cameras support up to 5-frame high-resolution stacked capture in RAW\n' +
            '- <b>6K/60fps HDR video</b>: exclusive to the main camera\n' +
            '- <b>Hasselblad HNCS natural colour solution</b>: the accumulated colour science behind it, not a badge swap\n' +
            '\n' +
            'On the numbers: 100 MP on the main camera, 48 MP on the ultra-wide / medium telephoto, 50 MP on the telephoto.',
          stats: {
            '主摄': 'Main camera',
            '等效焦距': 'Equivalent focal length',
            '光圈': 'Aperture',
            '视频': 'Video',
            '色彩': 'Colour',
            '堆栈拍摄': 'Stacked capture',
          },
        },
      },
    },
    battery: {
      name: 'Intelligent flight battery 95.3 Wh',
      group: 'Energy',
      hotspots: {
        battery: {
          title: '95.3 Wh · 51 min endurance',
          body:
            '<b>95.3 Wh intelligent flight battery, 51 minutes maximum flight time.</b>\n' +
            '\n' +
            'Put in energy-density terms: 95.3 Wh against a 1000 g all-up weight (battery included, propellers excluded) — that ratio is the physical basis for the 51 minutes.\n' +
            '\n' +
            'The constraints on endurance, worth reading carefully before buying:\n' +
            '- <b>51 minutes</b> is the maximum flight time under ideal conditions\n' +
            '- <b>12 m/s wind resistance</b> — above that the props have to come down\n' +
            '- real usable time has to subtract the return-to-home reserve, and operational planning normally uses <b>70–80% of battery capacity</b>\n' +
            '\n' +
            'DJI\'s battery management has an <b>intelligent same-model pairing</b> mechanism: in a multi-battery operation, only packs of the same model are recognised as usable over the wireless link. Mixing models or production batches simply prevents take-off — not a limitation for its own sake, but a guard against accidents caused by mixing packs.',
          stats: {
            '容量': 'Capacity',
            '最大飞行时间': 'Max flight time',
            '整机重量': 'Total weight',
            '抗风': 'Wind resistance',
            '电池管理': 'Battery management',
          },
        },
      },
    },
    link: {
      name: 'O4+ image transmission + omnidirectional sensing',
      group: 'Communications',
      hotspots: {
        o4: {
          title: 'O4+ · 30 km 10-bit HDR image transmission',
          body:
            '<b>DJI O4+ image transmission, 30 km, 10-bit HDR</b>. This is the last link in the image-quality chain.\n' +
            '\n' +
            'Three cameras shooting 6K/60fps HDR is not enough — <b>if the transmission stage squeezes the signal to 8-bit 4K, all the onboard processing is wasted</b>. O4+ therefore provides 10-bit HDR transmission, passing the processed image back intact.\n' +
            '\n' +
            'Three numbers matter here:\n' +
            '- <b>30 km</b> transmission range\n' +
            '- <b>10-bit</b> colour depth (8-bit is 256 levels, 10-bit is 1024 — a large difference in live-view latitude)\n' +
            '- <b>HDR</b> passed straight through (not SDR compressed and then brightened)\n' +
            '\n' +
            '<b>0.1 Lux night-grade omnidirectional active obstacle avoidance</b> is the sensing specification: active means the aircraft emits its own light instead of relying on ambient light. 0.1 Lux is roughly the level of near-total darkness, and it is the safety floor for night flight.\n' +
            '\n' +
            'The “live image transmission quality” field in the JD.com parameter list reads 1080p — that is the live preview specification, separate from the recording specification.',
          stats: {
            '图传': 'Image transmission',
            '实时预览': 'Live preview',
            '避障': 'Obstacle avoidance',
            '感知方向': 'Sensing directions',
            '天线': 'Antennas',
          },
        },
      },
    },
    remote: {
      name: 'DJI RC 2 folding remote controller',
      group: 'Control',
      hotspots: {
        rc2: {
          title: '7" rotatable screen · built-in antennas',
          body:
            'The DJI RC 2 folding remote controller, built around a <b>7-inch rotatable high-brightness screen</b>.\n' +
            '\n' +
            '“Rotatable” and “high-brightness” go together: portrait suits composition (close to shooting on a phone held upright), landscape suits reviewing the whole scene. In strong outdoor light an ordinary screen is essentially unreadable — a high-brightness panel of this class is typically 1000 nit or more.\n' +
            '\n' +
            'The antennas follow the screen as it rotates. The transmission antennas inside the controller are laid out at different angles (matching the 8-direction O4+ array), so whichever way the screen is turned, the antenna link in that direction is the one actually used. That is the “screen turns, antennas follow” linkage.\n' +
            '\n' +
            'Also note that <b>the standard bundle ships with RC 2 while the enhanced transmission bundle ships with RC Pro 2</b> — they are not the same controller.',
          stats: {
            '屏幕': 'Screen',
            '标配': 'Standard bundle',
            '高配': 'Enhanced bundle',
            '天线': 'Antennas',
          },
        },
      },
    },
  },
  steps: {
    's1-battery': {
      title: 'Remove the battery first',
      body:
        'Pull the intelligent flight battery before taking anything else apart. At 95.3 Wh it already sits at the edge of the 100 Wh carry-on red line, and working on the airframe with the pack fitted is both dangerous and an easy way to fry the ESCs.',
      tools: ['None (latch quick-release)'],
      stats: {
        '容量': 'Capacity',
        '安装方式': 'Mounting',
      },
    },
    's2-motors': {
      title: 'Remove the propellers, then the four brushless motors',
      body:
        'Take the folding propellers off first, then unload the motors. Motors are consumables: after a crash they are treated as replace-don\'t-repair — a single unit costs far less than opening and rewinding it.',
      tools: ['Propeller assembly wrench', 'Precision / pentalobe screwdriver'],
      stats: {
        '电机数': 'Motor count',
        '桨叶': 'Propellers',
      },
    },
    's3-gimbal': {
      title: 'Remove the triple-camera gimbal',
      body:
        'The gimbal is the most precision-critical module on the airframe: three-axis stabilisation plus a shared optical path for three cameras. Disconnect the flex cables before releasing the damper balls — levering against them destroys the stabilisation motors.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      stats: {
        '轴数': 'Axes',
        '摄像头': 'Cameras',
      },
    },
    's4-sensor': {
      title: 'Extract the 1-inch main sensor',
      body:
        'Inside the gimbal is a 1-inch CMOS with its lens group. The alignment tolerance between sensor and lens barrel is extremely tight, making this a part that cannot be serviced in the field — if it fails, the whole group is replaced.',
      tools: ['Cleanroom environment', 'Optical alignment fixture'],
      stats: {
        '传感器': 'Sensor',
        '维护性': 'Serviceability',
      },
    },
    's5-link': {
      title: 'Remove the O4+ transmission and omnidirectional sensing module',
      body:
        'The transmission board and the optical/infrared apertures for omnidirectional obstacle avoidance are concentrated in this block. Flex density is high and shielding requirements are strict — take care not to crease the RF coax runs while removing it.',
      tools: ['Anti-static tweezers', 'RF coax connector crimping tool'],
      stats: {
        '图传': 'Image transmission',
        '感知': 'Sensing',
      },
    },
    's6-frame': {
      title: 'Replace a carbon fibre arm',
      body:
        'The arms are folding carbon fibre structures, and a cracked arm is replaced as a part. The advantage of carbon fibre is low mass and high stiffness; the drawback is that a break cannot be welded in the field the way stainless steel can.',
      tools: ['Carbon fibre cutting tool', 'Arm alignment fixture'],
      stats: {
        '机臂': 'Arm',
        '折叠方式': 'Folding style',
      },
    },
    's7-remote': {
      title: 'Remote controller (accessory, not on the airframe)',
      body:
        'The RC 2 is a separate accessory, but it usually appears in the same teardown walkthrough: the screen, sticks, antennas and ESC telemetry all live inside this one folding controller.',
      tools: ['Precision / pentalobe screwdriver'],
      stats: {
        '型号': 'Model',
        '形式': 'Form factor',
      },
    },
  },
};

export const mavic4ProMetaEn: SubjectMetaEn = {
  name: 'DJI Mavic 4 Pro',
  subtitle: 'DJI Innovation · triple-camera flagship imaging drone',
  tagline: '100 MP Hasselblad main camera + dual telephoto + 360° gimbal + 30 km 10-bit image transmission',
};
