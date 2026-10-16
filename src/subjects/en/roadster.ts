import type { SubjectEn, SubjectMetaEn } from './types';

/**
 * Tesla Roadster (second generation) — English content overlay.
 *
 * Anchors: Chinese label strings for headline / specs / hotspot stats / step stats /
 * comparison rows, ASCII ids for layers, hotspots and steps. Narrative is index-aligned
 * and must keep the same length as the Chinese array (4 paragraphs), otherwise the
 * merge step falls back to Chinese wholesale.
 *
 * Honesty note — this subject needs it more than any other on the site. The car was
 * first shown on 2026-10-15 and Tesla states production starts in 2028, so **no teardown
 * of a real Roadster 2 exists anywhere in the world**. Every "layer" and "step" here is
 * engineering inference from the reveal's verbal figures plus the general principles of
 * aerospace cold-gas propulsion — never a teardown record. All performance numbers are
 * unverified manufacturer claims. These caveats are carried through verbatim; do not
 * soften "inference" into "estimate" and do not drop "not yet in production".
 *
 * Numbers, units and designations carry across verbatim: 10,000 N·m, > 80 kN, 600 L,
 * 250 kg, 10,000 psi, 2G, 200 kWh, 483 km / 300 mi, 1,000 km, 9,000 lb, 250 lb,
 * 0.59 s, 0.9 s, 1.6 s, 0.81 s, 230 mph, 370 km/h, 400 km/h, 212 kWh, RMB 332,000,
 * USD 50,000, USD 250,000, USD 200,000–250,000, 2,000 units, 16 stocks, A71, SpaceX,
 * McGregor, Tesla, FMVSS, FAA, COPV, Cybertruck, Semi, Cybercab, Morningstar,
 * Lars Moravy, F-35, Starman, 2G.
 * Currency is rendered in English (wan-style units such as 万元人民币 become RMB/USD
 * amounts); every magnitude is unchanged.
 *
 * ⚠️ Attribution rules that must not drift when editing this file:
 *   - **> 80 kN is the FOUR REAR thrusters only**, not all ten. Moravy said those four
 *     exhaust faster than sound speed (visible Mach diamonds).
 *   - **Storage pressure was never disclosed.** Tesla said only "advanced ultra-high
 *     pressure". The ~10,000 psi figure is a 2017-era claim NOT restated in 2026; it
 *     may appear only when explicitly labelled as the 2017 figure.
 *   - **Demo control method is unresolved.** It was unmanned with a Starman dummy and
 *     Musk framed it as autonomous ("to make sure we don't kill anyone"). Press reported
 *     "operated remotely". Never state flatly that it was remotely piloted.
 *   - **Musk's "if your primary goal is safety, do not buy a Roadster" is from a
 *     January 2026 podcast**, not from the reveal. It is widely misattributed.
 *   - **10,000 N·m (2017, not restated) is post-reduction WHEEL torque**, not motor
 *     output; **~200 kWh is a 2017-derived estimate**, Tesla published no capacity.
 *   - **No mass and no dimensions were disclosed at all.** "< 4,500 lb" is unsourced and
 *     from 2017 — write "not disclosed", never a number.
 *   - **The removable glass roof is UNCONFIRMED.** Car & Driver's photos show butterfly
 *     doors. Do not present a removable glass roof as a confirmed feature.
 *   - **Range test cycle: none cited** (not EPA, not WLTP, not CLTC), and Tesla gave no
 *     explanation for the cut. The COPV-packing explanation is inference, clearly
 *     labelled as such, not company rationale.
 *
 * Note on hotspot / step `stats`: applyEn swaps `label` and `value` independently, so any
 * value carrying Chinese text is overridden as well here (label + value form).
 */
