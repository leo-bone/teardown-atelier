import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * F-35A Lightning II — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / stats / comparison rows,
 * ASCII ids for layers, hotspots and steps. Narrative is index-aligned and must
 * keep the same length as the Chinese array (4 paragraphs), otherwise the merge
 * step falls back to Chinese wholesale.
 *
 * Numbers, units and designations are carried across verbatim: F135,
 * F135-PW-100, AN/APG-81, AN/ASQ-239, EOTS, DAS, Gen III HMDS, AIM-120, AIM-9X,
 * JDAM, GAU-22/A, ACES 5, MBSU, ALIS/ODIN, Mach 1.0 / 1.6, RCS, STOVL,
 * CTOL, 0.001 m², lbf, kN, km, kg.
 *
 * Honest framing is preserved: the airframe is a parametric rebuild from
 * published specifications, not a physical scan or a drawing-exact
 * reproduction. Inferred or structurally schematic content is labelled as
 * structural placeholder rather than presented as measured data.
 */
export const f35LightningIIEn: SubjectEn = {
  name: 'F-35A Lightning II',
  subtitle: 'Lockheed Martin · In service since 2015 · Fifth-generation stealth multirole',
  tagline:
    'Single engine, 191 kN afterburner, Mach 1.6, RCS 0.001 m² — the Western bloc\'s mainstay fifth-generation fighter',
  overview:
    'F-35A Lightning II is Lockheed Martin\'s <b>fifth-generation stealth multirole fighter</b>, in service since 2015 and the principal Western combat aircraft of the 21st century, with more than 3,400 aircraft on order worldwide.\n' +
    '\n' +
    'Length <b>15.7 m</b>, wingspan 10.7 m (13.1 m on the carrier-based C), empty weight 13,300 kg, unit cost roughly <b>USD 82.5 million</b> (Lot 18).\n' +
    '\n' +
    'The entire aircraft is driven by <b>one</b> Pratt & Whitney F135 turbofan: 124 kN military thrust, 191 kN with afterburner (43,000 lbf), Mach 1.6 (roughly 1,930 km/h), 1,240 km combat radius, 15,240 m service ceiling.\n' +
    '\n' +
    'The core of the fifth generation is not speed but <b>stealth plus sensor fusion</b>: RCS of approximately 0.001 m², working with the AN/APG-81 AESA radar, the AN/ASQ-239 electronic warfare suite, EOTS electro-optical targeting, DAS distributed apertures and the Gen III HMDS helmet to fuse multiple data sources into one unified situational picture.\n' +
    '\n' +
    'Three variants: A conventional takeoff and landing (CTOL), B short takeoff / vertical landing with a lift fan (STOVL), C carrier-based with larger folding wings. Two internal weapon bays preserve the stealth signature; beast mode trades stealth for firepower on six external hardpoints.\n' +
    '\n' +
    'Modeling note: a <b>parametric rebuild from published technical specifications</b>, not a reproduction of engineering drawings. Airframe and subsystem layout are structural schematics; dimensions and parameters follow Lockheed Martin official Fast Facts and public sources.',
  headline: {
    '机长': 'Length',
    '加力推力': 'Afterburner thrust',
    '极速': 'Max speed',
    '作战半径': 'Combat radius',
  },
  specs: {
    '类型': { label: 'Type', value: 'Fifth-generation stealth multirole fighter' },
    '制造商': { label: 'Manufacturer', value: 'Lockheed Martin (with Northrop Grumman, BAE and Pratt & Whitney)' },
    '首飞': { label: 'First flight', value: '2006-12-15' },
    '服役': { label: 'In service', value: '2015 (B) / 2016 (A)' },
    '机长': { label: 'Length', value: '15.7 m (C 15.5 m)' },
    '翼展': { label: 'Wingspan', value: '10.7 m (C 13.1 m, folding)' },
    '机高': { label: 'Height', value: '4.38 m (C 4.48 m)' },
    '翼面积': { label: 'Wing area', value: '42.7 m² (C 62.1 m²)' },
    '空重': { label: 'Empty weight', value: '13,300 kg (A)' },
    '最大起飞重量': { label: 'Maximum take-off weight', value: '31,800 kg (70,000 lb)' },
    '发动机': { label: 'Engine', value: '1 × Pratt & Whitney F135-PW-100' },
    '军推': { label: 'Military thrust', value: '28,000 lbf (124 kN)' },
    '加力推力': { label: 'Afterburner thrust', value: '43,000 lbf (191 kN)' },
    '极速': { label: 'Max speed', value: 'Mach 1.6 (~1,930 km/h)' },
    '巡航速度': { label: 'Cruise speed', value: 'Mach 1.0 (limited supercruise)' },
    '作战半径': { label: 'Combat radius', value: '1,240 km (internal fuel)' },
    '航程': { label: 'Ferry range', value: '>2,220 km' },
    '升限': { label: 'Service ceiling', value: '15,240 m' },
    '雷达': { label: 'Radar', value: 'AN/APG-81 AESA' },
    '电子战': { label: 'Electronic warfare', value: 'AN/ASQ-239' },
    '光电': { label: 'Electro-optics', value: 'EOTS + DAS (6 apertures, 360°)' },
    '显示': { label: 'Display', value: 'Gen III HMDS helmet (no HUD)' },
    '内置弹舱': { label: 'Internal weapon bays', value: '2 ventral bays' },
    '机炮': { label: 'Cannon', value: 'GAU-22/A 25mm (internal)' },
    '外置硬点': { label: 'External hardpoints', value: '6 (beast mode)' },
    '隐身 RCS': { label: 'Stealth RCS', value: '~0.001 m²' },
    '单机成本': { label: 'Unit cost', value: 'approx. USD 82.5 million (Lot 18)' },
    '订单总量': { label: 'Total orders', value: 'more than 3,400 aircraft worldwide' },
  },
  narrative: [
    '<b>Stealth is not "invisible", it is "detected a little later"</b>: the F-35\'s RCS of roughly 0.001 m² is comparable to a bird. This is not achieved by some magical material but by three things stacked together — all fuselage edges aligned parallel or perpendicular so returns are deflected in a predetermined direction, a RAM coating that absorbs the remaining energy, and weapons buried internally to keep the external shape clean. The cost is very expensive maintenance: once the coating is scratched, the aircraft has to return to the factory for repair with dedicated equipment.\n' +
      '\n' +
      'The high-bypass ratio brings fuel efficiency and range; the afterburner section uses a convergent-divergent nozzle to preserve performance at high speed. The single-engine arrangement saves weight and complexity, but it also makes the engine the single most critical point of failure on the aircraft.',
    '<b>The trade of one engine against two</b>: the F-35 has only one F135. A high bypass ratio brings fuel efficiency and range, and the single-point failure risk is accepted in exchange for lower weight and lower complexity. The F135 is also the highest-thrust military turbofan in production service today — one engine does the work of two.\n' +
      '\n' +
      'Put differently: the intake, the fan and the core are sized for one airframe, and everything downstream — the bays, the centreline, the structural load paths — is arranged around that single shaft.',
    '<b>Sensor fusion is the soul of the fifth generation</b>: radar, infrared and electronic warfare data are fused into a single picture inside the aircraft, and the pilot "sees through" the airframe by way of the helmet. The traditional head-up display is cancelled because the helmet already overlays the information directly onto the field of view. This is the most fundamental generational gap between the F-35 and fourth-generation fighters.\n' +
      '\n' +
      'Concretely, a single APG-81 track, an EOTS cue and a DAS detection are presented to the pilot as one merged situation rather than three separate sensor pictures, and the pilot decides which source to trust without ever leaving the helmet picture.',
    '<b>The eternal trade between stealth and firepower</b>: the internal bays keep the F-35 stealthy but limit the internal load; the external pylons of beast mode multiply firepower several times over but expose the RCS. The design therefore sits permanently between the two, which is also why the aircraft is so often compared with fourth-and-a-half-generation fighters on hardpoint count — although they do not operate on the same stealth dimension.',
  ],
  comparison: {
    title: 'F-35A / B / C — three-variant comparison',
    note: 'Compiled from Lockheed Martin official Fast Facts',
    rows: {
      '机长': { prev: 'A 15.7 m', curr: 'C 15.5 m (folding wings)' },
      '翼展': { prev: 'A/B 10.7 m', curr: 'C 13.1 m' },
      '空重': { prev: 'A 13,300 kg', curr: 'B 14,700 kg (lift fan)' },
      '起降': { prev: 'A conventional', curr: 'B short takeoff / vertical (STOVL)' },
      '作战半径': { prev: 'A >1,093 km', curr: 'C >1,100 km' },
      '发动机': { prev: 'A/C F135-100/400', curr: 'B F135-600 + lift system' },
    },
  },
  repairability: {
    difficulty: 'Extremely difficult',
    tools: [
      'Dedicated RAM coating repair equipment (RAM touch-up)',
      'Internal bay door calibration fixture',
      'HMDS helmet calibration station',
      'ALIS/ODIN support information system',
      'AESA module-level replacement equipment',
    ],
    note:
      'Engineering assessment: the stealth coating, the internal weapon bays and the highly integrated avionics make maintenance extremely complex, and the aircraft depends heavily on a dedicated support chain.',
  },
  fidelity: {
    source:
      'Over 300,000 parts in the complete aircraft; more than 1,000 parts in a single F135; hundreds to thousands of T/R modules in the AESA radar.',
    note:
      'Parametric rebuild from published technical specifications, not a reproduction of engineering drawings. Airframe and subsystem layout are structural schematics; dimensions and parameters follow Lockheed Martin official Fast Facts and public sources.',
  },
  layers: {
    fuselage: {
      name: 'Fuselage / aerodynamic and stealth shaping',
      group: 'Structure',
      hotspots: {
        chine: {
          title: 'Stealth chine',
          body:
            'Those two sharp folds running along both sides of the F-35 fuselage are the <b>stealth shaping language</b> the aircraft shares with the F-22.\n' +
            '\n' +
            'Their function is to deflect radar returns generated on the fuselage sides in a predetermined direction, rather than sending them straight back at the radar.\n' +
            '\n' +
            'Combined with edge alignment (all major edges mutually parallel or perpendicular), this holds the whole-aircraft RCS down to about <b>0.001 m²</b> — close to the reflectivity of a bird.\n' +
            '\n' +
            'This is also why the F-35 looks angular rather than rounded: stealth takes priority over aerodynamic smoothness.',
          stats: {
            'RCS（整机）': 'RCS (whole aircraft)',
            '隐身手法': 'Stealth technique',
            '涂层': 'Coating',
          },
        },
      },
    },
    canopy: {
      name: 'Canopy (bubble type)',
      group: 'Cockpit',
      hotspots: {
        canopy: {
          title: 'Bubble canopy + Gen III HMDS',
          body:
            'The F-35 cockpit carries almost no conventional instruments — information is handled entirely by the <b>Gen III Helmet Mounted Display System (HMDS)</b>.\n' +
            '\n' +
            'The helmet overlays imagery from the APG-81 radar, EOTS and DAS directly onto the pilot\'s field of view, and can even "see through" the airframe (synthesised from the infrared imagery of the DAS apertures around the fuselage).\n' +
            '\n' +
            'This means the pilot sees targets below the aircraft simply by turning his head, and the traditional head-up display (HUD) has been eliminated entirely.',
          stats: {
            '显示': 'Display',
            '传统 HUD': 'Conventional HUD',
            '态势感知': 'Situational awareness',
          },
        },
      },
    },
    avionics: {
      name: 'Avionics and sensors (the fifth-generation brain)',
      group: 'Avionics',
      hotspots: {
        apg81: {
          title: 'AN/APG-81 AESA radar',
          body:
            'Inside the nose sits an <b>active electronically scanned array (AESA)</b> radar, built from hundreds to thousands of independent T/R transmit-receive modules (indicated schematically as an array of cells in the model).\n' +
            '\n' +
            'An AESA can do several things at once: search and track while simultaneously performing ground mapping and electronic countermeasures — and it is very difficult to intercept or jam.\n' +
            '\n' +
            'It is the hardware cornerstone of the F-35\'s "sensor fusion": radar, electro-optical and electronic warfare data are fused inside the aircraft into one unified situational picture.',
          stats: {
            '型号': 'Designation',
            '体制': 'Operating mode',
            '角色': 'Role',
          },
        },
        eots: {
          title: 'EOTS electro-optical targeting system',
          body:
            'The gem-shaped window under the nose is <b>EOTS (Electro-Optical Targeting System)</b> — a built-in forward-looking infrared and laser targeting system.\n' +
            '\n' +
            'It detects, identifies and laser-designates targets passively, radiating nothing at any point in the engagement, so the stealth posture is never broken.\n' +
            '\n' +
            'This is one of the key sensors that lets the F-35 complete a targeting solution without operating its radar.',
          stats: {
            '系统': 'System',
            '能力': 'Capability',
            '隐身': 'Stealth',
          },
        },
        das: {
          title: 'DAS distributed aperture system',
          body:
            'The <b>DAS (Distributed Aperture System)</b> consists of 6 infrared sensors distributed around the fuselage and provides <b>omnidirectional 360° infrared situational awareness</b>.\n' +
            '\n' +
            'Missile approach warning, night vision and ground tracking all depend on it. Together with the HMDS, the pilot gains a spherical field of view that "sees through" the airframe — one of the defining experiences that separates the F-35 from fourth-generation fighters.',
          stats: {
            '传感器': 'Sensors',
            '覆盖': 'Coverage',
            '能力': 'Capability',
          },
        },
      },
    },
    engine: {
      name: 'F135 engine (single afterburning turbofan)',
      group: 'Propulsion',
      hotspots: {
        f135: {
          title: 'Pratt & Whitney F135 — the most powerful military turbofan ever produced',
          body:
            'The F-35 is propelled by <b>a single</b> Pratt & Whitney F135 — the highest-thrust military turbofan in production service today.\n' +
            '<table>\n' +
            '<tr><td>Military thrust (no afterburner)</td><td>28,000 lbf / 124 kN</td></tr>\n' +
            '<tr><td>Afterburner thrust</td><td>43,000 lbf / 191 kN</td></tr>\n' +
            '<tr><td>Thrust-to-weight</td><td>~10 (whole aircraft)</td></tr>\n' +
            '</table>\n' +
            'The high bypass ratio delivers fuel efficiency and range; the afterburner section uses a convergent-divergent nozzle to preserve performance at high speed. The single-engine layout saves weight and reduces complexity, but it also makes the engine the single most critical point of failure on the aircraft.',
          stats: {
            '军推': 'Military thrust',
            '加力': 'Afterburner',
            '数量': 'Quantity',
            '极速': 'Max speed',
          },
        },
      },
    },
    bays: {
      name: 'Internal weapon bays (2 × bays)',
      group: 'Weapons',
      hotspots: {
        bays: {
          title: 'Internal weapon bays: the price of stealth and the trade it buys',
          body:
            'The F-35 stows its weapons in <b>two internal ventral bays</b>, leaving the external shape clean — a precondition for maintaining stealth.\n' +
            '\n' +
            'The price is a limited internal load: a typical F-35A carries 2 × AIM-120 medium-range missiles plus 2 × 908 kg-class JDAM, or 4 × AIM-120.\n' +
            '\n' +
            '<b>Stealth mode vs beast mode</b>: beast mode, with the external pylons fully loaded, multiplies firepower several times over but drives the RCS sharply upward and gives up stealth entirely. This is a trade-off common to all fifth-generation fighters.',
          stats: {
            '弹舱': 'Bays',
            '典型内置': 'Typical internal load',
            '机炮': 'Cannon',
            '外置': 'External',
          },
        },
      },
    },
    wings: {
      name: 'Main wings (trapezoidal, swept)',
      group: 'Aerodynamics',
      hotspots: {
        wing: {
          title: 'Moderately swept trapezoidal wing',
          body:
            'The F-35 has a wingspan of 10.7 m (the carrier-based F-35C increases this to 13.1 m with folding wings) and uses a moderately swept trapezoidal wing.\n' +
            '\n' +
            'Fuel tanks and part of the flaperon actuation are integrated inside the wing as well. The larger wing area of the F-35C buys a lower approach speed for carrier landings — the most significant wing difference between the three variants.',
          stats: {
            '翼展（A）': 'Wingspan (A)',
            '翼展（C）': 'Wingspan (C)',
            '翼面积（A）': 'Wing area (A)',
          },
        },
      },
    },
    gear: {
      name: 'Landing gear (nose wheel + 2 main wheels)',
      group: 'Structure',
      hotspots: {
        gear: {
          title: 'Tricycle landing gear',
          body:
            'The F-35A uses a tricycle landing gear arrangement. It is shown extended here for clarity — when stowed it retracts completely into the fuselage / wing root, preserving the stealthy external shape.\n' +
            '\n' +
            'The F-35B (STOVL variant) adds a lift fan and vectoring nozzles on top of this, giving it the most complex structure and the highest empty weight (32,300 kg).',
          stats: {
            '布局': 'Layout',
            'F-35B': 'F-35B',
            '空重（A）': 'Empty weight (A)',
          },
        },
      },
    },
  },
  steps: {
    's1-safe': {
      title: 'Cut power, drain fuel, enter a maintenance-safe state',
      body:
        'Before any disassembly begins, cut aircraft electrical power, drain the fuel and ground the airframe. The F-35\'s ejection seat, fuel and hydraulic systems all sit in high-pressure / high-energy states, so the first thing a field teardown does is make the aircraft energy-free, not reach for a screwdriver.',
      tools: ['Ground support power cart', 'Fuel drain and grounding equipment', 'Ejection seat safety pins'],
      stats: {
        '内部燃油': 'Internal fuel',
        '弹射座椅': 'Ejection seat',
      },
    },
    's2-canopy': {
      title: 'Open the bubble canopy',
      body:
        'Release the canopy actuator and latches, and the entire bubble canopy swings up and open. The canopy is a single-piece acrylic item and cannot be repaired in the field — any crack or out-of-tolerance scratch means replacing the part, which makes it one of the items most often grounding F-35 availability.',
      tools: ['Canopy actuator removal and installation tool', 'Protective pad (to avoid scratching the canopy)'],
      stats: {
        '舱盖材料': 'Canopy material',
        '维护性': 'Repairability',
      },
    },
    's3-avionics': {
      title: 'Replace avionics LRUs at module level',
      body:
        'The APG-81 AESA, EOTS and DAS are all designed as line-replaceable units (LRUs): replace the failed unit, no need to take the whole aircraft out of service. This is the key fifth-generation idea of turning "repair" into "replace", and the largest dividing line between its maintenance philosophy and that of fourth-generation fighters.',
      tools: ['ALIS / ODIN support terminal', 'AESA module-level replacement fixture', 'EOTS window cleaning kit'],
      stats: {
        'AESA 孔径': 'AESA aperture',
        'DAS 孔径数': 'DAS aperture count',
      },
    },
    's4-bays': {
      title: 'Open the internal weapon bays and remove the pylons',
      body:
        'Each of the two internal bays carries 2 AIM-9X-class weapons plus one 2000 lb-class JDAM. The doors are internally mounted, and the opening sequence and actuator stroke are strictly calibrated — an incorrect sequence damages the door hinges and the stealth shaping.',
      tools: ['Internal bay door calibration fixture', 'Ejector rack removal and installation set'],
      stats: {
        '弹舱数量': 'Number of bays',
        '典型挂载': 'Typical loadout',
      },
    },
    's5-wings': {
      title: 'Replace the removable wing panels',
      body:
        'The main wing is designed as a box section plus replaceable skin panels: when a panel is damaged by debris or ground equipment in the field, only the damaged panel is changed instead of sending the whole wing back to the factory. This is a very practical way for a stealth aircraft to sustain sortie generation.',
      tools: ['Skin panel removal and installation fixture', 'Torque wrench'],
      stats: {
        '翼面积': 'Wing area',
        '翼展（A 型）': 'Wingspan (A variant)',
      },
    },
    's6-gear': {
      title: 'Extend and retract the landing gear, inspect tyres and brakes',
      body:
        'The nose wheel and both main wheels are single wheels so that they fit inside the bays. Gear actuators, wheel brakes and tyre wear all fall under mandatory inspection counted in landing cycles, tied into life-limited part management.',
      tools: ['Landing gear safety inspection equipment', 'Tyre removal and nitrogen-filling equipment'],
      stats: {
        '机轮形式': 'Wheel configuration',
        '轮胎压力': 'Tyre pressure',
      },
    },
    's7-engine': {
      title: 'Field replacement of the complete F135 engine',
      body:
        'The last step, and the heaviest: extract the entire F135 from the aft fuselage. The engine is designed for changeout as a complete unit, with the field performing swaps rather than major overhaul — deep maintenance is left to rear bases.',
      tools: ['Engine hoist', 'Aft fuselage access equipment'],
      stats: {
        '军用推力': 'Military thrust',
        '加力推力': 'Afterburner thrust',
      },
    },
  },
};

export const f35LightningIIMetaEn: SubjectMetaEn = {
  name: 'F-35A Lightning II',
  subtitle: 'Lockheed Martin · In service since 2015 · Fifth-generation stealth multirole',
  tagline:
    'Single engine, 191 kN afterburner, Mach 1.6, RCS 0.001 m² — the Western bloc\'s mainstay fifth-generation fighter',
};