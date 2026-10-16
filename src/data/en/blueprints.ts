/**
 * 蓝图库英文覆盖层（与 subjects/en 同一套思路）
 *
 * 蓝图是"任意产品"离线模板的数据源，12 个类别、63 个层全是中文硬编码。
 * 这里按 **蓝图 label +层 id** 做锚点提供英文，缺项自动回退中文。
 *
 * 为什么不直接把 BLUEPRINTS 改成双语字段：那12 个类别 × 每类 5-7 层的
 * 正文与 stats 全要改，diff 会把几何参数（pieces）也卷进来。
 * 覆盖层把"文案"与"几何"彻底分开，改文案不会碰到任何 shape/size/pos。
 */

export interface BlueprintLayerEn {
  name: string;
  group?: string;
  body?: string;
  /** 中文 label → 英文 label */
  stats?: Record<string, string>;
  stepTitle?: string;
  /** 工具名换成 tools.ts 的规范英文名，图鉴才匹配得上 */
  tools?: string[];
}

export interface BlueprintEn {
  label: string;
  layers: Record<string, BlueprintLayerEn>;
}

/** key = 蓝图的中文 label（例如 '智能手机'） */
export const BLUEPRINT_EN: Record<string, BlueprintEn> = {
  智能手机: {
    label: 'Smartphone',
    layers: {
      screen: {
        name: 'Display assembly',
        group: 'Display',
        body:
          'The outermost layer is the bonded display assembly: OLED panel + touch layer + cover glass. It has to be opened by heating to soften the structural adhesive — prying cold will crack it.',
        stats: { 拆解难度: 'High (bonded)', 复用性: 'Poor' },
        stepTitle: 'Heat to soften the edge adhesive, then lift with a suction cup',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      frame: {
        name: 'Mid-frame',
        group: 'Structure',
        body:
          'The metal mid-frame carries structural strength and heat dissipation, and doubles as the antenna and button carrier. On most models the teardown effectively starts here.',
        stats: { 材质: 'Aluminium / steel / titanium', 作用: 'Structure + cooling + antenna' },
        stepTitle: 'Remove the retaining screws and separate the mid-frame',
        tools: ['Precision / pentalobe screwdriver'],
      },
      board: {
        name: 'Logic board',
        group: 'Electronics',
        body:
          'The board consolidates the SoC, memory, power management and RF into one piece. Modern designs use stacking and side-by-side packaging to save board area.',
        stats: { 核心: 'SoC + memory', 维修性: 'Whole-board replacement' },
        stepTitle: 'Disconnect the display and battery flexes, then lift the board out',
        tools: ['Anti-static tweezers', 'Precision / pentalobe screwdriver'],
      },
      battery: {
        name: 'Battery',
        group: 'Energy',
        body:
          'A lithium-polymer pouch cell. Pull it out using the stretch-release tabs rather than prying — a puncture turns it into a fire source. This is the first safety red line of any phone teardown.',
        stats: { 类型: 'Li-polymer pouch', 取出方式: 'Stretch-release tab' },
        stepTitle: 'Pull the release tabs slowly until the cell is free',
        tools: ['Spudger / pry tool / suction cup'],
      },
      camera: {
        name: 'Camera module',
        group: 'Optics',
        body:
          'All cameras sit on a shared metal baseplate and come away as one unit. The lenses are optically aligned at the factory — do not loosen them individually.',
        stats: { 维护性: 'Replace as a group', 对齐: 'Factory calibrated' },
        stepTitle: 'Disconnect the camera flexes and lift the whole module out',
        tools: ['Anti-static tweezers'],
      },
      cooling: {
        name: 'Thermal module',
        group: 'Thermal',
        body:
          'Graphite sheets and a vapour chamber spread the SoC heat over a larger area. It is stuck down with thermal adhesive, so it is effectively single-use after removal.',
        stats: { 形式: 'Vapour chamber + graphite', 复用性: 'Single-use' },
        stepTitle: 'Apply solvent under the thermal module and work the adhesive loose',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      back: {
        name: 'Rear cover',
        group: 'Structure',
        body:
          'The rear cover is bonded with a ring of structural adhesive and needs heat plus slow prying. The wireless charging coil and NFC antenna are often attached to its inner face.',
        stats: { 材质: 'Glass / vegan leather / metal', 拆后复用: 'Largely not reusable' },
        stepTitle: 'Heat the perimeter, cut the adhesive, then lift the cover',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
    },
  },

  笔记本电脑: {
    label: 'Laptop',
    layers: {
      display: {
        name: 'Display and A-side',
        group: 'Display',
        body:
          'The A-side and display come away as one assembly. The flex cables run through the hinge, which is the most commonly torn part in a laptop teardown.',
        stats: { 易损点: 'Hinge flex', 维修性: 'Whole-panel replacement' },
        stepTitle: 'Remove the hinge covers, disconnect the display flexes, lift the panel',
        tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
      },
      keyboard: {
        name: 'Keyboard deck (C-side)',
        group: 'Input',
        body:
          'The C-side carries the keyboard, trackpad and power button, and connects to the board over ribbon cables in most designs.',
        stats: { 连接: 'Ribbon cable', 注意: 'ZIF latches break easily' },
        stepTitle: 'Release the ribbon latches and lift off the keyboard deck',
        tools: ['Spudger / pry tool / suction cup', 'Anti-static tweezers'],
      },
      board: {
        name: 'Logic board',
        group: 'Electronics',
        body:
          'Laptop boards are less densely integrated than phones: the CPU and GPU are often independently replaceable, and memory and SSD are usually pluggable.',
        stats: { 可升级件: 'Memory / SSD', 可更换件: 'CPU / GPU (on some models)' },
        stepTitle: 'Remove the fan, coolers and M.2 covers, then lift out the board',
        tools: ['Precision / pentalobe screwdriver'],
      },
      cooling: {
        name: 'Cooling module',
        group: 'Thermal',
        body:
          'Heat pipes and fans move heat to the exhaust. Dust cleaning and fresh thermal paste are the most common — and most worthwhile — laptop maintenance.',
        stats: { 维护项: 'Dust clean / repaste', 周期: 'Every 1–2 years' },
        stepTitle: 'Undo the fan and heatsink screws in sequence and lift the module',
        tools: ['Precision / pentalobe screwdriver'],
      },
      battery: {
        name: 'Battery',
        group: 'Energy',
        body:
          'An internal lithium-polymer cell whose runtime drops sharply once it ages. Disconnect power before replacing it, and never puncture the pouch.',
        stats: { 类型: 'Li-polymer', 衰减信号: 'Runtime collapse / swelling' },
        stepTitle: 'Disconnect the battery connector before anything else',
        tools: ['Spudger / pry tool / suction cup', 'Anti-static tweezers'],
      },
      base: {
        name: 'Bottom cover (D-side)',
        group: 'Structure',
        body:
          'The last layer is the bottom cover, which also handles airflow and carries the feet. Once it is off, a full dust clean is due.',
        stats: { 作用: 'Protection + intake', 可换件: 'Feet' },
        stepTitle: 'Remove all bottom screws, then release the cover clips',
        tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
      },
    },
  },

  无人机: {
    label: 'Drone',
    layers: {
      body: {
        name: 'Airframe and arms',
        group: 'Structure',
        body:
          'The arms are folding carbon-fibre structures. If one cracks it is replaced as a complete part — carbon fibre is light and stiff, but it cannot be welded.',
        stats: { 机臂: 'Folding carbon fibre', 维修: 'Replace the part' },
        stepTitle: 'Separate the arms from the body and release their wiring',
        tools: ['Precision / pentalobe screwdriver'],
      },
      motors: {
        name: 'Motors and propellers',
        group: 'Propulsion',
        body:
          'Brushless motors are consumables. After a crash the usual call is replace-donot-repair — a single motor costs far less than a rebuild.',
        stats: { 数量: '4 brushless', 策略: 'Replace, do not repair' },
        stepTitle: 'Unscrew the props counter-clockwise, then remove the motor bells',
        tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      },
      gimbal: {
        name: 'Gimbal camera',
        group: 'Optics',
        body:
          'The gimbal is the most precision assembly on the aircraft, stabilising across three axes. Disconnect the flex before loosening the dampers — forcing it destroys the stabilisation motors.',
        stats: { 轴数: 'Three-axis', 维修性: 'Replace as a group' },
        stepTitle: 'Disconnect the gimbal flex, then release the damper mounts',
        tools: ['Anti-static tweezers', 'Precision / pentalobe screwdriver'],
      },
      sensor: {
        name: 'Image sensor',
        group: 'Optics',
        body:
          'Sensor-to-lens alignment has to be held to optical precision, which makes this a no-field-service part.',
        stats: { 维护性: 'Not field-serviceable', 对位: 'Optical grade' },
        stepTitle: 'Note the sensor position before removing the mount',
        tools: ['Anti-static tweezers'],
      },
      board: {
        name: 'Flight controller and link',
        group: 'Electronics',
        body:
          'The flight controller handles attitude control while the link board handles the video and control link. The two are usually one combined board.',
        stats: { 功能: 'Control + video link', 散热: 'Depends on model' },
        stepTitle: 'Remove the heatsink and disconnect the antennas',
        tools: ['Precision / pentalobe screwdriver', 'Heating pad / heat gun'],
      },
      battery: {
        name: 'Flight battery',
        group: 'Energy',
        body:
          'An intelligent battery pack with a BMS. Never leave it in a discharged state, and check the cell for swelling before reuse.',
        stats: { 类型: 'Li-polymer with BMS', 风险: 'Swelling / deep discharge' },
        stepTitle: 'Press the release, slide the pack out and cover the terminals',
        tools: [],
      },
    },
  },

  汽车: {
    label: 'Automobile',
    layers: {
      body: {
        name: 'Body and exterior',
        group: 'Structure',
        body:
          'The body carries the crash structure and defines the exterior. On a real vehicle it is a structural repair item, not a service part.',
        stats: { 作用: 'Crash structure + styling', 修复: 'Body shop' },
        stepTitle: 'Work on a lift and remove the trim and wheel arch liners',
        tools: ['Vehicle lift', 'Precision / pentalobe screwdriver'],
      },
      wheels: {
        name: 'Wheels and brakes',
        group: 'Running gear',
        body:
          'Wheels and brakes are wear items with defined service intervals. The brake rotor and pad pair should always be replaced together.',
        stats: { 类型: 'Brake disc + pad', 周期: 'By mileage / wear' },
        stepTitle: 'Loosen the wheel bolts and remove the wheel',
        tools: ['Torque wrench', 'Vehicle lift'],
      },
      suspension: {
        name: 'Suspension',
        group: 'Running gear',
        body:
          'Suspension geometry is a safety-critical alignment. Spring and damper units are replaced as assemblies, and alignment is checked afterwards.',
        stats: { 类型: 'MacPherson / multi-link', 关键: 'Alignment after replacement' },
        stepTitle: 'Support the corner, then undo the damper bolts',
        tools: ['Vehicle lift', 'Torque wrench'],
      },
      powertrain: {
        name: 'Powertrain',
        group: 'Propulsion',
        body:
          'The engine or motor unit plus its transmission. Access requires a lift and engine hoist, and must follow the manual lift points.',
        stats: { 类型: 'Engine / motor + gearbox', 关键: 'Use specified lift points' },
        stepTitle: 'Drain the fluids, disconnect the ancillaries, then hoist the unit out',
        tools: ['Vehicle lift', 'Engine hoist'],
      },
      battery: {
        name: 'Traction battery (if EV)',
        group: 'Energy',
        body:
          'A high-voltage pack with its own BMS and contactors. It is serviced by trained HV technicians only — this is not a general workshop part.',
        stats: { 电压: 'Typically 400–800 V', 安全: 'HV-qualified technicians only' },
        stepTitle: 'Isolate the pack at the service disconnect before any work',
        tools: ['Anti-static tweezers', 'X-ray NDT'],
      },
      interior: {
        name: 'Interior and harness',
        group: 'Cabin',
        body:
          'Trim, harness and module carriers. Harness routing clips are fragile and are a common source of rattles after repair.',
        stats: { 组成: 'Trim + harness + modules', 注意: 'Clip routing' },
        stepTitle: 'Remove trim clips and release harness retainers',
        tools: ['Spudger / pry tool / suction cup'],
      },
    },
  },

  半导体器件: {
    label: 'Semiconductor package',
    layers: {
      package: {
        name: 'Package assembly',
        group: 'Package',
        body:
          'The complete package as it ships: moulding compound, substrate and heat spreader. Non-destructive inspection is used to find delamination before any cross-sectioning.',
        stats: { 检查: 'X-ray first', 破坏性: 'Cross-section only if needed' },
        stepTitle: 'Start with X-ray inspection rather than decapsulation',
        tools: ['X-ray NDT'],
      },
      substrate: {
        name: 'Package substrate',
        group: 'Package',
        body:
          'The organic or inorganic substrate that carries the die-to-board connections and distributes power. Warpage here causes early thermal failure.',
        stats: { 类型: 'Organic / inorganic', 风险: 'Warpage' },
        stepTitle: 'Note the substrate stack-up before sectioning',
        tools: ['X-ray NDT', 'Probe station / microscope'],
      },
      interposer: {
        name: 'Silicon interposer',
        group: 'Interconnect',
        body:
          'A silicon bridge that provides dense high-speed routing between dies. It is the enabling structure behind large chiplet designs.',
        stats: { 作用: 'High-density routing', 工艺: 'Advanced packaging' },
        stepTitle: 'Map the interposer routing with X-ray before cutting',
        tools: ['X-ray NDT'],
      },
      dies: {
        name: 'Compute and I/O dies',
        group: 'Core',
        body:
          'The compute and I/O dies bonded to the interposer or substrate. Failure localisation at this level is analysis work, not repair.',
        stats: { 功能: 'Compute + I/O', 定位: 'Probe / EM analysis' },
        stepTitle: 'Localise the failing die with probe or emission microscopy',
        tools: ['Probe station / microscope', 'BGA rework station'],
      },
      memory: {
        name: 'Memory stack',
        group: 'Memory',
        body:
          'Stacked DRAM or HBM connected to the compute die through the interposer or a hybrid-bond stack. Heat and warpage are the dominant failure modes.',
        stats: { 类型: 'HBM / DRAM stack', 失效: 'Heat + warpage' },
        stepTitle: 'Inspect the stack for voids and delamination',
        tools: ['X-ray NDT', 'Probe station / microscope'],
      },
    },
  },

  智能手表: {
    label: 'Smartwatch',
    layers: {
      case: {
        name: 'Case',
        group: 'Structure',
        body:
          'The case carries the display, crown and sensors while defining water resistance. Adhesives do most of the structural work here.',
        stats: { 作用: 'Structure + sealing', 密封: 'Adhesive-dependent' },
        stepTitle: 'Heat the case and lift the display to reach the interior',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      display: {
        name: 'Display',
        group: 'Display',
        body:
          'A small curved display bonded to the case with its own adhesive layer, and usually integrated with the touch digitiser.',
        stats: { 类型: 'OLED with touch', 更换: 'Display assembly' },
        stepTitle: 'Lift the display assembly carefully to avoid tearing the flex',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      board: {
        name: 'Logic board',
        group: 'Electronics',
        body:
          'A highly integrated board carrying the SoC, radio and power management. The RF and GPS sections are usually under metal shields.',
        stats: { 集成: 'SoC + radio + PMIC', 屏蔽: 'RF shield cans' },
        stepTitle: 'Remove the shields with a hot air station and lift the board',
        tools: ['BGA rework station', 'Anti-static tweezers'],
      },
      battery: {
        name: 'Battery',
        group: 'Energy',
        body:
          'A very small pouch cell. Watch batteries are a common choking and ingestion hazard — keep them away from children.',
        stats: { 类型: 'Li-polymer pouch', 安全: 'Ingestion hazard' },
        stepTitle: 'Discharge the cell, then release the adhesive and lift it out',
        tools: ['Spudger / pry tool / suction cup'],
      },
      sensor: {
        name: 'Health sensors',
        group: 'Sensing',
        body:
          'Optical heart-rate and SpO2 sensors plus the IMU, mounted on the case underside. They rely on an optical window that must stay clean and undamaged.',
        stats: { 类型: 'PPG + SpO2 + IMU', 依赖: 'Optical window' },
        stepTitle: 'Release the sensor module from the case underside',
        tools: ['Anti-static tweezers'],
      },
      strap: {
        name: 'Strap',
        group: 'Structure',
        body:
          'The strap uses quick-release pins and is the intended user-serviceable part. Quick-release designs are the baseline for user-replaceable straps.',
        stats: { 连接: 'Quick-release pins', 可换: 'User-serviceable' },
        stepTitle: 'Press the spring-bar tool into the lug and slide the strap out',
        tools: ['Spudger / pry tool / suction cup'],
      },
    },
  },

  '相机 / 镜头': {
    label: 'Camera / lens',
    layers: {
      body: {
        name: 'Body and exterior',
        group: 'Structure',
        body:
          'The body carries the mount, sensor chamber and weather sealing. The sensor chamber must stay clean — a speck of dust here ruins every frame.',
        stats: { 作用: 'Mount + sealing', 关键: 'Sensor chamber cleanliness' },
        stepTitle: 'Remove the baseplate screws and lift the exterior shell',
        tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      },
      sensor: {
        name: 'Image sensor (CMOS)',
        group: 'Optics',
        body:
          'The sensor plus its low-noise analogue front-end. It is mounted on a shake-proof frame in most bodies and must be handled as an assembly.',
        stats: { 类型: 'CMOS with analogue front-end', 防抖: 'On a sprung frame' },
        stepTitle: 'Release the frame screws and lift the sensor assembly',
        tools: ['Anti-static tweezers', 'Precision / pentalobe screwdriver'],
      },
      lens: {
        name: 'Lens groups',
        group: 'Optics',
        body:
          'Multiple cemented and floating groups with aperture blades. Focus and aperture are driven by their own mechanisms behind the mount.',
        stats: { 结构: 'Cemented + floating groups', 对焦: 'Separate mechanism' },
        stepTitle: 'Remove the mount ring and withdraw the optical block',
        tools: ['Precision / pentalobe screwdriver'],
      },
      viewfinder: {
        name: 'Viewfinder and display',
        group: 'Display',
        body:
          'The EVF or optical finder plus rear screen, each with its own flex and driver. OLED panels need heat to release their adhesive.',
        stats: { 取景: 'EVF or optical', 屏幕: 'OLED with adhesive' },
        stepTitle: 'Heat and lift the rear screen, then access the viewfinder module',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      board: {
        name: 'Board and image processor',
        group: 'Electronics',
        body:
          'The main board carries the image processor and storage. Storage is soldered on most bodies and rarely user-upgradeable.',
        stats: { 核心: 'Image processor', 存储: 'Soldered on most models' },
        stepTitle: 'Remove the boards, then desolder the storage if replacement is needed',
        tools: ['BGA rework station', 'X-ray NDT'],
      },
      battery: {
        name: 'Battery and storage',
        group: 'Energy',
        body:
          'One or more Li-ion cells plus the storage module. Cells bulge with age, so check for swelling before applying any force.',
        stats: { 类型: 'Li-ion', 注意: 'Check for swelling' },
        stepTitle: 'Isolate the battery, then remove the storage module',
        tools: ['Heating pad / heat gun', 'BGA rework station'],
      },
    },
  },

  游戏主机: {
    label: 'Game console',
    layers: {
      shell: {
        name: 'Shell and top cover',
        group: 'Structure',
        body:
          'The outer shell and top cover set the console footprint and airflow path. Plastic clips break easily, so work from the seam with a plastic tool.',
        stats: { 作用: 'Structure + airflow', 风险: 'Fragile clips' },
        stepTitle: 'Undo the rear screws, then release the shell clips from the seam',
        tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
      },
      drive: {
        name: 'Optical drive / digital',
        group: 'Storage',
        body:
          'The optical drive on disc editions. It is a large, heavy module and is the usual reason a console teardown starts from the base rather than the top.',
        stats: { 类型: 'Optical drive or none', 重量: 'Large module' },
        stepTitle: 'Lift the drive out before freeing the main board',
        tools: ['Precision / pentalobe screwdriver'],
      },
      board: {
        name: 'Board and APU',
        group: 'Electronics',
        body:
          'The motherboard carries the APU and memory. It sits under a heatsink and, in liquid-cooled models, a water block.',
        stats: { 核心: 'APU + memory', 散热: 'Heatpipe or water block' },
        stepTitle: 'Remove the heatsink or water block, then lift the board',
        tools: ['Precision / pentalobe screwdriver', 'BGA rework station'],
      },
      cooling: {
        name: 'Cooling module',
        group: 'Thermal',
        body:
          'A heatpipe or liquid-cooling loop. The thermal interface is pasted and effectively single-use — plan to repaste during reassembly.',
        stats: { 形式: 'Heatpipe or liquid loop', 接口: 'Thermal paste' },
        stepTitle: 'Unbolt the cold plate in sequence and lift the module straight up',
        tools: ['Precision / pentalobe screwdriver'],
      },
      power: {
        name: 'Power supply',
        group: 'Energy',
        body:
          'The internal PSU. It is a mains-voltage assembly and the first thing to discharge before any internal work.',
        stats: { 输入: 'Mains AC', 安全: 'Disconnect mains first' },
        stepTitle: 'Unplug the mains cable and discharge before opening the console',
        tools: ['Torque wrench', 'Anti-static tweezers'],
      },
      io: {
        name: 'Ports and controller',
        group: 'Input',
        body:
          'Rear I/O, front ports and the wireless controller. Port boards are separate modules that can be replaced independently.',
        stats: { 组成: 'Rear I/O + front ports + pad', 可换: 'Independent modules' },
        stepTitle: 'Release the port boards and the controller shell',
        tools: ['Precision / pentalobe screwdriver'],
      },
    },
  },

  '耳机 / 音箱': {
    label: 'Headphones / speaker',
    layers: {
      housing: {
        name: 'Housing and shell',
        group: 'Structure',
        body:
          'The enclosure and ear cups. Acoustic chambers depend on their gasket geometry, so it is a stress-bearing part during disassembly.',
        stats: { 作用: 'Acoustic chamber', 风险: 'Gasket sealing' },
        stepTitle: 'Remove the cushions and then the housing fasteners',
        tools: ['Spudger / pry tool / suction cup', 'Precision / pentalobe screwdriver'],
      },
      driver: {
        name: 'Driver units',
        group: 'Acoustics',
        body:
          'The dynamic drivers, each with voice coil and magnet. Glue holds the diaphragm edge, so the driver is not intended to be dismantled.',
        stats: { 类型: 'Dynamic driver', 可拆: 'Not intended' },
        stepTitle: 'Release the driver gasket and lift the unit from the chamber',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
      anc: {
        name: 'ANC and microphones',
        group: 'Acoustics',
        body:
          'Feed-forward and feedback microphones plus the processing path. Feed-forward mics sit behind sealed mesh, so the seal must be preserved.',
        stats: { 类型: 'FF + FB microphones', 密封: 'Mesh-gasket dependent' },
        stepTitle: 'Lift the microphone module without disturbing the mesh seals',
        tools: ['Anti-static tweezers'],
      },
      board: {
        name: 'Board and Bluetooth',
        group: 'Electronics',
        body:
          'The main board carries the Bluetooth SoC, DAC and battery charging. It is usually a single-sided board bonded inside the housing.',
        stats: { 核心: 'BT SoC + DAC', 充电: 'On board' },
        stepTitle: 'Remove the board, then desolder the battery if replacing it',
        tools: ['BGA rework station', 'Heating pad / heat gun'],
      },
      battery: {
        name: 'Battery',
        group: 'Energy',
        body:
          'A small Li-polymer cell, often bonded rather than screwed. Puncturing it is a fire risk, so work at the edges.',
        stats: { 类型: 'Li-polymer pouch', 风险: 'Puncture = fire' },
        stepTitle: 'Work solvent under the cell and lift it without flexing',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
    },
  },

  家用电器: {
    label: 'Home appliance',
    layers: {
      shell: {
        name: 'Shell and control panel',
        group: 'Structure',
        body:
          'The outer shell and control panel. Appliance housings use threaded fasteners rather than clips, which makes disassembly slower but safer.',
        stats: { 固定: 'Threaded fasteners', 风险: 'Live mains inside' },
        stepTitle: 'Unplug the mains lead before removing any fasteners',
        tools: ['Precision / pentalobe screwdriver', 'Torque wrench'],
      },
      core: {
        name: 'Core assembly',
        group: 'Actuation',
        body:
          'The functional core — heating element, compressor or drive motor depending on the product. This is the part that defines the product class.',
        stats: { 类型: 'Heater / compressor / motor', 定位: 'Defines the class' },
        stepTitle: 'Isolate the core assembly and release its mounting brackets',
        tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      },
      tank: {
        name: 'Tank and water path',
        group: 'Vessel',
        body:
          'The water or fluid vessel and its path. Scale and residue build up here and are the main reason a deep clean is worthwhile.',
        stats: { 类型: 'Tank + path', 问题: 'Scale and residue' },
        stepTitle: 'Descale the path before removing the tank assembly',
        tools: ['Anti-static tweezers'],
      },
      board: {
        name: 'Control board and power supply',
        group: 'Electronics',
        body:
          'The control board plus mains-side power supply. Live mains is present on the primary side, so this stays closed for most work.',
        stats: { 控制: 'Main board', 电源: 'Mains-side SMPS' },
        stepTitle: 'Do not open the power supply; test at the board instead',
        tools: ['X-ray NDT', 'Probe station / microscope'],
      },
      fan: {
        name: 'Airflow and cooling',
        group: 'Thermal',
        body:
          'Fans and ducting that move air through the appliance. A blocked airflow path is the most common cause of overheating faults.',
        stats: { 组成: 'Fans + ducting', 常见故障: 'Blocked airflow' },
        stepTitle: 'Clear the duct and note fan rotation direction before removal',
        tools: ['Anti-static tweezers'],
      },
    },
  },

  电动交通: {
    label: 'Electric mobility',
    layers: {
      frame: {
        name: 'Frame and bodywork',
        group: 'Structure',
        body:
          'The frame carries the battery and motor. Alignment matters here — a bent mounting point shows up as handling problems long before anything fails.',
        stats: { 作用: 'Structure + mounting', 关键: 'Mount alignment' },
        stepTitle: 'Support the frame and check mounting points for distortion',
        tools: ['Torque wrench', 'Vehicle lift'],
      },
      motor: {
        name: 'Motor or hub',
        group: 'Propulsion',
        body:
          'Mid-drive motors sit in the frame; hub motors sit in the wheel. Hub motors complicate wheel removal, which is why mid-drive is easier to service.',
        stats: { 类型: 'Mid-drive or hub', 差异: 'Hub complicates wheel removal' },
        stepTitle: 'Remove the motor mounts and lift the unit out',
        tools: ['Torque wrench', 'Anti-static tweezers'],
      },
      battery: {
        name: 'Battery pack',
        group: 'Energy',
        body:
          'A high-voltage pack with a BMS. It is heavy and it is a fire risk if punctured, so it gets its own handling procedure.',
        stats: { 电压: 'Typically 36–48 V', 风险: 'Puncture = fire' },
        stepTitle: 'Isolate the pack at its disconnect before any other work',
        tools: ['Anti-static tweezers'],
      },
      controller: {
        name: 'Controller',
        group: 'Electronics',
        body:
          'The motor controller, usually potted or finned for heat dissipation. Firmware settings are lost when it is replaced.',
        stats: { 作用: 'Motor control', 注意: 'Firmware settings lost on swap' },
        stepTitle: 'Photograph the connector pinout before removing the controller',
        tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      },
      brake: {
        name: 'Brakes and wheelset',
        group: 'Running gear',
        body:
          'Brakes, rotors and the wheelset. Rotor wear and pad condition set the service interval, and contaminated pads are a safety issue.',
        stats: { 组成: 'Rotors + pads + wheels', 安全: 'Contamination check' },
        stepTitle: 'Check rotor thickness and pad condition before disassembly',
        tools: ['Torque wrench'],
      },
    },
  },

  通用设备: {
    label: 'Generic device',
    layers: {
      shell: {
        name: 'Outer shell',
        group: 'Structure',
        body:
          'The outer enclosure, usually a snap-fit plastic shell held together with a small number of screws.',
        stats: { 结构: 'Snap-fit + screws', 风险: 'Fragile clips' },
        stepTitle: 'Remove the screws, then work the seam with a plastic tool',
        tools: ['Precision / pentalobe screwdriver', 'Spudger / pry tool / suction cup'],
      },
      core: {
        name: 'Core assembly',
        group: 'Actuation',
        body:
          'The functional core of the device. Its exact form depends on the product class.',
        stats: { 类型: 'Class dependent', 说明: 'Schematic' },
        stepTitle: 'Isolate the core assembly from the shell',
        tools: ['Anti-static tweezers'],
      },
      board: {
        name: 'Control board',
        group: 'Electronics',
        body:
          'The control board carrying the MCU, regulators and any interface ICs.',
        stats: { 核心: 'MCU + regulators', 说明: 'Schematic' },
        stepTitle: 'Disconnect the board and lift it out',
        tools: ['Precision / pentalobe screwdriver', 'Anti-static tweezers'],
      },
      battery: {
        name: 'Battery',
        group: 'Energy',
        body:
          'The power cell, if the product is battery powered. Treat every unknown cell as a fire hazard.',
        stats: { 类型: 'Class dependent', 安全: 'Treat as a hazard' },
        stepTitle: 'Isolate the battery before any other work',
        tools: ['Spudger / pry tool / suction cup'],
      },
      thermal: {
        name: 'Thermals',
        group: 'Thermal',
        body:
          'Any heat spreading or insulating material present. Thermal parts are usually single-use once disturbed.',
        stats: { 形式: 'Class dependent', 复用: 'Single-use' },
        stepTitle: 'Remove thermal material gently and plan to replace it',
        tools: ['Heating pad / heat gun', 'Spudger / pry tool / suction cup'],
      },
    },
  },
};

/** 兜底：类别未知时用通用设备的中文/英文分类名 */
export const GENERIC_GROUP_EN = 'Structure';
