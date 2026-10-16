import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * iPhone 18 Pro — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / stats / comparison rows,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must
 * keep the same length as the Chinese array (3 paragraphs), otherwise the merge
 * step falls back to Chinese wholesale.
 *
 * Numbers, units and part identifiers are carried across verbatim: 0.55 mm,
 * 20.7 → 13.5 mm, 1–120Hz, LTPO, A20 Pro, WMCM, Ceramic Shield 2, MagSafe,
 * f/1.48, OIS, NAND, LPDDR5, Pantone 6076.
 */
export const iPhone18ProEn: SubjectEn = {
  name: 'iPhone 18 Pro',
  subtitle: 'Apple · September 2026',
  tagline: 'First 2nm chip, first variable aperture, first liquid cooling — the Pro that sets up the foldable',
  overview:
    'The iPhone 18 Pro is the opening model of Apple\'s 2nm era, and the most technically loaded of this generation\'s three products (Pro / Pro Max / foldable Ultra). It is also the one that best answers the question of what Apple has actually been doing for the past two years.\n' +
    '\n' +
    'Three main lines move at once: the chip moves to 2nm with WMCM wafer-level multi-chip packaging, imaging introduces a variable aperture and a three-layer stacked sensor for the first time, and the chassis gains a liquid cooling system for the first time. The three interlock — 2nm delivers performance and heat pressure at the same time, the variable aperture and the larger sensor module need extra volume, and the space WMCM saves flows straight back into the battery.\n' +
    '\n' +
    '<b>iFixit completed a physical teardown on September 20, 2026</b>, and the key figures on this page follow what the teardown measured (battery capacity, the 6-blade aperture, the packaging structure) rather than pre-release rumor.\n' +
    '\n' +
    'Three findings in the teardown are worth singling out. <b>A20 Pro\'s packaging changed from "memory stacked above the die" to "side-by-side"</b>, which is what allows the vapor chamber to grow to roughly 3× its previous area, at the cost of NAND being buried inside the sandwiched two-layer board. The <b>6-blade mechanical aperture</b> is an Apple first; during the iFixit teardown one blade flew across the room, and component-level repair was ruled out. And <b>on 3 of 4 units the display\'s plastic frame cracked during disassembly</b> — that frame is not sold separately, so damage normally means replacing the whole display assembly.\n' +
    '\n' +
    'Repairability is provisionally <b>7/10</b>, tied with the 16 and 17 Pro. The USB-C port is still buried inside the chassis.\n' +
    '\n' +
    'Key caveat: this model is a <b>parametric rebuild from published specifications and iFixit teardown findings</b>, not scan data from a physical device. Two thicknesses circulate, 8.8mm and 9mm; the model is built at 8.8mm.',
  headline: {
    '工艺': 'Process node',
    '性能': 'Performance',
    '主摄光圈': 'Main aperture',
    '电池': 'Battery',
  },
  specs: {
    '屏幕': { label: 'Display', value: '6.3" / 6.9" LTPO+ OLED', note: '1–120Hz, Pro / Pro Max' },
    '芯片': { label: 'Chip', value: 'A20 Pro (2nm, WMCM)', note: 'TSMC-fabricated, 12GB LPDDR5' },
    '性能': { label: 'Performance', value: '+18% / efficiency +30%', note: 'vs A19' },
    '主摄': {
      label: 'Main camera',
      value: '6-blade mechanical aperture f/1.48/1.8/2.8/4.0',
      note: 'iFixit teardown measurement; Pro Max may carry an exclusive Samsung three-layer stacked sensor',
    },
    '超广角 / 长焦': { label: 'Ultra-wide / telephoto', value: '48 MP / 48 MP', note: 'Both around 1/2.55" class' },
    '电池（iFixit 实测）': {
      label: 'Battery (iFixit measured)',
      value: 'Pro 4288 / Pro Max 5567 mAh',
      note: 'eSIM models; SIM-tray variants are slightly smaller',
    },
    '厚度': { label: 'Thickness', value: '≈8.8mm (rumored)', note: 'Two versions circulate: 8.8 / 9.0' },
    '散热': { label: 'Cooling', value: 'Liquid cooling + vapor chamber + graphene', note: 'First on iPhone' },
    '充电': { label: 'Charging', value: '60W wired / ≤20W wireless', note: 'MagSafe + Qi2' },
    '维修性评分': { label: 'Repairability score', value: '7 / 10 (iFixit provisional)', note: 'Same score as the 16 / 17 Pro' },
    '主板结构': { label: 'Board structure', value: 'Two-layer sandwich (NAND buried in the inner layer)' },
    '电池拆卸': { label: 'Battery removal', value: '13 screws + electrically released adhesive' },
    '屏下 Face ID': { label: 'Under-display Face ID', value: 'IR camera moved under the panel, interleaved pixels' },
    '配色': { label: 'Colors', value: 'Dark Cherry 6076 / Light Blue 2121 / Silver 427C', note: 'No black option' },
  },
  narrative: [
    '<b>Why liquid cooling becomes necessary after 2nm</b>: the 30% efficiency gain on A20 Pro is good news on its own, but performance also rose 18%, so total heat under sustained high-frequency load is not guaranteed to fall. A phone has no fan; cooling has to come from structure. Liquid cooling plus a vapor chamber plus graphene is the hardware precondition for actually delivering 2nm\'s sustained performance — anyone can post a peak benchmark, but holding clocks without throttling is what separates the experience.\n' +
      '\n' +
      'This is also one of the main sources of the increased body thickness.',
    '<b>What the variable aperture actually buys you</b>: phone lenses are normally fixed somewhere between f/1.4 and f/2, because the iris blades themselves take up volume and drive module thickness. Reaching f/11 means getting close to the diffraction limit on stopping down, and the price is a camera plateau that grows to 13.77mm (Pro Max). That is thickness traded for optical freedom — a genuinely useful trade in professional work such as landscape focus stacking and daytime street photography.\n' +
      '\n' +
      'The honest caveat is depth of field: on a 1/1.3-inch sensor with a 6.8mm focal length, f/1.48 does not produce full-frame background separation.',
    '<b>Where the WMCM space went</b>: integrating RAM onto the same wafer as the CPU/GPU/NPU saves the thickness of a discrete RAM package and the board area it occupied. The saved volume went to two places — a larger battery, and the new liquid cooling system. That is the answer to "the thickness barely changed but the battery grew".',
  ],
  comparison: {
    title: 'iPhone 18 Pro vs iPhone 17 Pro',
    note: 'Compiled from published specifications',
    rows: {
      '芯片工艺': { prev: 'A19 Pro · 3nm', curr: 'A20 Pro · 2nm' },
      '内存封装': { prev: 'Discrete RAM package', curr: 'WMCM, integrated on the same wafer' },
      '性能': { prev: 'Baseline', curr: '+18%' },
      '能效': { prev: 'Baseline', curr: '+30%' },
      '主摄光圈': { prev: 'Fixed f/1.48', curr: '6-blade variable f/1.48–4.0' },
      '传感器': { prev: 'Conventional stacked', curr: 'Pro Max: three-layer stacked (unconfirmed)' },
      '散热': { prev: 'Graphene + vapor chamber', curr: 'Liquid cooling system added' },
      '灵动岛厚度': { prev: '20.7mm', curr: '13.5mm (-35%)' },
      '刷新率': { prev: 'LTPO 1–120Hz', curr: 'LTPO+ 1–120Hz' },
      '电池 Pro（eSIM）': { prev: '4252 mAh', curr: '4288 mAh (+0.8%)' },
      '电池 Pro Max（eSIM）': { prev: '5088 mAh', curr: '5567 mAh (+9.4%)' },
    },
  },
  repairability: {
    difficulty: 'Moderate',
    tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup', 'Precision / pentalobe screwdriver'],
    note:
      'iFixit line (7/10, consistent with recent Pro models): the glass back can be opened for battery replacement and modularity is high, but the display and the battery both still require heat and adhesive removal, and there is a lot of adhesive.',
  },
  fidelity: {
    source:
      'Roughly 2,700 parts in the whole phone (FT supply-chain analysis, cited by ZDNET); the motherboard alone carries 1,243 surface-mount components (TechInsights desoldered and counted every one on the iPhone 15 Pro).',
    note:
      'iFixit teardown measurements: Pro 4288mAh / Pro Max 5567mAh (eSIM models), 6-blade mechanical aperture, and the A20 Pro switching to side-by-side die and memory packaging. This model represents 9 functional subsystems (display / compute / optics / energy / thermal management / structure / RF), not a part-level bill of materials. The 1,243 surface-mount components appear only as a schematic "passive component cluster" and are not modeled individually.',
  },
  layers: {
    cover: {
      name: 'Ceramic Shield front cover',
      group: 'Exterior',
      hotspots: {
        ceramic: {
          title: 'Ceramic Shield (Ceramic Shield 2)',
          body:
            'Apple\'s second-generation Ceramic Shield front glass. Apple claims drop performance more than doubled over the previous generation — the mechanism is <b>ionic exchange inside the crystal structure</b>, which leaves a compressive stress layer on the surface after an impact and arrests crack propagation.\n' +
            '\n' +
            'Roughly 0.55mm thick, bonded to the stainless-steel mid-frame through an adhesive layer. The front camera cutout and the Dynamic Island region are formed in one piece, which avoids bubbles from a second bonding pass.',
          stats: {
            '厚度': 'Thickness',
            '抗跌落': 'Drop performance',
            '表面处理': 'Surface treatment',
          },
        },
        island: {
          title: 'Dynamic Island, 35% smaller',
          body:
            'With the Face ID flood illuminator moved under the panel, the Dynamic Island could be compressed horizontally.\n' +
            '\n' +
            '<b>Thickness drops from 20.7mm to 13.5mm</b>, and the area shrinks by about 35%. The key point here: under-display Face ID itself is <b>not there yet</b> — putting the entire sensor array under the screen has to wait for the iPhone 19 generation. On V3 / iPhone 18 Apple hides the illuminator inside the display and buys a cleaner front face.',
          stats: {
            '灵动岛厚度': 'Island thickness',
            '面积缩减': 'Area reduction',
            '屏下 Face ID': 'Under-display Face ID',
          },
        },
      },
    },
    display: {
      name: 'LTPO+ OLED panel',
      group: 'Display',
      hotspots: {
        ltpoplus: {
          title: 'LTPO+ 1–120Hz',
          body:
            'The LTPO (Low-Temperature Polycrystalline Oxide) backplane is not new in itself, but the <b>"+" suffix marks a real change</b>: it makes the refresh-rate stepping finer, so the panel moves through smoother detents between 1Hz and 120Hz.\n' +
            '\n' +
            'Paired with this panel on the Pro Max and the efficiency gains of A20 Pro, Apple\'s mixed-use endurance figure could pass 40 hours, ahead of the Galaxy S26 Ultra. This is <b>the most underestimated link in the battery-life story</b> — plenty of people assume a bigger battery is the whole explanation, but the display accounts for a substantial share of daily power draw.\n' +
            '\n' +
            '6.3-inch (Pro) / 6.9-inch (Pro Max).',
          stats: {
            'Pro 尺寸': 'Pro size',
            'Pro Max 尺寸': 'Pro Max size',
            '刷新率': 'Refresh rate',
            '技术': 'Technology',
          },
        },
      },
    },
    camera: {
      name: 'Triple-camera module + camera plateau',
      group: 'Optics',
      hotspots: {
        varaperture: {
          title: 'Variable aperture · 6 blades (measured by iFixit)',
          body:
            'This is <b>the core finding confirmed by the iFixit teardown of September 20, 2026</b>, and the first iPhone with a mechanical variable aperture.\n' +
            '\n' +
            '<b>Structure</b>: 6 polymer composite blades, each <b>thinner than a human hair</b> and under 1mm at the cutting edge, driven by <b>electromagnets</b>, changing the opening size by sliding on pins and slots. The drive is <b>independent of the optical image stabilization (OIS) system</b>.\n' +
            '\n' +
            '<b>Detents</b>: f/1.48, f/1.8, f/2.8, f/4.0 — four positions. Against the previous generation\'s fixed f/1.48, the light-gathering difference between maximum aperture and f/4.0 is about <b>7.3×</b>.\n' +
            '\n' +
            '<b>But iFixit\'s assessment is blunt</b>: a repairability disaster. When they heated and pried the lens stack apart, <b>one blade flew across the room</b>. The blades have almost no clearance fit on their pins and the adhesive is sticky, so once the aperture jams <b>component-level repair is impossible and the entire main camera module has to be replaced</b> (that module costs $249 on the iPhone 17 Pro).\n' +
            '\n' +
            '<b>Reservations from a photographer\'s perspective</b>: iFixit argues that on a 1/1.3-inch-class sensor with a 6.8mm focal length these four stops give genuinely controllable exposure, but <b>they do not deliver full-frame background separation at the same aperture</b> — their test shots show the background still legible at f/1.48.\n' +
            '\n' +
            'The Pro Max is expected to carry an exclusive <b>Samsung three-layer stacked image sensor</b> (readout circuitry stacked under the pixel layer).',
          stats: {
            '叶片数': 'Blade count',
            '档位': 'Detents',
            '驱动': 'Drive',
            '叶片厚度': 'Blade thickness',
            '维修性': 'Repairability',
            '前代模组价': 'Previous module price',
          },
        },
      },
    },
    board: {
      name: 'A20 Pro logic board (2nm WMCM)',
      group: 'Compute',
      hotspots: {
        a20pro: {
          title: 'A20 Pro · 2nm · side-by-side packaging (measured by iFixit)',
          body:
            'Apple\'s first 2nm chip, fabricated by TSMC, in a <b>WMCM (wafer-level multi-chip module)</b> package. Against A19: roughly +18% performance and about 30% better efficiency.\n' +
            '\n' +
            '<b>The most important finding from the iFixit teardown: the packaging changed</b>. The previous generation stacked memory <b>above</b> the heat-generating die; the A20 Pro instead places the die and the memory <b>side-by-side</b> — the memory is no longer on the chip\'s direct thermal path.\n' +
            '\n' +
            '<b>That change is the precondition for the whole thermal design</b>. With memory off the thermal path, the processor can <b>sit directly against the vapor chamber</b>. iFixit observed the thermal material pressing the SoC onto the vapor chamber, and that this chamber covers <b>a substantial portion of the chassis</b> — Apple puts its surface area at roughly <b>3×</b> that of the 17 Pro solution.\n' +
            '\n' +
            '<b>But the choice has a cost</b>: NAND storage now sits <b>buried in the sandwich between the two board layers</b>. Any repair that reaches storage level or the deeper board layers has to separate that sandwich first — more heat, more labor, more risk. And <b>the data is encrypted to that NAND</b>, which also makes data recovery harder.\n' +
            '\n' +
            'The overall rearrangement of the board is equally notable: <b>the A20 Pro now sits on the outer layer of the two-layer board</b>.\n' +
            '\n' +
            'The WMCM gain is real: integrating RAM onto the same wafer as the CPU/GPU/NPU saves the thickness of a discrete RAM package and the board area it occupied — that is exactly where the volume comes from to keep thickness almost unchanged while enlarging the battery.',
          stats: {
            '工艺': 'Process',
            '性能 / 能效': 'Performance / efficiency',
            '封装': 'Package',
            '关键变化': 'Key change',
            '均热板': 'Vapor chamber',
            '代价': 'Cost',
            'RAM': 'RAM',
          },
        },
      },
    },
    battery: {
      name: 'Battery (measured by iFixit)',
      group: 'Energy',
      hotspots: {
        battery: {
          title: 'The largest iPhone battery to date',
          body:
            '<b>iFixit teardown readings</b> (published 2026-09-20, eSIM models only):\n' +
            '\n' +
            '- <b>iPhone 18 Pro: 4288 mAh / 16.76 Wh</b> — only <b>0.8%</b> more than the 17 Pro\'s 4252mAh\n' +
            '- <b>iPhone 18 Pro Max: 5567 mAh / 21.751 Wh</b> — <b>9.4%</b> more than the 17 Pro Max\'s 5088mAh\n' +
            '\n' +
            'Coverage: the US, Canada, Mexico, Japan, Saudi Arabia, the UAE, Qatar, Oman, Bahrain and Kuwait. <b>European and other regional versions with a physical SIM tray carry slightly smaller batteries</b> — the tray has to occupy space.\n' +
            '\n' +
            '<b>The battery is a highlight of the teardown</b>: Apple carries over the previous generation\'s <b>screw-fastened metal battery tray</b>. Thirteen screws hold the tray and the battery together, so there is no stretch-release adhesive to fight. The cell uses <b>electrical-release adhesive</b> and comes out cleanly in about 90 seconds at 12V.\n' +
            '\n' +
            '<b>Mind the endurance framing</b>: capacity is not endurance. Real-world figures still rest on Apple\'s own playback-time claims, and on a real device the Pro / Pro Max capacity gap feels far smaller than the 9.4% number suggests.\n' +
            '\n' +
            'The foldable Ultra is the special case: split into two halves, the battery is built as a <b>dual-cell</b> pack spread across both sides of the body, 5400–5800mAh in total.',
          stats: {
            'Pro（eSIM 实测）': 'Pro (eSIM measured)',
            'Pro Max（eSIM 实测）': 'Pro Max (eSIM measured)',
            'Pro 增幅': 'Pro increase',
            'Pro Max 增幅': 'Pro Max increase',
            '带卡槽版本': 'SIM-tray versions',
            '拆解方式': 'Removal method',
          },
        },
      },
    },
    cooling: {
      name: 'Liquid cooling module',
      group: 'Thermal management',
      hotspots: {
        liquid: {
          title: 'Liquid cooling + graphene',
          body:
            'The iPhone 18 Pro family <b>introduces a liquid cooling system for the first time</b> (a feature long rumored in the industry, finally shipping).\n' +
            '\n' +
            'The structure is three layers:\n' +
            '- <b>Copper heat pipes</b>: spread the heat from the SoC and battery regions laterally\n' +
            '- <b>Vapor chamber (VC)</b>: large-area temperature equalization, avoiding local hot spots\n' +
            '- <b>Graphene sheets</b>: sit directly above the heat source\n' +
            '\n' +
            'The significance goes beyond "it no longer gets hot in games". After a 2nm chip delivers +18% performance and +30% efficiency, <b>sustained performance is the new bottleneck</b> — everyone can hit peak numbers briefly; throttling under a long load is what separates the experience. Liquid cooling is the hardware precondition for actually delivering the A20 Pro\'s sustained performance.\n' +
            '\n' +
            'This is also one of the main sources of the increased body thickness.',
          stats: {
            '热管材质': 'Heat pipe material',
            '均热板': 'Vapor chamber',
            '均温层': 'Equalization layer',
            '代际意义': 'Generational significance',
          },
        },
      },
    },
    frame: {
      name: 'Stainless-steel mid-frame',
      group: 'Structure',
      hotspots: {
        frame: {
          title: 'Stainless-steel mid-frame · anodized',
          body:
            'The stainless-steel mid-frame carries over from the iPhone 17 Pro, with the <b>anodized aluminum surface treatment unchanged</b>.\n' +
            '\n' +
            'One deliberate change: the previous generation\'s two-tone design is dropped, and the back glass finish is updated with <b>a narrower color delta between the glass and the aluminum trim</b> — the device reads as more visually unified. The frame body moves from aluminum alloy back to stainless steel, mainly for thermal reasons: the thermal conductivity of steel is far higher than that of aluminum.\n' +
            '\n' +
            'The price is weight and cost, and Apple did receive feedback from iPhone 17 Pro users about paint chipping on the frame. This generation improves consistency with tighter color control, but it did not go back to aluminum.\n' +
            '\n' +
            'The antenna breaks have been re-laid out so that three radio systems coexist: 5G, Wi-Fi and satellite.',
          stats: {
            '材质': 'Material',
            '上代问题': 'Previous-gen issue',
            '本代改进': 'This-gen improvement',
            '配色': 'Colors',
          },
        },
      },
    },
    back: {
      name: 'Back glass',
      group: 'Exterior',
      hotspots: {
        magsafe: {
          title: 'MagSafe magnet ring',
          body:
            'The MagSafe magnet array stays in place; charging spec is 60W wired / 20W wireless (Pro Max).\n' +
            '\n' +
            'The black option is dropped this generation, and the lead color becomes <b>Dark Cherry (Pantone 6076)</b> — a burgundy red with a purple cast — alongside Light Blue (2121) and Silver (427C).\n' +
            '\n' +
            'One product decision here is worth noting: <b>the Ultra (the foldable) launches with only about two colors</b>. Apple deliberately avoided bold colors on the foldable, which suggests the process for this new form factor — particularly the coating at the crease — is not fully under control yet.',
          stats: {
            '有线充电': 'Wired charging',
            '无线充电': 'Wireless charging',
            '主配色': 'Lead color',
            'Ultra 配色': 'Ultra colors',
          },
        },
      },
    },
    rf: {
      name: 'Antenna / wireless charging module',
      group: 'RF',
      hotspots: {
        wireless: {
          title: 'Qi2 wireless charging + multi-antenna',
          body:
            'The coil array is the basis of MagSafe wireless charging, and the Pro Max supports ≤20W wireless.\n' +
            '\n' +
            'On the RF side: Pro / Pro Max still support <b>eSIM + physical SIM</b>, while the foldable Ultra is <b>eSIM only</b>. That follows directly from the thickness of the foldable body — a physical SIM tray needs roughly 1.5mm of extra thickness, which does not fit inside an 11mm fold.\n' +
            '\n' +
            'Eight sets of 5G / Wi-Fi / satellite antenna modules are distributed around the chassis, including dual-mode BeiDou / GPS. Satellite communications need dedicated space in the antenna layout, which is why the breaks in the mid-frame cannot simply be moved.',
          stats: {
            '无线充电': 'Wireless charging',
            'SIM': 'SIM',
            'SIM（Ultra）': 'SIM (Ultra)',
            '天线模组': 'Antenna modules',
          },
        },
      },
    },
  },
  steps: {
    's1-frame': {
      title: 'Power down, remove the two pentalobe screws at the bottom',
      body:
        'The first action of any teardown is to cut power. The two pentalobe screws at the bottom are a deliberate threshold set by Apple — a standard Phillips driver will strip them outright. Once the screws are out, do not go straight to prying: the display adhesive is still carrying load.',
      tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
      stats: {
        '螺丝': 'Screws',
        '第一步': 'First step',
      },
    },
    's2-cover': {
      title: 'Heat to soften the adhesive, then open a gap with a suction cup',
      body:
        'A ring of waterproof adhesive sits between the front screen and the mid-frame. Use a heating pad or heat gun to bring the edge up to the point where the adhesive softens, then pull a gap with a suction cup and slide a spudger in. Prying without enough heat snaps the OLED outright.',
      tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      stats: {
        '边框材料': 'Frame material',
        '前玻璃': 'Front glass',
      },
    },
    's3-display': {
      title: 'Disconnect the display flex, lift out the OLED assembly',
      body:
        'Once the gap is open, hinge the display up from the right side (the flex cables are on the right — do not peel the whole panel back). Disconnect the display flex before lifting the assembly away. The OLED is a folded multi-layer structure and any permanent crease leaves irreversible bright spots.',
      tools: ['Spudger / pry tool / suction cup', 'Anti-static tweezers'],
      stats: {
        '面板': 'Panel',
        '形态': 'Form factor',
      },
    },
    's4-battery': {
      title: 'Disconnect the battery flex, pull the battery out by its tab',
      body:
        'Disconnect the battery flex first, then pull the stretch-release tab under the battery to bring the cell out. Apple uses a tab rather than a pry bar specifically to avoid puncturing the lithium-polymer pouch — a puncture turns the cell into a fire source.',
      tools: ['Spudger / pry tool / suction cup'],
      stats: {
        '容量': 'Capacity',
        '类型': 'Type',
      },
    },
    's5-camera': {
      title: 'Remove the triple-camera module',
      body:
        'The three cameras share one metal base plate and come out as a unit. A metal barrel ring protects the cover glass around each lens — do not unscrew the lens elements individually during removal, because the module was optically aligned at the factory.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      stats: {
        '摄像头': 'Cameras',
        '主摄光圈': 'Main aperture',
      },
    },
    's6-cooling': {
      title: 'Peel up the liquid cooling sheets',
      body:
        'Graphite plus the vapor chamber spread the SoC\'s heat across the whole mid-frame. The sheets are adhesive-mounted and effectively unusable once peeled off, so they are single-use parts.',
      tools: ['Spudger / pry tool / suction cup', 'Heating pad / heat gun'],
      stats: {
        '形式': 'Form',
        '复用性': 'Reusability',
      },
    },
    's7-board': {
      title: 'Disconnect the flex cables, lift out the logic board',
      body:
        'The board is a large single-layer design, with the SoC and storage on the A side and RF and power stacked on the B side. Disconnect every flex cable, then lift the board out as a unit. WMCM side-by-side packaging cuts board thickness significantly.',
      tools: ['Anti-static tweezers', 'Spudger / pry tool / suction cup'],
      stats: {
        '平台': 'Platform',
        '封装工艺': 'Packaging process',
      },
    },
    's8-rf': {
      title: 'Remove the wireless charging coil and antennas',
      body:
        'The spiral copper coil, the NFC antenna and the antenna modules are bonded to the inside of the back cover. This layer is the easiest to overlook, but it directly determines MagSafe alignment and wireless charging efficiency.',
      tools: ['Spudger / pry tool / suction cup', 'Heating pad / heat gun'],
      stats: {
        '无线充': 'Wireless charging',
        '形式': 'Form',
      },
    },
    's9-back': {
      title: 'Heat and lift off the back glass',
      body:
        'The last step, and the one most dependent on adhesive: the back glass is also bonded around its perimeter with structural adhesive and has to be pried off slowly after heating. A removed back cover is essentially not reusable without damage.',
      tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      stats: {
        '后盖': 'Back cover',
        '拆后复用': 'Reuse after removal',
      },
    },
  },
};

export const iPhone18ProMetaEn: SubjectMetaEn = {
  name: 'iPhone 18 Pro',
  subtitle: 'Apple · September 2026',
  tagline: 'First 2nm chip, first variable aperture, first liquid cooling — the Pro that sets up the foldable',
};
