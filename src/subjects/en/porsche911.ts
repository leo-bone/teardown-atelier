import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * Porsche 911 Carrera S — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / hotspot stats / step stats /
 * comparison rows, ASCII ids for layers, hotspots and steps. Narrative is index-aligned
 * and must keep the same length as the Chinese array (4 paragraphs), otherwise the
 * merge step falls back to Chinese wholesale.
 *
 * Numbers, units and designations carry across verbatim: 992 II, Carrera S, PDK, DKKA,
 * 4,542 mm, 1,303 mm, 2,450 mm, 2,981 cm³, 91.0 × 76.4 mm, 10.2 : 1, 353 kW / 480 PS,
 * 530 Nm, 2,300–5,000 rpm, 7,500 rpm, 245/35 ZR20, 305/30 ZR21, 350 mm, 1,540 kg (DIN),
 * 308 km/h, 3.3–3.5 s, Cd 0.29, PIWIS, PASM, PCCB, 4WS.
 *
 * Note on hotspot / step `stats`: applyEn only swaps `label` and always keeps the Chinese
 * `value`, so only labels are mapped here. `specs` values are full overrides.
 */
export const porsche911En: SubjectEn = {
  name: 'Porsche 911 Carrera S',
  subtitle: 'Porsche · 992 II (2025) · rear-engine RWD sports car',
  tagline: '3.0L twin-turbo flat-six, 480 PS, 0–100 in 3.3 s — balance as the whole point',
  overview:
    "The Porsche 911 Carrera S (<b>992 II, 2025</b>) is the backbone of the 911 family, and it keeps faith with the <b>rear-engine RWD</b> layout that has run through the bloodline since 1963.\n" +
    '\n' +
    'Length 4,542 mm, height 1,303 mm, wheelbase 2,450 mm, kerb weight <b>1,540 kg</b> (DIN), 63 L fuel tank, 135 L front luggage compartment, drag coefficient Cd 0.29.\n' +
    '\n' +
    'The powertrain is a <b>3.0 L twin-turbocharged flat-six</b> (2,981 cm³, bore 91.0 × stroke 76.4 mm, compression ratio 10.2:1): maximum output <b>353 kW / 480 PS</b>, maximum torque 530 Nm (2,300–5,000 rpm), 7,500 rpm redline.\n' +
    '\n' +
    'It is paired with the <b>8-speed PDK dual-clutch</b>, 0–100 km/h in <b>3.3–3.5 s</b>, top speed 308 km/h. The chassis runs a front MacPherson / rear multi-link setup, with 20"/21" staggered tyre widths front to rear.\n' +
    '\n' +
    'Modelling note: this is a parametric rebuild from published specifications, not a reproduction from engineering drawings. The exterior and subsystem layouts are structural schematics; dimensions and figures follow Porsche official technical data.',
  headline: {
    '功率': 'Power',
    '扭矩': 'Torque',
    '0–100': '0–100',
    '极速': 'Top speed',
  },
  specs: {
    '代次': { label: 'Generation', value: '992 II (2025)' },
    '车身': { label: 'Body', value: '2-door coupe · rear-engine RWD' },
    '车长': { label: 'Length', value: '4,542 mm' },
    '车宽': { label: 'Width', value: '1,852 mm (2,033 mm with mirrors)' },
    '车高': { label: 'Height', value: '1,303 mm' },
    '轴距': { label: 'Wheelbase', value: '2,450 mm' },
    '整备质量': { label: 'Kerb weight', value: '1,540 kg (DIN)' },
    '油箱': { label: 'Fuel tank', value: '63 L' },
    '前备厢': { label: 'Front luggage compartment', value: '135 L' },
    '风阻 Cd': { label: 'Drag coefficient Cd', value: '0.29' },
    '发动机': { label: 'Engine', value: '3.0 L twin-turbocharged flat-six' },
    '排量': { label: 'Displacement', value: '2,981 cm³' },
    '缸径 × 冲程': { label: 'Bore × stroke', value: '91.0 × 76.4 mm' },
    '压缩比': { label: 'Compression ratio', value: '10.2 : 1' },
    '最大功率': { label: 'Maximum output', value: '353 kW / 480 PS' },
    '最大扭矩': { label: 'Maximum torque', value: '530 Nm @ 2,300–5,000 rpm' },
    '红线': { label: 'Redline', value: '7,500 rpm' },
    '变速箱': { label: 'Transmission', value: '8-speed PDK dual-clutch' },
    '0–100 km/h': { label: '0–100 km/h', value: '3.3–3.5 s' },
    '极速': { label: 'Top speed', value: '308 km/h' },
    '前悬': { label: 'Front suspension', value: 'MacPherson struts' },
    '后悬': { label: 'Rear suspension', value: 'Multi-link' },
    '前轮': { label: 'Front wheels', value: '245/35 ZR20' },
    '后轮': { label: 'Rear wheels', value: '305/30 ZR21' },
    '前制动': { label: 'Front brakes', value: '350 mm ventilated disc' },
  },
  narrative: [
    '<b>Rear-engine RWD is both the whole reason for the 911 and the whole complication</b>: the engine sits in the tail, so the weight naturally loads the rear axle, and that buys a steering character and traction nothing else reproduces. The price is a very light front end and violent weight transfer — the 911\'s joy and its difficulty come out of the same single fact.\n' +
      '\n' +
      'Every design consequence follows from there: the front luggage compartment rather than a rear one, the brakes sitting inside the wheel hubs for weight, the cooling air path running through the front deck rather than a radiator grille.',
    '<b>Why the boxer engine sits so low</b>: six cylinders laid flat and opposed, the pistons driving left and right into each other like a boxer\'s fists, so the whole assembly is wide and squat with the centre of mass close to the ground. That is the root of the way a 911 holds a line through a corner. But flat also means a cramped service envelope and a cooling layout that has to be solved sideways rather than through a conventional radiator face.',
    '<b>The PDK is the industrial benchmark for the dual-clutch</b>: two clutches pre-select the next ratio, so gear changes happen with almost no interruption of torque. The 8-speed version makes 1st gear extremely short (hard off the line) and 8th gear extremely long (low cruising rpm for economy), which is how the same gearbox serves both performance and daily use.',
    '<b>Staggered tyre widths</b>: 245/35 R20 up front lightens the steering load and sharpens response; 305/30 R21 at the rear puts 480 PS on the road. A rear-engine RWD car has to put its torque through wide rear tyres — that is physics, not styling.',
  ],
  comparison: {
    title: '992 I → 992 II (Carrera S)',
    note: 'Compiled from Porsche official technical data',
    rows: {
      '最大功率': { prev: '450 PS (992 I)', curr: '480 PS (992 II)' },
      '0–100 km/h': { prev: '3.7 s', curr: '3.3–3.5 s' },
      '缸径×冲程': { prev: '91.0×76.4', curr: '91.0×76.4 (unchanged)' },
      '车长': { prev: '4,519 mm', curr: '4,542 mm' },
      '整备质量': { prev: '1,515 kg', curr: '1,540 kg' },
    },
  },
  repairability: {
    difficulty: 'Moderate',
    tools: [
      'Porsche PIWIS diagnostic tester',
      'Engine hoist and support fixtures',
      'PDK-specific removal and installation tooling',
      'Torque wrench set',
      'Four-wheel alignment equipment',
    ],
    note:
      'Engineering assessment: the rear-engine layout keeps the engine easy to access, but the PDK, wheel alignment and the electronic systems all need dedicated equipment, so the job rates as moderate overall.',
  },
  fidelity: {
    source:
      'Roughly 12,000+ parts in the whole vehicle; the 3.0T flat-six (DKKA) alone carries a large number of components — crankcase, cylinder heads, twin turbochargers and so on.',
    note:
      'Parametric rebuild from published technical specifications, not a reproduction from engineering drawings. The exterior form and subsystem layout are structural schematics; dimensions and parameters follow Porsche official technical data.',
  },
  layers: {
    body: {
      name: 'Body (signature fastback profile)',
      group: 'Body',
      hotspots: {
        silhouette: {
          title: 'The soul of a 911: long nose plus fastback',
          body:
            'What identifies a 911 at a glance is that <b>long-nosed, low, rearward-raked fastback</b> silhouette. It has run from the first 901 of 1963 to the present day, and it is among the most stubborn bloodlines in automotive design.\n' +
            '\n' +
            'The rear-engine RWD layout is what physically allows the long nose and the set-back cabin — that is the root of the 911\'s proportional beauty, not a styling whim.',
          stats: {
            '车长': 'Length',
            '车高': 'Height',
            '轴距': 'Wheelbase',
            '风阻 Cd': 'Drag coefficient Cd',
          },
        },
      },
    },
    flat6: {
      name: 'Flat-six (3.0T)',
      group: 'Powertrain',
      hotspots: {
        flat6: {
          title: '3.0 L twin-turbocharged flat-six',
          body:
            'The heart of a 911 is the <b>flat-six (boxer)</b>: six cylinders laid out in two opposed banks, the pistons driving into each other left and right.\n' +
            'This layout puts the centre of mass extremely low and runs smoothly, and it is the foundation of the handling that a rear-engine RWD 911 delivers.\n' +
            '<table>\n' +
            '<tr><td>Displacement</td><td>2,981 cm³ (3.0 L)</td></tr>\n' +
            '<tr><td>Bore × stroke</td><td>91.0 × 76.4 mm</td></tr>\n' +
            '<tr><td>Compression ratio</td><td>10.2 : 1</td></tr>\n' +
            '<tr><td>Maximum output</td><td>353 kW / 480 PS</td></tr>\n' +
            '<tr><td>Maximum torque</td><td>530 Nm (2,300–5,000 rpm)</td></tr>\n' +
            '<tr><td>Redline</td><td>7,500 rpm</td></tr>\n' +
            '</table>\n' +
            'Twin turbocharging + direct injection + particulate filter; internal code DKKA (992 II).',
          stats: {
            '排量': 'Displacement',
            '功率': 'Output',
            '扭矩': 'Torque',
            '布局': 'Layout',
          },
        },
      },
    },
    pdk: {
      name: '8-speed PDK dual-clutch',
      group: 'Drivetrain',
      hotspots: {
        pdk: {
          title: 'PDK: the drivetrain soul of the 911',
          body:
            'The <b>PDK (Porsche Doppelkupplung, dual-clutch)</b> is the signature transmission of the 911.\n' +
            'Two separate clutches handle the odd and even ratios, and the next ratio is already preselected during a change — which is why it is both fast and smooth.\n' +
            'The 8-speed version (from 992) also makes 1st gear extremely short, which improves launch performance, and 8th gear extremely long, which drops cruising rpm and saves fuel.\n' +
            'Because the engine sits at the rear of a 911, the transmission is a <b>transaxle mounted transversely ahead of the engine</b> (the driveshaft then runs back to the rear axle), the point being to concentrate the mass between the axles and balance the front-to-rear weight distribution.',
          stats: {
            '类型': 'Type',
            '布局': 'Layout',
            '驱动': 'Drive',
          },
        },
      },
    },
    wheels: {
      name: 'Wheels and tyres (20"/21" staggered)',
      group: 'Running gear',
      hotspots: {
        wheels: {
          title: 'Staggered widths: steering versus grip',
          body:
            'A 911 runs <b>narrow front, wide rear</b> staggered tyres (245/35 R20 front, 305/30 R21 rear) — the standard logic for a rear-engine RWD car:\n' +
            'the narrow front tyre reduces steering load and sharpens response; the wide rear tyre keeps 480 PS firmly on the road.\n' +
            'Inside the rims are ventilated brake discs (350 mm front), with PCCB ceramic composite discs available as an option.',
          stats: {
            '前轮': 'Front wheels',
            '后轮': 'Rear wheels',
            '前制动': 'Front brakes',
          },
        },
      },
    },
    suspension: {
      name: 'Suspension (front MacPherson / rear multi-link)',
      group: 'Chassis',
      hotspots: {
        suspension: {
          title: 'Front MacPherson + rear multi-link',
          body:
            'Across the 992 range the front wheels use <b>MacPherson struts</b> (compact, leaves space in the nose), and the rear wheels use a <b>multi-link</b> arrangement (precise control of rear axle geometry on a rear-engine RWD car).\n' +
            'PASM active suspension is standard, and rear-axle steering (4WS) is optional — more agility at low speed, more stability at high speed.',
          stats: {
            '前悬': 'Front suspension',
            '后悬': 'Rear suspension',
            '选装': 'Options',
          },
        },
      },
    },
    exhaust: {
      name: 'Sport exhaust (twin tailpipes)',
      group: 'Powertrain',
      hotspots: {
        exhaust: {
          title: 'Sport exhaust',
          body:
            "The 911's exhaust note is part of the product. The Carrera S comes with a sport exhaust as standard (silver tailpipes), and the valves can open in Sport mode to let the flat-six's flat bark through more clearly.",
          stats: {
            '尾管': 'Tailpipes',
            '选装': 'Options',
          },
        },
      },
    },
  },
  steps: {
    's1-wheels': {
      title: 'Lift the vehicle, remove all four wheels',
      body:
        'First onto the lift, then all four wheels off. Staggered 20"/21" tyres are awkward once they are on the ground, and with the wheels removed the brakes, the suspension and the rear powertrain are all fully exposed — this is the entry point of the whole teardown line.',
      tools: ['Vehicle lift', 'Torque wrench', 'Tyre removal and installation rack'],
      stats: {
        '前胎': 'Front tyre',
        '后胎': 'Rear tyre',
      },
    },
    's2-exhaust': {
      title: 'Release the sport exhaust to clear the rear',
      body:
        'Loosen the exhaust from below first, dropping the twin tailpipes, the centre section and the catalytic converter as one assembly. If it is not removed first, the exhaust routing fouls against the rear axle when the engine is lifted out.',
      tools: ['Exhaust clamp removal and installation tool', 'High-temperature anti-seize compound'],
      stats: {
        '尾管形式': 'Tailpipe layout',
        '阀门排气': 'Valve\'d exhaust',
      },
    },
    's3-suspension': {
      title: 'Remove the front and rear suspension assemblies',
      body:
        'The front MacPherson struts and the rear multi-link assembly both withdraw from the lower body as complete units. The 911 rear suspension carries a large number of irregular links to make room for the rear-mounted engine, so loosen the rubber bushing bolts in a diagonal sequence — otherwise bushing preload is deformed and the geometry has to be re-established by alignment.',
      tools: [
        'Suspension removal and installation fixture',
        'Bushing press',
        'Four-wheel alignment machine',
      ],
      stats: {
        '前悬架': 'Front suspension',
        '后悬架': 'Rear suspension',
      },
    },
    's4-pdk': {
      title: 'Disconnect the driveshaft, withdraw the 8-speed PDK',
      body:
        'The PDK is a dual-clutch with two input shafts. Disconnect the driveshaft and the shift cables first, then withdraw the transmission from the rear face of the engine. The service window on the PDK is extremely narrow — the large majority of failures are resolved by replacing the complete transmission rather than by rebuilding it.',
      tools: [
        'PDK-specific removal and installation tooling',
        'Transmission support stand',
        'PIWIS diagnostic tester',
      ],
      stats: {
        '挡位数': 'Ratios',
        '形式': 'Type',
      },
    },
    's5-flat6': {
      title: 'Hoist out the flat-six',
      body:
        'Last, lift the 3.0T flat-six out as a complete assembly from the rear of the car. With a rear-mounted layout the removal window is at the tail, and the lift points and support points must be calibrated exactly as the manual specifies — this is the step that most distinguishes a 911 from a front-engined car.',
      tools: ['Engine hoist', 'Engine support fixture', 'Coolant recovery equipment'],
      stats: {
        '排量': 'Displacement',
        '最大功率': 'Maximum output',
      },
    },
    's6-body': {
      title: 'Body-in-white separation',
      body:
        'With the powertrain and the running gear both out, what remains is the body in white — and here is where the 911\'s signature fastback profile and the continuous roof arc live. The outer panels of the mixed aluminium-steel body are bonded and riveted, so disassembly here amounts to destructive work.',
      tools: ['Body adhesive cutting equipment', 'Rivet drilling tool'],
      stats: {
        '车长': 'Length',
        '风阻系数': 'Drag coefficient',
      },
    },
  },
};

export const porsche911MetaEn: SubjectMetaEn = {
  name: 'Porsche 911 Carrera S',
  subtitle: 'Porsche · 992 II (2025) · rear-engine RWD sports car',
  tagline: '3.0L twin-turbo flat-six, 480 PS, 0–100 in 3.3 s — balance as the whole point',
};
