import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * SpaceX Starship V3 — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / stats / comparison rows,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must
 * keep the same length as the Chinese array, otherwise the merge step falls
 * back to Chinese wholesale.
 */
export const starshipV3En: SubjectEn = {
  name: 'SpaceX Starship V3',
  subtitle: 'SpaceX · First V3 flight, May 2026 · Flight 12',
  tagline: '124.4 m, 33 Raptor 3 engines, roughly 9240 tf of thrust — the highest payload capability flown to date',
  overview:
    'Starship V3 (Block 3) is SpaceX\'s most capable launch vehicle; the V3 configuration flew for the first time on 23 May 2026 (Flight 12). The full stack is <b>124.4 m</b> tall and 9 m in diameter, with a liftoff mass of roughly <b>5533 t</b>; 33 Raptor 3 engines ignite simultaneously for 8240 tf of liftoff thrust.\n' +
    '\n' +
    'SpaceX describes the V1 → V2 → V3 progression as changing "almost every part." Three core changes define V3: <b>full conversion to Raptor 3</b> (V2 fitted it only on some engines), the <b>hot-staging architecture</b> (no fairing to discard), and <b>grid fins reduced from 4 to 3</b>.\n' +
    '\n' +
    'A note on which numbers mean what: payload capability is quoted as 100 t, 150 t or 200 t depending on whether the configuration is reusable or expendable, and whether the figure is an early prediction or a measured result. The official figure is over 100 t fully reused; the expendable configuration is estimated at 180–200 t. V2 actually demonstrated roughly 35 t and did not reach orbit. Engine thrust also circulates as both 250 tf and 280 tf — early reporting such as SpaceNews used 250 tf, while later analyses such as New Space Economy used 280 tf; this model labels 250 tf.\n' +
    '\n' +
    '<b>Flight 12 first-flight result (2026-05-23)</b>: stage separation succeeded and the upper stage completed re-entry and splashdown, but <b>the booster relight after separation failed, so it was not soft-landed</b>; <b>one of the upper stage\'s six engines — a vacuum variant — shut down partway through ascent</b>, cancelling the planned fourth in-space engine test. This vehicle has still not reached orbit.\n' +
    '\n' +
    'Modeling note: this is a <b>parametric rebuild from SpaceX\'s published specifications plus Flight 12 photography</b>, not a reproduction of engineering drawings. Internal engine flow paths and the actual tile layout are structural placeholders. V3 dimensions follow the official figures: 124 m full stack, Super Heavy 72 m, Ship 52 m, 8240 tf liftoff thrust.',
  headline: {
    '全堆高度': 'Full stack height',
    'LEO 运力': 'LEO payload',
    '起飞推力': 'Liftoff thrust',
    '猛禽 3': 'Raptor 3',
  },
  specs: {
    '全堆高度': { label: 'Full stack height', value: '124.4 m (V2: 123.1 m)' },
    '直径': { label: 'Diameter', value: '9 m' },
    '助推器高度': { label: 'Booster height', value: '72 m (official)' },
    '起飞质量': { label: 'Liftoff mass', value: 'approx. 5533 t' },
    '发动机': { label: 'Engines', value: '33 × Raptor 3' },
    '单台海平面推力': { label: 'Sea-level thrust per engine', value: '250 tf (a figure of 280 tf also circulates)' },
    '单台真空推力': { label: 'Vacuum thrust per engine' },
    '33 台总推力（官网）': { label: 'Total thrust, 33 engines (official)', value: '8240 tf' },
    '猛禽 3 干质量': { label: 'Raptor 3 dry mass', value: '<1525 kg, thrust-to-weight >180' },
    '推进剂': { label: 'Propellant', value: 'LOX + liquid methane (Raptor oxidiser)' },
    'LEO 运力': { label: 'LEO payload', value: '100+ t (fully reused)' },
    '一次性构型': { label: 'Expendable configuration', value: 'approx. 180–200 t (estimate)' },
    '栅格翼': { label: 'Grid fins', value: '3 (V2: 4)' },
    'Ship 发动机': { label: 'Ship engines', value: '6 (3 sea-level + 3 vacuum)' },
    'Ship 推力': { label: 'Ship thrust', value: '1614 tf' },
    'Ship 推进剂': { label: 'Ship propellant', value: '1600 t' },
    '助推器推进剂': { label: 'Booster propellant', value: '3650 t' },
    '航电模块': { label: 'Avionics modules', value: '60 units · 9 MW peak' },
    '摄像头': { label: 'Cameras', value: 'approx. 50 · 480 Mbps Starlink downlink' },
    '对接口': { label: 'Docking ports', value: '4 on the leeward side' },
    '在轨飞行能力': { label: 'On-orbit endurance', value: '48 h (vacuum jacket + cryogenic management)' },
    '首飞': { label: 'First flight' },
    '发射场': { label: 'Launch site', value: 'Starbase Pad 2 (water-cooled flame trench)' },
  },
  narrative: [
    '<b>Why the core of V3 is mass reduction rather than added thrust</b>: the defining move in Raptor 3 is <b>removing the separate engine cover</b> — sensors and controllers are integrated inside the engine and covered directly by the engine\'s own thermal protection layer. On V2 that cover weighed about 1 t per engine, so 33 engines meant 33 t.\n' +
      '\n' +
      'For a rocket, dry mass is dead mass. Saving 33 t converts entirely into payload capability. Over the same period dry mass was also optimised from 120 t to 105 t. Added together, these changes are the physical source of the jump in payload capability "from the 35 t class on V2 to the 100 t class".',
    '<b>Hot staging changes the economics of what comes back</b>: conventional stage separation means throwing away a fairing — one expensive large item. V3 exposes the forward dome of the booster\'s propellant tanks directly to the exhaust, protecting it with a <b>non-structural steel shield layer plus the propellant pressure inside the tank</b>.\n' +
      '\n' +
      'The result is that a recovered booster no longer carries with it a large item that must be discarded. The effect on high-cadence reuse is more direct than the mass saving itself.',
    '<b>How the landing propellant gets to the engines is the most underrated change of this generation</b>: the <b>header tank</b> that the first stage had carried for three years is removed and replaced with a single <b>oversized tunnel duct</b>, whose diameter is <b>larger than SpaceX\'s own Falcon 9 first stage</b>.\n' +
      '\n' +
      'The header tank exists to store dedicated landing propellant — in the large main tanks the propellant drifts in weightlessness and cannot be fed to the engines reliably. That system caused repeated problems in the V2 era and directly caused recovery failures. Replacing it with a tunnel duct is meant to fix feed reliability at the root. Flight 12\'s performance suggests the approach <b>may still need further work</b>.',
    '<b>Getting 33 engines to light at once is the real engineering problem</b>: to support all 33 Raptor 3 igniting simultaneously on the full stack, V3 enlarged the propellant feed line to near Falcon 9 first-stage diameter and redesigned the quick-disconnect interface at the base to speed up ground turnaround.\n' +
      '\n' +
      'The ground side upgrades in step: Pad 2 uses a <b>water-cooled flame trench</b> (replacing concrete plus water spray), all 20 hold-down arms carry blast doors, and the tower "chopsticks" moved from hydraulic to electromechanical actuation. SpaceX\'s stated target is <b>25 launches per year from Starbase</b> — and that, not mass savings, is where the real bottleneck on high-cadence reuse lies.',
  ],
  comparison: {
    title: 'Starship V3 vs V2',
    note: 'Compiled from SpaceX disclosures and public technical analysis',
    rows: {
      '高度': { prev: '123.1 m', curr: '124.4 m' },
      '发动机': { prev: '33 × Raptor 2 (partial retrofit)', curr: '33 × Raptor 3 (full retrofit)' },
      '单台海平面推力': { prev: '230 tf', curr: '250 tf' },
      '猛禽干质量': { prev: '1630 kg', curr: '1525 kg' },
      '栅格翼': { prev: '4', curr: '3 (+50% area each)' },
      '级间分离': { prev: 'Hot staging (first on V2)', curr: 'Hot-staging architecture (no fairing)' },
      '收集管路': { prev: 'Standard', curr: 'Enlarged to near Falcon 9 first-stage scale' },
      'LEO 运力（复用）': { prev: 'approx. 35 t (never reached orbit)', curr: '100+ t' },
      '上面级回收': { prev: 'No plan', curr: 'Catch hardpoints provisioned' },
      '塔架作动': { prev: 'Hydraulic', curr: 'Electromechanical' },
      '干重': { prev: 'approx. 120 t', curr: 'approx. 105 t' },
      '目标发射频次': { prev: '—', curr: '25 per year from Starbase' },
    },
  },
  fidelity: {
    source:
      '33 Raptor 3 engines (200+ parts each, over 6600 parts across the vehicle\'s engine section); about 18000 heat-shield tiles; 3 grid fins; 4 flaps each at fore and aft',
    note:
      'Official SpaceX configuration: 33 Raptor 3 on Super Heavy plus 6 on the Ship (3 sea-level + 3 vacuum), all 39 modelled individually, each including the main parts — thrust chamber, nozzle, turbopump, intake. That portion is comparatively high fidelity. The real vehicle carries over 6600 engine parts (200+ per Raptor); the internals of a single engine are not broken out here. The 18000 heat-shield tiles are indicated schematically by a tile array (26 columns × 7 rows = 182 tiles) rather than generated at the true count.',
  },
  layers: {
    shield: {
      name: 'Ship thermal protection tiles (TPS)',
      group: 'Thermal protection',
      hotspots: {
        tps: {
          title: 'Third-generation thermal protection tiles',
          body:
            'Re-entry is <b>the most dangerous phase</b> of the entire Starship mission profile — this layer decides whether the vehicle survives to splash down.\n' +
            '\n' +
            'V3 continues the TPS work started on Flight 11: the tile backing introduces a felt-like underlayer named <b>"crunch wrap"</b> ("crunch cloth"). Its purpose is to let a tile break up in a controlled way during ablation, releasing deformation in the backing so that stress does not concentrate and tear the whole tile apart.\n' +
            '\n' +
            'Engineering practice: on every flight SpaceX <b>removes a small sample of tiles from the highest heat-flux regions</b> for destructive probing, to establish how much structural margin is left. This is a typical trade of measured data for design margin.\n' +
            '\n' +
            'Re-entry maneuver: a controlled dynamic bank, then a belly-down flip into the landing burn. The tiles have to absorb deceleration dynamic pressure on the order of one seventh of Earth sea-level weight.',
          stats: {
            '瓦片总数（V2 量级）': 'Total tile count (V2 order)',
            '新增': 'New',
            '材料': 'Material',
            '再入方式': 'Re-entry method',
          },
        },
      },
    },
    ship: {
      name: 'Ship upper stage',
      group: 'Airframe',
      hotspots: {
        commonDome: {
          title: 'The relocated common dome',
          body:
            'One V3 change is easy to miss but has a large effect: both the <b>common dome</b> (the shared bulkhead between the LOX and liquid methane tanks) and the <b>aft dome</b> were moved down.\n' +
            '\n' +
            'Lowering the common dome = <b>a larger methane tank volume</b>. Position sets how much fuel fits; fuel sets Δv; Δv decides whether the payload reaches orbit.\n' +
            '\n' +
            'The Ship\'s payload bay was already cut back once in the V2 era (to make room for propellant), and V3 continues that trade — payload volume shrinks further while total propellant load far exceeds V2\'s roughly 1500 t.\n' +
            '\n' +
            'Keep this causal chain in mind: <b>dome position → methane tank volume → how much fuel fits → how far you can reach</b>.',
          stats: {
            '共用穹顶': 'Common dome',
            '尾部穹顶': 'Aft dome',
            'Ship 干重（早期口径）': 'Ship dry mass (early figure)',
            '推进剂': 'Propellant',
          },
        },
        dock: {
          title: 'Docking adapter · in-orbit propellant transfer port',
          body:
            'V3 adds an <b>external docking adapter</b> and a quick-disconnect interface. The reason this layer exists is <b>in-orbit propellant transfer</b>.\n' +
            '\n' +
            'This is the keystone of the entire Starship architecture. Why transfer is needed: a single launch to orbit can only deliver a limited payload, and putting enough mass onto the Moon or Mars requires the spacecraft to "refuel" in orbit. Transfer in turn requires two vehicles to dock in orbit and move propellant between them.\n' +
            '\n' +
            'The Flight 12 (Ship 39) mission list states this explicitly: validate the docking port and quick-disconnect hardware, paving the way for the propellant-transfer demonstration NASA requires. But note — <b>this was not a transfer test</b>; there was no second Starship in orbit at the time. The goal of that flight was only to prove the hardware survives launch, operates in vacuum and returns data, clearing the path for a later transfer demonstration.\n' +
            '\n' +
            'NASA\'s Artemis lunar architecture depends entirely on this capability.',
          stats: {
            'V3 新增': 'New in V3',
            '快断接口': 'Quick-disconnect interface',
            'Flight 12 目标': 'Flight 12 objective',
            '最终目的': 'End goal',
          },
        },
      },
    },
    booster: {
      name: 'Super Heavy booster',
      group: 'Airframe',
      hotspots: {
        gridfin: {
          title: 'Grid fins: 4 → 3',
          body:
            'The most recognisable external change on V3: <b>grid fins reduced from 4 to 3, with 50% more area per fin</b>.\n' +
            '\n' +
            'It looks like simplification, but it is three requirements stacked together:\n' +
            '- <b>Lower mass</b>: one fewer fin means one fewer set of hinges, drives and actuators\n' +
            '- <b>Higher strength</b>: each fin is larger and stiffer so it can absorb the high overloads imposed when the tower "chopsticks" catch it\n' +
            '- <b>Less erosion</b>: with the mounting position changed, Ship engine exhaust no longer impinges directly on the grid fins during stage separation\n' +
            '\n' +
            'The third point is the critical one — on the previous generation V2, at the instant of separation, exhaust from the ship-side Raptors heavily ablated the leading edges of the grid fins. One fewer fin plus a relocated position amounts to deleting a structural damage source from the design.\n' +
            '\n' +
            '<b>Two further changes, both corroborated by published flight imagery</b>:\n' +
            '- <b>The actuation was changed from externally mounted to fully enclosed</b>, no longer standing proud of the rocket\'s surface, with the mounting position lowered accordingly\n' +
            '- <b>The recovery catch point is machined directly into the grid fin, integral with the fin structure</b> — not an add-on protrusion but the same structural member. V3 integrates the booster recovery catch point into the grid fin, which makes the structure simpler and stronger\n' +
            '\n' +
            'This is the first time SpaceX has structurally provisioned the booster for "being caught by the tower", and it did so by integrating the feature rather than bolting it on.',
          stats: {
            '数量': 'Count',
            '单片面积': 'Area per fin',
            '新增机构': 'New mechanism',
            '解决的老问题': 'Old problem solved',
          },
        },
        downcomer: {
          title: 'Enlarged propellant downcomer',
          body:
            'This is the feed line between the propellant tanks and the engines; in V3 its <b>diameter is substantially larger, approaching the scale of a Falcon 9 first stage</b>.\n' +
            '\n' +
            'Why it must be thicker: it has to deliver liquid methane to 33 Raptor 3 engines igniting simultaneously within seconds. Pipe diameter is flow rate.\n' +
            '\n' +
            'That directly drives two numbers:\n' +
            '- It supports <b>33 engines starting at the same time</b> (all 33 in V3 are Raptor 3; V2 used them on some units only)\n' +
            '- It supports <b>faster ground propellant-load turnaround</b>, and together with the quick-disconnect interface integrated at the base, the goal is to bring the interval between two launches down from a multi-day figure\n' +
            '\n' +
            'The ground facilities are being upgraded in step: the new fuel farm at Pad 2 adds storage and raises pump speed, all 20 hold-down arms get blast doors, and hydraulic actuation is replaced by electromechanical. SpaceX\'s target is <b>25 launches per year from Starbase</b>.',
          stats: {
            '管径': 'Pipe diameter',
            '服务对象': 'Serves',
            '快断接口': 'Quick-disconnect interface',
            '配套': 'Supporting works',
          },
        },
      },
    },
    raptor: {
      name: 'Raptor 3 engines ×33',
      group: 'Propulsion',
      hotspots: {
        raptor3: {
          title: 'Raptor 3 · 1 t lighter per engine',
          body:
            'Raptor 3 is the basis of every V3 upgrade. With 33 igniting simultaneously, <b>liftoff thrust is 8240 tf</b> — more than any rocket in history, about 2.3 times SLS and nearly 3 times the Saturn V.\n' +
            '\n' +
            'Thrust increase:\n' +
            '| | Raptor 2 | Raptor 3 | Increase |\n' +
            '|---|---|---|---|\n' +
            '| Sea-level thrust | 230 tf | 250 tf (some figures 280 tf) | +8.7% |\n' +
            '| Vacuum thrust | 258 tf | 275 tf | +6.6% |\n' +
            '| Dry mass | 1630 kg | <b>1525 kg</b> | -105 kg |\n' +
            '| Thrust-to-weight | — | <b>>180</b> | — |\n' +
            '\n' +
            'The key design decision is <b>removing the separate engine cover</b>: sensors and controllers are integrated inside the engine and covered directly by the engine\'s own thermal protection layer. The V2 cover weighed about 1 t per engine, so 33 engines meant 33 t.\n' +
            '\n' +
            'Combined with internalised secondary flow paths and additive manufacturing, the external structure is greatly simplified. SpaceX puts the manufacturing cost at roughly a quarter of Raptor 1, about USD 500,000 per engine (20 per month).\n' +
            '\n' +
            'There is also an easily overlooked trade: <b>V3\'s payload capability was "raised" from 100–150 t to LEO to 200+ t, and that claim has been questioned</b> — one explanation is that V2\'s payload capability was overstated. Either way, a number like this "improvement" has to be read together with the change in dry mass.',
          stats: {
            '单台海平面推力': 'Sea-level thrust per engine',
            '单台真空推力': 'Vacuum thrust per engine',
            '33 台总推力': 'Total thrust, 33 engines',
            '干质量': 'Dry mass',
            '推重比': 'Thrust-to-weight',
            '关键改进': 'Key improvement',
            '制造成本': 'Manufacturing cost',
          },
        },
      },
    },
    shipengines: {
      name: 'Ship engines ×6 (3 sea-level + 3 vacuum)',
      group: 'Propulsion',
      hotspots: {
        shipengines: {
          title: 'Six Ship engines · 1614 tf',
          body:
            'This is the layer that is easy to miss: <b>the Ship upper stage has 6 engines of its own</b>, not just the 33 on Super Heavy.\n' +
            '\n' +
            'Configuration (SpaceX official): <b>3 sea-level Raptors + 3 vacuum-optimised Raptor Vacuum units</b>, totalling <b>1614 tf (3.5 Mlbf)</b>. The layout is 3 in the centre plus 3 vacuum units on the outer ring.\n' +
            '\n' +
            '<b>Why vacuum variants?</b> In space the ambient pressure is extremely low, and a sea-level nozzle is very inefficient in vacuum. The RVac uses a large bell extension — in the model the outer 3 nozzles are visibly larger and longer — to match the vacuum environment. This is the most direct visual difference from the 33 sea-level engines on the booster.\n' +
            '\n' +
            '<b>Actual Flight 12 first-flight result</b>: of the 6 engines, <b>one vacuum Raptor 3 shut down partway through the ascent phase</b>. The remaining 5 compensated for the thrust loss by extending their burn and still placed the Ship on the intended trajectory. This also caused the planned fourth in-space engine test to be cancelled.\n' +
            '\n' +
            'V3 removes the engine bay — what is left is a bare thrust disk plus a ring of sealing panels. SpaceX describes this as uprooting the problem: the heat-dissipation and fire-suppression problems of the old engine bay disappear together with the bay itself.',
          stats: {
            '发动机总数': 'Total engines',
            '合计推力': 'Combined thrust',
            '配置': 'Configuration',
            'V3 变化': 'V3 change',
            'Flight 12': 'Flight 12',
          },
        },
      },
    },
    hotstage: {
      name: 'Hot-staging (HOT-STAGING) structure',
      group: 'Staging',
      hotspots: {
        hotstage: {
          title: 'Hot staging: the fairing you no longer throw away',
          body:
            'This is the cheapest design in V3.\n' +
            '\n' +
            'Conventional stage separation needs a fairing: the <b>fairing</b> at the top of the booster has to be discarded along with it. But conventional fairings are one-shot aluminium or composite structures — heavy and completely unrecoverable.\n' +
            '\n' +
            'The V3 approach: <b>expose the forward dome of the booster\'s propellant tank directly to the ignition environment of the Ship engines</b>.\n' +
            '\n' +
            'What protects it?\n' +
            '1. A <b>non-structural steel shield layer</b> outside the forward dome (it carries no load)\n' +
            '2. <b>The pressure of the propellant inside the tank</b> — liquids are incompressible, so the propellant itself is the best pressure barrier\n' +
            '\n' +
            'So "throwing away a fairing" becomes "throwing away a thin steel skin". That is not only a mass saving; it <b>changes the value structure of what is recovered</b> — the recovered booster no longer carries a large, expensive item that must be discarded.\n' +
            '\n' +
            'Hot staging on V2 (first achieved on Flight 3) already demonstrated that this path works; V3 scales it up.',
          stats: {
            '替代物': 'Replacement',
            '防护原理': 'Protection principle',
            '收益': 'Benefit',
            '首次验证': 'First demonstrated',
          },
        },
      },
    },
  },
  steps: {
    's1-shield': {
      title: 'Replace thermal protection tiles',
      body:
        'The heaviest field operation before re-entry: inspect the hexagonal TPS tiles one by one and replace every one that has lost adhesion, cracked or burned through. Beneath the tiles is the stainless steel shell, so a failed tile means the shell itself faces re-entry heating on the order of 1400 °C.',
      tools: ['Heating pad / heat gun', 'X-ray NDT'],
      stats: {
        '瓦形状': 'Tile shape',
        '贴装方式': 'Attachment method',
      },
    },
    's2-hotstage': {
      title: 'Release the hot-staging ring',
      body:
        'Starship does not use conventional cold separation with an interstage. Instead the booster engines keep firing through the instant of separation and push the Ship away with thrust — that is hot staging. It removes an entire interstage structure; the price is that the separation ring has to carry extreme loads.',
      tools: ['Torque wrench', 'X-ray NDT'],
      stats: {
        '分离方式': 'Separation method',
        '省去': 'Eliminates',
      },
    },
    's3-booster': {
      title: 'Super Heavy booster separation and recovery',
      body:
        'Once all 33 Raptors have shut down, the booster separates from the Ship and returns to the launch site on its own. The grid fins provide aerodynamic control during re-entry, and the landing legs deploy in the final phase — this whole recovery sequence is the core of what keeps the cost per launch down.',
      tools: ['Engine hoist', 'Torque wrench'],
      stats: {
        '助推器发动机': 'Booster engines',
        '栅格舵': 'Grid fins',
      },
    },
    's4-raptor': {
      title: 'Field replacement of a Raptor 3',
      body:
        'Raptor 3 integrates a large amount of piping and actuation into the engine body itself, which shortens field replacement time substantially. With 33 engines, a single-engine failure means replacing one unit, not returning the whole vehicle to the factory.',
      tools: ['Engine hoist', 'Anti-static tweezers'],
      stats: {
        '推进剂': 'Propellant',
        '燃烧循环': 'Combustion cycle',
      },
    },
    's5-shipengines': {
      title: 'Remove and install the six Ship engines',
      body:
        'Three sea-level and three vacuum Raptors on the Ship. The vacuum version has a far larger nozzle area ratio and uses evaporation cooling directly in re-entry, so it needs no separate cooling jacket.',
      tools: ['Engine hoist', 'X-ray NDT'],
      stats: {
        '数量': 'Count',
        '构型': 'Configuration',
      },
    },
    's6-ship': {
      title: 'Ship upper stage inspection and reflight',
      body:
        'Last is structural inspection of the upper stage itself: the header tunnel duct, nose cone, payload bay and flaps. Damaged stainless steel shell sections can be weld-repaired in the field, which is the most counterintuitive yet most practically useful advantage it has over a carbon-fibre airframe.',
      tools: ['Spudger / pry tool / suction cup', 'Torque wrench'],
      stats: {
        '箭体材料': 'Airframe material',
        '头部容积': 'Forward compartment volume',
      },
    },
  },
};

export const starshipV3MetaEn: SubjectMetaEn = {
  name: 'SpaceX Starship V3',
  subtitle: 'SpaceX · First V3 flight, May 2026 · Flight 12',
  tagline: '124.4 m, 33 Raptor 3 engines, roughly 9240 tf of thrust — the highest payload capability flown to date',
};