export const roadster2En: SubjectEn = {
  name: 'Tesla Roadster (second generation)',
  subtitle: 'Tesla · unveiled 2026-10-15 · SpaceX A71 cold-gas propulsion',
  tagline:
    '10 cold-gas thrusters, four of them above 80 kN, 0–60 mph in under 0.59 s — it really does fly',
  overview:
    'On 2026-10-15 Tesla formally unveiled the second-generation Roadster at the SpaceX test site in McGregor, Texas — <b>roughly 9 years late</b> after its November 2017 debut, and about 11 years from that debut to production.\n' +
    '\n' +
    'What is unusual about this car is not that it is faster, but that <b>it really does carry a rocket-class thrust system</b>: the A71 cold-gas propulsion module developed with SpaceX, about 10 thrusters, <b>more than 80 kN from the four rear thrusters alone</b>, and 600 L of compressed air stored in two carbon-fibre pressure vessels. The reveal demonstrated an inverted climb, a mid-air flip and a landing held against a vertical wall.\n' +
    '\n' +
    'Three things must be said clearly at the same time:\n' +
    '\n' +
    '<b>First, this is cold thrust — not a rocket, and not an aircraft.</b> Compressed air is directed out through valves to produce reaction force; there is no combustion and no sustained lift. “It can fly” is the product of performance engineering (briefly unloading the tyres), not of aeronautical capability. Current regulations offer no approval path either for a road vehicle leaving the ground or for high-pressure vessels.\n' +
    '\n' +
    '<b>Second, the range was cut in half and nobody explained why.</b> The roughly 1,000 km claimed in 2017 became roughly 483 km. <b>Tesla gave no explanation</b> and cited no test cycle — not EPA, not WLTP, not CLTC — so the figure does not even have a common basis for comparison. The most reasonable inference, given Moravy’s remark that “every usable void in the car is filled with COPVs”, is that the gas storage ate into the battery’s volume and weight budget — <b>but that is inference, not company rationale</b>.\n' +
    '\n' +
    '<b>Third, no teardown data exists.</b> The car does not enter production until 2028, and <b>there is not a single Roadster 2 in the world that has been taken apart</b>. Every layer and every step on this page is therefore <b>engineering inference</b>, based on the figures given at the reveal and on the general principles of aerospace cold-gas propulsion. What it shows is what a car like this would be made of in engineering terms — not how it is actually built.',
  headline: {
    '0–60 mph': { label: '0–60 mph', unit: 's (Rocket)' },
    '总推力': { label: 'Rear thruster thrust (4 units)' },
    '演示 0–60': { label: 'Demo 0–60', unit: 's (measured)' },
    '极速': 'Top speed',
  },
  specs: {
    '发布时间': {
      label: 'Launch date',
      value: '2026-10-15',
      note: 'First shown 2017-11; delayed by roughly 9 years',
    },
    '量产时间': { label: 'Production start', value: '2028 (planned)', note: 'Texas Gigafactory' },
    '版本': {
      label: 'Versions',
      value: 'Performance / Thrust / Rocket',
      note: 'Two-seat / two-seat / single-seat',
    },
    '0–60 mph': {
      label: '0–60 mph',
      value: '< 1.6 s / < 0.9 s / < 0.59 s',
      note: 'In Performance / Thrust / Rocket order',
    },
    '极速': {
      label: 'Top speed',
      value: '> 230 mph (≈370 km/h)',
      note: 'Official product-page figure; reports differ on whether it covers all versions or Rocket only',
    },
    '轮上扭矩': {
      label: 'Wheel torque',
      value: '10,000 N·m',
      note: '2017 claim, not restated at the 2026 reveal; and it is the post-reduction value at the wheel, not motor output',
    },
    '动力配置': { label: 'Powertrain layout', value: 'Three-motor AWD (1 front + 2 rear)' },
    '冷气推进器': {
      label: 'Cold-gas thrusters',
      value: '10 units · thrust of the 4 rear thrusters > 80 kN',
    },
    '储气系统': {
      label: 'Gas storage system',
      value: '600 L (2 COPVs) · about 250 kg',
      note: 'Tesla says every usable void in the car is filled',
    },
    '电池容量': {
      label: 'Battery capacity',
      value: 'Not disclosed',
      note: '2017 arithmetic pointed to roughly 200 kWh; nothing was given this time',
    },
    '续航': {
      label: 'Range',
      value: 'About 483 km / 300 mi',
      note: 'Cut from the roughly 1,000 km claimed in 2017; no test cycle cited',
    },
    '横向加速度': { label: 'Lateral acceleration', value: 'Up to about 2G (ground-fan suction)' },
    '整备质量': {
      label: 'Kerb weight',
      value: 'Not disclosed',
      note: 'This reveal gave no dimensions and no mass at all',
    },
    '预计售价': {
      label: 'Expected price',
      value: 'USD 200,000–250,000',
      note: 'Final pricing not announced at the reveal',
    },
    '中国意向金': { label: 'China deposit', value: 'RMB 332,000 (Performance)' },
    '量产方式': {
      label: 'Production configuration',
      value: 'Two motors plus one rear-mounted motor',
      note: 'Inferred from the official three-motor AWD layout',
    },
    '数据来源': {
      label: 'Data source',
      value: 'Public statements at the 2026-10-15 reveal',
      note: 'Not independently verified',
    },
  },
  narrative: [
    '<b>First, this is not a sports-car programme, it is an aerospace programme lowered onto the road.</b> The technology behind A71 comes from spacecraft attitude-control modules — the kind of system fitted to satellites to trim attitude in vacuum. Putting the same thing into a car means <b>thrust control, pressure-vessel containment and fast valves</b> all have to step down from aerospace standards to automotive ones. That is the hardest part of the whole car, and one of the reasons it slipped by 9 years.',
    '<b>Second, “able to fly” and “legal to drive on the road” are two different things.</b> On stage Musk admitted: “not sure it is legal in every jurisdiction, but someone will be able to own one of these.” Behind that sentence sit three regulatory voids: a road vehicle in an airborne attitude, high-pressure vessels carried on board, and the certification path for the propulsion system — <b>none of which current FMVSS standards cover</b>. Aviation experts WIRED interviewed are more specific: a vehicle of more than about 250 lb leaving the ground needs FAA approval and airspace clearance, and an owner may need a recreational aviation licence rather than a driver’s licence; a former FAA official estimated certification alone could take “at least a year”.',
    '<b>Third, the range cut exposes the real physical boundary, and nobody wants to explain it.</b> Going from 620 mi to 300 mi is not halving, it is losing more than half. 620 mi needs roughly 200 kWh (the GMC Hummer EV already weighs over 9,000 lb on 212 kWh), and this time not even the battery capacity is published — a 300 mi car that will not say how big its battery is already says something about where the pressure came from. <b>Tesla gave no official explanation at all</b>, and “chose faster over further” is outside inference, not a company statement.',
    '<b>Fourth, leave behind a totem for manual driving.</b> Musk put it plainly — in the long run the only manually driven car is the Roadster. This is not sentimentality, it is product positioning: once every model moves to autonomy, one car has to keep “driving itself” commercially meaningful. Its forecast annual sales are only about 2,000 units (Morningstar classes it as a halo model), so <b>its commercial value lies beyond volume</b>.',
  ],
  comparison: {
    title: '2017 debut vs 2026 production-car reveal',
    note: 'The revisions cluster on range and acceleration — the direction of the trade-off is unmistakable',
    rows: {
      '0–60 mph': { prev: '1.9 s (base)', curr: '< 0.59 s (Rocket)' },
      'SpaceX 套件加速': { prev: '1.1 s (claimed)', curr: '< 0.59 s' },
      '极速': { prev: '> 400 km/h', curr: '> 370 km/h' },
      '续航': { prev: 'About 1,000 km', curr: 'About 483 km' },
      '电池容量': { prev: 'About 200 kWh (back-calculated)', curr: 'Not disclosed' },
      '座位（顶级版）': { prev: '2+2', curr: 'Single seat (Rocket)' },
      '推进器数量': { prev: 'About 10 (claimed)', curr: 'About 10 (confirmed)' },
      '量产时间': { prev: '2020 (original plan)', curr: '2028 (planned)' },
    },
  },
  repairability: {
    difficulty: 'Extremely difficult',
    tools: [
      'Vehicle lift and body support fixtures',
      'High-pressure vessel inspection equipment',
      'Carbon-fibre pressure vessel charge/leak-test rig',
      'Torque wrench set',
      'Manufacturer diagnostic system (not public)',
    ],
    note:
      'Engineering inference: a 600 L high-pressure gas storage system (2 COPVs) plus the three-electrical system leaves the car with essentially nothing an owner could service; and because the car is not yet in production, there is no real-world repair data.',
  },
  fidelity: {
    source:
      'No teardown data from a real car exists: the production-spec car was first shown on 2026-10-15, the official line is production in 2028, and this model is inferred from the verbal figures given at the reveal plus the general principles of aerospace cold-gas propulsion.',
    note:
      '⚠️ The layers and steps in this subject are **engineering inference**, not teardown records — the car is not yet in production and no teardown of a real Roadster 2 exists. Tesla disclosed **no kerb weight, no dimensions, no battery capacity, no storage pressure and no range test cycle** at this reveal, so this page marks all of those “not disclosed” rather than filling in guesses. The 10,000 N·m wheel-torque figure is a 2017 claim and was not restated. The modelling baseline is the Rocket version (the most complete equipment).',
  },
  layers: {
    body: {
      name: 'Body (titanium · fighter-jet facets)',
      group: 'Body',
      hotspots: {
        silhouette: {
          title: 'Wedge faceting: a design language leaning toward Cybertruck',
          body:
            'This generation’s design language has clearly <b>moved away from the 911’s organic surfaces towards hard faceting</b> — the teaser images before the reveal were widely read as “close to the Cybertruck”. The full-width front light bar, the chamfered wheel arches and the chine line along the roof are all fighter-jet (F-35 style) vocabulary.\n' +
            '\n' +
            'Musk was unusually direct this time: the Roadster is not positioned as “a faster electric sports car” but as <b>“the last Tesla that a human drives”</b> — once the rest of the line goes to autonomy, manual driving needs a totem to carry it.\n' +
            '\n' +
            'Worth noting: the body makes heavy use of <b>titanium, magnesium and carbon fibre</b>.\n' +
            '\n' +
            '⚠️ <b>One honest note</b>: <b>Tesla disclosed no dimensions and no kerb weight whatsoever at this reveal</b> — length, width, wheelbase and mass are all missing. The “&lt; 4,500 lb” figure in circulation is a 2017 claim and was not restated. So this page <b>quotes no mass number</b> and sticks to what can be confirmed: the materials are magnesium / titanium / carbon fibre (official product page), and there is the 600 L, roughly 250 kg of compressed air — <b>the air alone is about 250 kg</b>, which makes it the single largest item in the weight budget.',
          stats: {
            '设计语言': { label: 'Design language', value: 'Hard faceting · fighter-jet style' },
            '材料': { label: 'Materials', value: 'Titanium / magnesium / carbon fibre' },
            '整备质量': { label: 'Kerb weight', value: 'Not disclosed' },
            '其中压缩空气': { label: 'Of which compressed air', value: 'About 250 kg' },
            '定位': { label: 'Positioning', value: 'The last manually driven Tesla' },
          },
        },
      },
    },
    suction: {
      name: 'Ground-fan suction system (2G lateral)',
      group: 'Aerodynamics',
      hotspots: {
        'fan-suction': {
          title: 'Holding the car down with fans',
          body:
            'The signature capability of the Performance version: <b>lateral acceleration of up to 2G through corners</b>. The method is not suction cups — a row of <b>fans under the car blows air downward</b> and the reaction from the road surface holds the car down. Physically it is Bernoulli downforce; in engineering terms, active aerodynamics.\n' +
            '\n' +
            'The idea is not new in motorsport (ground-effect cars), but using it on a production road car is a first. It resolves a physical contradiction: with <b>10,000 N·m at the wheel and a very short wheelbase</b>, tyre grip saturates before the powertrain does, and without downforce you are only spinning the wheels.\n' +
            '\n' +
            '<br><b>Caution</b>: whether such a system is legal on public roads, and whether it can be produced at all, remains unsettled. Musk himself conceded on stage that he is “not sure it is legal in every jurisdiction, but someone will be able to own one of these cars”.',
          stats: {
            '横向加速度': {
              label: 'Lateral acceleration',
              value: 'Up to about 2G (manufacturer claim)',
            },
            '原理': { label: 'Principle', value: 'Underbody fans · Bernoulli downforce' },
            '法规定位': {
              label: 'Regulatory status',
              value: 'Primarily a motorsport / stunt attribute',
            },
          },
        },
      },
    },
    powertrain: {
      name: 'Three-motor AWD (10,000 N·m at the wheel)',
      group: 'Powertrain',
      hotspots: {
        'tri-motor': {
          title: '1 front + 2 rear: independent torque vectoring on the rear axle',
          body:
            'Three-motor layout: <b>one motor on the front axle, two on the rear</b>. The point of the rear pair is not only speed — it enables <b>independent torque vectoring</b>, with different torque to the left and right wheel so yaw is actively cancelled through a corner.\n' +
            '\n' +
            '⚠️ <b>One number issue that has to be stated plainly</b>: <b>10,000 N·m is the 2017 claim; Tesla did not restate it at the 2026 reveal</b>. And it is <b>torque at the wheel after being multiplied by the reduction gearing</b>, not motor output — the motors themselves are rated at only a few hundred N·m. So after this reveal the figure should be treated as <b>unconfirmed</b>.\n' +
            '\n' +
            '<table>\n' +
            '<tr><td>Layout</td><td>Three-motor AWD (1 front / 2 rear)</td></tr>\n' +
            '<tr><td>Wheel torque</td><td>10,000 N·m (<b>2017 claim, not restated</b>)</td></tr>\n' +
            '<tr><td>0–60 mph</td><td>Performance &lt;1.6s · Thrust &lt;0.9s · Rocket &lt;0.59s</td></tr>\n' +
            '<tr><td>Demo measured</td><td><b>0.81 s</b> (Tesla’s own timer, four rear thrusters)</td></tr>\n' +
            '<tr><td>Top speed</td><td>&gt;230 mph (≈370 km/h)</td></tr>\n' +
            '</table>\n' +
            '\n' +
            'About that <b>0.81 s</b>: it is a measured figure from the live demonstration, but <b>the demo car’s kerb weight and battery configuration were not disclosed</b>. Musk himself conceded the production car would be quicker: “as you increase force and decrease mass”. Put another way, <b>0.81 s is not the result of a car in representative production condition</b> — it is the weakest link in the whole performance story.\n' +
            '\n' +
            'The three versions span an enormous range of capability: <b>Performance</b> is the road car, <b>Thrust</b> adds rear cold-gas thrusters and goes to the track, and <b>Rocket</b> carries the full complement of about 10 thrusters, seats one, and is aimed at stunt work.',
          stats: {
            '电机': { label: 'Motors', value: 'Three motors (1 front + 2 rear)' },
            '轮上扭矩': { label: 'Wheel torque', value: '10,000 N·m (2017 claim)' },
            'Rocket 版 0–60': { label: 'Rocket 0–60', value: '< 0.59 s (official)' },
            '演示实测': { label: 'Demo measured', value: '0.81 s (Tesla’s own timer)' },
          },
        },
      },
    },
    battery: {
      name: 'Traction battery (capacity not disclosed)',
      group: 'Energy',
      hotspots: {
        pack: {
          title: 'Range halved — and Tesla did not say why',
          body:
            'This is <b>the most important specification revision of the entire reveal</b>.\n' +
            '\n' +
            'At its 2017 debut Tesla claimed a range of about <b>1,000 km (620 mi)</b>; at this reveal the figure became <b>&gt;300 mi (≈483 km)</b>, the same for all three versions. That is a cut of more than half.\n' +
            '\n' +
            '<b>Tesla did not explain why.</b> The page cites no test cycle either — not EPA, not WLTP, not CLTC — so the number does not even have a common basis for comparison.\n' +
            '\n' +
            'The physics holds up: 620 mi needs roughly 200 kWh of battery, and the GMC Hummer EV already exceeds 9,000 lb on 212 kWh. This time <b>battery capacity, voltage architecture and charge rate were all left unpublished</b> — a 300 mi car that will not say how big its battery is already says something.\n' +
            '\n' +
            'Put together with Moravy’s line that “every usable void in the car is filled with COPVs”, the most reasonable inference is that <b>the volume and weight eaten by the gas storage forced the battery capacity down</b>, with the thrusters making the power back up. <b>That is inference, not company rationale.</b>\n' +
            '\n' +
            'One version-related contradiction is worth recording: on whether the <b>&gt;230 mph</b> top speed covers “all versions” or “Rocket only”, outlets quote each other inconsistently (TechCrunch says all three, EVGulf says Rocket only). This page treats it as the official product-page figure without distinguishing versions.\n' +
            '\n' +
            'What the cost buys is <b>wheel-end power in the 1,000+ hp class and 0.59 s acceleration</b>. That is an explicit trade placing “goes fast” ahead of “goes far”, and it is the central product logic of this generation.\n' +
            '\n' +
            'One more real-world reference: the next day after the reveal (2026-10-16), the Chinese A-share auto parts sector moved sharply, with <b>16 stocks hitting the daily limit</b> — the direction the market read was lightweighting and gas-vessel die casting, not range anxiety.',
          stats: {
            '容量': {
              label: 'Capacity',
              value: 'Not disclosed (2017 arithmetic pointed to about 200 kWh)',
            },
            '续航（2026 口径）': { label: 'Range (2026 figure)', value: 'About 483 km / 300 mi' },
            '续航（2017 旧口径）': { label: 'Range (2017 figure)', value: 'About 1,000 km / 620 mi' },
            '取舍': { label: 'Trade-off', value: 'Range sacrificed to save weight' },
          },
        },
      },
    },
    thrusters: {
      name: '★ A71 cold-gas propulsion system (10 units · 80 kN)',
      group: 'Propulsion',
      hotspots: {
        a71: {
          title: 'A71: putting a rocket engine into a sports car',
          body:
            '<b>This is the real monster of the whole car, and the only promise unchanged since 2017.</b>\n' +
            '\n' +
            'Developed with SpaceX, internal code <b>A71</b>, the technology comes from spacecraft <b>attitude-control modules</b>. The official figures disclosed at the reveal:\n' +
            '\n' +
            '<table>\n' +
            '<tr><td>Thruster count</td><td>10 units (4 at the rear as the main thrusters, the rest for attitude control)</td></tr>\n' +
            '<tr><td>Rear thruster thrust</td><td>&gt; 80 kN — <b>the four rear thrusters only</b>, not the sum of all ten</td></tr>\n' +
            '<tr><td>Gas storage</td><td>600 L compressed air · about 250 kg · carbon-fibre-wound pressure vessels (2 units)</td></tr>\n' +
            '<tr><td>Medium</td><td>Cold gas (no combustion, no flame)</td></tr>\n' +
            '<tr><td>Pressure</td><td>Tesla said only “advanced ultra-high pressure”, <b>no figure disclosed</b></td></tr>\n' +
            '<tr><td>Against tyre grip</td><td>4–5× what the tyres can deliver (Tesla official wording)</td></tr>\n' +
            '</table>\n' +
            '\n' +
            '<b>Read the thrust figure correctly</b>: the &gt;80 kN is the thrust of the <b>four rear thrusters</b>, not the total of the ten. On stage Moravy said explicitly that those four exhaust faster than the speed of sound, with visible Mach diamonds.\n' +
            '\n' +
            '<b>Key point: this is not a rocket, it is cold thrust.</b> Compressed air is directed out through valves to produce reaction force; there is no combustion chamber and no propellant burning. What it gives you is <b>brief attitude control and extra downforce</b>, not sustained lift. Musk: “the car has an advanced ultra-high-pressure gas tank, the car can charge itself — it needs no special propellant, it fills itself up and can do these manoeuvres at any time.”\n' +
            '\n' +
            'Moravy’s sentence is the key to the whole car: <b>“every usable void in the car is filled with carbon-fibre-wound pressure vessels (COPVs)”</b>. 600 L of air (about 250 kg), the battery and three motors all have to fit inside a two-seat sports car — <b>this is the direct reason the range had to come down</b>, and it also explains why the Rocket version is single-seat.\n' +
            '\n' +
            '<b>On “how long can it fly”: Tesla did not disclose it.</b> The “ten-odd seconds” and “a few seconds” in Chinese coverage are guesses back-calculated from the length of the demo, not official data.\n' +
            '\n' +
            'The reveal included a full demonstration: an <b>inverted climb</b> up a curved ramp, a <b>mid-air flip</b>, a landing held against a vertical wall, and a “kickflip”-style leap across a whole train of Model 3 / Model Y / Cybertruck / <b>Semi</b> / Cybercab vehicles.\n' +
            '\n' +
            '<b>The demo was unmanned</b> — Musk: “it is technically autonomous for this demo to make sure we don’t kill anyone.” (A Starman dummy was in the seat.) Press reported the car as “operated remotely”, but <b>the control method is genuinely unresolved</b>; it should not be read as proof of either remote piloting or of autonomy.\n' +
            '\n' +
            'Musk’s own warning on safety comes from a <b>January 2026 podcast</b>, not from this reveal — it is widely misattributed: <b>“If your primary goal is safety, do not buy a Roadster.”</b>',
          stats: {
            '推进器总数': { label: 'Total thrusters', value: '10 units' },
            '尾部推力': { label: 'Rear thruster thrust', value: '> 80 kN (4 units)' },
            '储气量': { label: 'Stored gas', value: '600 L · about 250 kg of air' },
            '压力容器': {
              label: 'Pressure vessels',
              value: 'Carbon-fibre-wound · 2 units · self-charging',
            },
            '相对轮胎抓地力': {
              label: 'Against tyre grip',
              value: '4–5× (official wording)',
            },
          },
        },
        tanks: {
          title: '600 L of carbon-fibre pressure vessels: they eat the whole cabin',
          body:
            '<b>Two</b> carbon-fibre-wound pressure vessels (COPVs), <b>600 L</b> in total, holding about <b>250 kg</b> of compressed air.\n' +
            '\n' +
            'The <b>specific strength</b> of a carbon-fibre pressure vessel is the key: at the same weight a steel bottle holds about 0.4× the pressure and titanium about 0.6×, while filament-wound carbon fibre manages more than 2×. That is the precondition for fitting it into a two-seat sports car.\n' +
            '\n' +
            'The VP of Engineering’s words are worth reading verbatim: <b>“every usable void inside the car is filled with carbon-fibre-wound pressure vessels”</b> — which means a rear seat and a boot compartment effectively do not exist in the conventional sense. It also explains why the Rocket version is <b>single-seat</b>.\n' +
            '\n' +
            '<b>Storage pressure was not disclosed</b> — Tesla said only “advanced ultra-high pressure” (the roughly 10,000 psi figure in media coverage is the <b>2017 claim and was not restated at the 2026 reveal</b>).\n' +
            '\n' +
            'On safety: high-pressure vessels on a road vehicle fall into a domain <b>not covered by any current FMVSS standard</b>. Aviation experts WIRED interviewed point out that a vehicle of more than about 250 lb leaving the ground needs FAA approval and airspace clearance, and that an owner may need a recreational aviation licence rather than a driver’s licence; a former FAA official estimated certification alone could take “at least a year”. This is not engineering that cannot be done — the <b>regulatory path simply does not exist yet</b>.',
          stats: {
            '压力容器': { label: 'Pressure vessels', value: '2 carbon-fibre-wound units (COPV)' },
            '总储气': { label: 'Total stored gas', value: '600 L · about 250 kg' },
            '座舱占用': { label: 'Cabin occupancy', value: 'Tesla: “every usable void”' },
            '补充方式': { label: 'Refilling', value: 'The vehicle charges itself from the main battery' },
          },
        },
      },
    },
    cabin: {
      name: 'Cabin (two-seat · manual driving)',
      group: 'Cabin',
      hotspots: {
        manual: {
          title: 'The last Tesla driven by a human',
          body:
            'Musk’s own words on the 2026 Q1 earnings call: <b>“in the long run, the only manually driven car is the new Tesla Roadster.”</b> Once the rest of the line moves to autonomy, manual driving needs a totem.\n' +
            '\n' +
            'The cabin is the part that changed most this generation: <b>the seat count differs by version</b> —\n' +
            '\n' +
            '<table>\n' +
            '<tr><td>Performance</td><td>Two seats · road-oriented · active aerodynamics + fan suction</td></tr>\n' +
            '<tr><td>Thrust</td><td>Two seats · track-oriented · adds rear cold-gas thrusters</td></tr>\n' +
            '<tr><td>Rocket</td><td><b>Single seat</b> · stunt-oriented · full complement of about 10 thrusters</td></tr>\n' +
            '</table>\n' +
            '\n' +
            'The Rocket version’s single seat is not a decontenting cut — it is <b>space eaten by the gas storage</b>, the direct engineering consequence of the A71 system.\n' +
            '\n' +
            '⚠️ <b>A common claim that needs correcting</b>: the “removable glass roof” in circulation comes from pre-reveal rumour and 2017-era material, and <b>was not confirmed at this reveal</b>. Car & Driver’s on-site photographs show <b>butterfly doors</b> (scissor/butterfly), and the roof in the livestream footage also looks fixed — so this page does not treat a removable glass roof as a confirmed feature.',
          stats: {
            '座位（Performance / Thrust）': { label: 'Seats (Performance / Thrust)', value: 'Two seats' },
            '座位（Rocket）': { label: 'Seats (Rocket)', value: 'Single seat' },
            '定位': { label: 'Positioning', value: 'The last manually driven Tesla' },
            '车门形式': { label: 'Doors', value: 'Butterfly doors (on-site photos)' },
          },
        },
      },
    },
    versions: {
      name: 'Three versions compared (Performance / Thrust / Rocket)',
      group: 'Versions',
      hotspots: {
        trim: {
          title: 'Three versions, three prices: rising performance, shrinking seats',
          body:
            'The most practically useful information from the 2026-10-15 reveal, all of it announced on stage:\n' +
            '\n' +
            '<table>\n' +
            '<tr><td>Version</td><td>Seats</td><td>Propulsion</td><td>0–60 mph</td><td>Positioning</td></tr>\n' +
            '<tr><td>Performance</td><td>Two seats</td><td>Ground-fan suction</td><td>&lt; 1.6 s</td><td>Road</td></tr>\n' +
            '<tr><td>Thrust</td><td>Two seats</td><td>+ rear cold-gas thrusters</td><td>&lt; 0.9 s</td><td>Track</td></tr>\n' +
            '<tr><td>Rocket</td><td><b>Single seat</b></td><td>All about 10 units fitted</td><td><b>&lt; 0.59 s</b></td><td>Stunt</td></tr>\n' +
            '</table>\n' +
            '\n' +
            '<b>Reservations and pricing</b> (open for order on the Chinese site):\n' +
            '<table>\n' +
            '<tr><td>Performance</td><td>RMB 332,000 deposit / USD 50,000 deposit in the US</td></tr>\n' +
            '<tr><td>Thrust</td><td>About USD 250,000</td></tr>\n' +
            '<tr><td>Rocket</td><td>Invitation only</td></tr>\n' +
            '</table>\n' +
            'The whole car is expected in the USD 200,000–250,000 range; <b>final official pricing was not announced at the reveal</b>.\n' +
            '\n' +
            '<b>Production: 2028</b> (Texas Gigafactory). From the 2017 debut to production is roughly 11 years, the longest delay of any Tesla model.\n' +
            '\n' +
            'The reservation agreement is written cautiously: <b>a reservation does not constitute an order for the vehicle, either party may cancel, and any amount paid is refunded in full</b> — and Tesla cannot guarantee the actual delivery timing.\n' +
            '\n' +
            'Commercially, Morningstar classes it as a <b>“halo model”</b> with forecast annual sales of about 2,000 units — <b>its commercial value lies beyond volume, in the technology narrative</b>.',
          stats: {
            'Performance': { label: 'Performance', value: 'Two seats · <1.6 s · road' },
            'Thrust': { label: 'Thrust', value: 'Two seats · <0.9 s · track' },
            'Rocket': { label: 'Rocket', value: 'Single seat · <0.59 s · stunt' },
            '预计售价': {
              label: 'Expected price',
              value: 'USD 200,000–250,000 (not final)',
            },
            '量产时间': { label: 'Production start', value: '2028' },
          },
        },
      },
    },
  },
  steps: {
    's1-hood': {
      title: 'Disconnect power and confirm the high-voltage systems are discharged',
      body:
        'The first step in dismantling any electric vehicle is to cut power — but with this car it matters more than usual: traction battery plus a 600 L high-pressure gas storage system means <b>two high-voltage systems coexist</b>.\n' +
        '\n' +
        'After disconnecting the traction battery, the storage vessels still have to be depressurised. Carbon-fibre-wound cylinders stay pressurised through long periods of standing, so the depressurisation procedure has to be looked up by vessel serial number before anything is opened. <b>Note: this belongs on the first line of any teardown guide</b> — it is listed first here only because it is common sense, not because it is unimportant.',
      tools: ['Vehicle lift and body support fixtures', 'Torque wrench'],
      stats: {
        '储气系统': { label: 'Gas storage system', value: '600 L · about 250 kg' },
        '压力容器': { label: 'Pressure vessels', value: '2 carbon-fibre COPVs' },
        '高压系统数量': { label: 'High-voltage systems', value: '2 (battery + cylinders)' },
      },
    },
    's2-thruster': {
      title: 'Remove the body panels to expose the thruster bay',
      body:
        'With the body panels off, the rear thruster bay and the attitude-control nozzles around the body are exposed. This is the most distinctive part of the whole car: <b>the 4 main rear thrusters correspond to the “flip-up number plate” mechanism</b>, while the 6 around the body handle pitch, roll and yaw.\n' +
        '\n' +
        'The thing to watch most carefully during teardown is <b>the pipe routing</b>: a high-pressure manifold runs from the cylinders to the nozzles, and the wrong sequence leaves the vessels open to atmosphere. The high-pressure plumbing itself needs dedicated tooling.\n' +
        '\n' +
        '⚠️ Stated again for emphasis: <b>this entire step sequence is engineering inference, not a measured record</b>. The car is not yet in production and nobody has ever taken one apart.',
      tools: ['High-pressure vessel inspection equipment', 'Precision / pentalobe screwdriver'],
      stats: {
        '尾部主推进器': { label: 'Rear main thrusters', value: '4 units' },
        '周身姿控喷口': { label: 'Attitude-control nozzles', value: '6 units' },
        '总推力': { label: 'Rear thruster thrust (4 units)', value: '> 80 kN' },
      },
    },
    's3-tanks': {
      title: 'Carbon-fibre pressure vessel bank (600 L / 2 units)',
      body:
        '<b>Two</b> carbon-fibre-wound pressure vessels (COPVs), 600 L in total, holding about 250 kg of compressed air.\n' +
        '\n' +
        'The VP of Engineering’s words are worth remembering: <b>almost all the usable space inside the car is filled with the carbon-fibre pressure vessels</b>. That explains why the Rocket version is single-seat — the cylinders and the battery have eaten all the space.\n' +
        '\n' +
        'The specific strength of a filament-wound container is more than about 2× that of a steel bottle of the same weight, which is what allows it into a two-seat sports car. Storage pressure was <b>not disclosed</b> (the roughly 10,000 psi in media coverage is the 2017 claim, not restated at this reveal). Inspection and charging both need dedicated equipment, and high-pressure vessels on a road vehicle have <b>no current FMVSS compliance path</b>.',
      tools: [
        'Carbon-fibre pressure vessel charge/leak-test rig',
        'Precision / pentalobe screwdriver',
      ],
      stats: {
        '压力容器': { label: 'Pressure vessels', value: '2 COPVs' },
        '总储气': { label: 'Total stored gas', value: '600 L · about 250 kg' },
        '补充': { label: 'Refilling', value: 'The vehicle charges itself' },
      },
    },
    's4-battery': {
      title: 'Traction battery pack (capacity not disclosed)',
      body:
        'The main pack is the most counter-intuitive part of this generation: <b>range has been cut from roughly 1,000 km to roughly 483 km, and Tesla did not even publish the battery capacity</b> — voltage architecture, charge rate and cell supplier are all unknown.\n' +
        '\n' +
        'There is no official reason. The most reasonable inference is that <b>the roughly 250 kg of compressed air plus two COPVs ate into the battery’s space and weight budget</b>, so the battery shrank and the thrusters made the power back up. That is inference. The direction of the trade is unmistakable: <b>keep power and acceleration, drop range</b>.\n' +
        '\n' +
        'Thermal management is strengthened in turn — the dual cooling loops visible in the model express exactly that direction.',
      tools: ['Vehicle lift and body support fixtures', 'Anti-static tweezers'],
      stats: {
        '容量': { label: 'Capacity', value: 'Not disclosed' },
        '续航（2017）': { label: 'Range (2017)', value: 'About 1,000 km' },
        '续航（2026）': { label: 'Range (2026)', value: 'About 483 km' },
        '取舍': { label: 'Trade-off', value: 'Keep acceleration, drop range' },
      },
    },
    's5-powertrain': {
      title: 'Three motors and the reduction gearset',
      body:
        'One motor on the front axle, two on the rear. The rear pair can do <b>independent torque vectoring</b>, giving the left and right wheels different torque and actively cancelling yaw through a corner — half of the 2G lateral capability comes from this.\n' +
        '\n' +
        'That <b>10,000 N·m</b> has two traps: first, it is a <b>2017 claim that was not restated at this reveal</b>; second, it is the value <b>after the reduction gearing, at the wheel</b>, not motor output — the motors themselves are typically rated at only a few hundred N·m. Confusing the two is the most common mistake when reading this generation’s powertrain figures.\n' +
        '\n' +
        'Tesla’s own timer on stage recorded <b>0.81 s</b>, but the demo car’s kerb weight and battery configuration were both undisclosed.',
      tools: ['Vehicle lift and body support fixtures', 'Torque wrench'],
      stats: {
        '电机': { label: 'Motors', value: 'Three motors (1 front + 2 rear)' },
        '轮上扭矩': { label: 'Wheel torque', value: '10,000 N·m (2017 claim)' },
        '0–60 mph': { label: '0–60 mph', value: '< 0.59 s / 0.81 s measured' },
      },
    },
    's6-suction': {
      title: 'Ground-fan suction system',
      body:
        'The underbody fan set and diffuser plate. The core capability of the Performance version: <b>lateral acceleration of about 2G through corners</b>.\n' +
        '\n' +
        'The principle is to blow air downward under the car and use the reaction from the road surface to hold it down (Bernoulli downforce), not suction. The idea is common in motorsport, but using it on a production road car is a first — which is also why it faces <b>the regulatory question of whether a road car may generate downforce at all</b>.\n' +
        '\n' +
        'The on-stage demonstration shows the system is clearly aimed at track and stunt work: the Roadster climbed a curved ramp inverted, flipped in mid-air and landed held to a vertical wall.',
      tools: ['Vehicle lift and body support fixtures'],
      stats: {
        '横向加速度': { label: 'Lateral acceleration', value: 'About 2G' },
        '原理': { label: 'Principle', value: 'Underbody fans · Bernoulli downforce' },
        '演示': { label: 'Demonstrated', value: 'Inverted climb / mid-air flip' },
      },
    },
    's7-cabin': {
      title: 'Cabin and manual driving system',
      body:
        'The last layer: seats, a Y-shaped yoke in place of a steering wheel (steer-by-wire for steering, braking and throttle — no conventional steering wheel), a centre touchscreen plus two driver-facing displays.\n' +
        '\n' +
        'The point of this layer is not structural but <b>positional</b> — Musk states plainly that this is “the only manually driven Tesla in the long run”. As the product line moves fully to autonomy, a car that keeps manual driving while offering extreme performance carries a brand-totem function. Morningstar forecasts about 2,000 units a year, making it a halo model.',
      tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      stats: {
        '方向盘': { label: 'Steering', value: 'Y-shaped yoke · steer-by-wire' },
        'Performance / Thrust': { label: 'Performance / Thrust', value: 'Two seats' },
        'Rocket': { label: 'Rocket', value: 'Single seat' },
        '定位': { label: 'Positioning', value: 'The last manually driven Tesla' },
        '预计年销': { label: 'Forecast annual sales', value: 'About 2,000 units (Morningstar)' },
      },
    },
  },
};

export const roadster2MetaEn: SubjectMetaEn = {
  name: 'Tesla Roadster (second generation)',
  subtitle: 'Tesla · unveiled 2026-10-15 · SpaceX A71 cold-gas propulsion',
  tagline:
    '10 cold-gas thrusters, four of them above 80 kN, 0–60 mph in under 0.59 s — it really does fly',
};