/** 工具图鉴：拆解步骤里出现的工具，配一张实拍图 */

export interface ToolDef {
  id: string;
  name: string;
  image: string;
  note: string;
}

export const TOOLS: Record<string, ToolDef> = {
  screwdriver: {
    id: 'screwdriver',
    name: '精密 / 五角螺丝刀',
    image: './tools/screwdriver.jpg',
    note: 'Pentalobe、Tri-point、十字/一字批头。拆消费电子固定件的门槛工具，用错批头直接拧花螺丝。',
  },
  spudger: {
    id: 'spudger',
    name: '撬片 · 撬棒 · 吸盘',
    image: './tools/spudger.jpg',
    note: '开胶合面板三件套。塑料件不会划伤玻璃与涂层；吸盘先拉出缝，撬片再滑着走。',
  },
  heat: {
    id: 'heat',
    name: '加热台 / 热风枪',
    image: './tools/heat.jpg',
    note: '软化结构胶与防水胶。温度不够就硬撬，OLED 与后盖玻璃必裂——这一层是"耐心税"。',
  },
  tweezers: {
    id: 'tweezers',
    name: '防静电镊子',
    image: './tools/tweezers.jpg',
    note: '夹排线、取小件。避免手汗污染焊盘，也避免静电击穿 MOS 器件。',
  },
  torque: {
    id: 'torque',
    name: '扭矩扳手',
    image: './tools/torque.jpg',
    note: '按标定扭矩复紧。过紧会拉伤螺纹、压坏密封面；底盘件松了则是安全事故。',
  },
  lift: {
    id: 'lift',
    name: '汽车举升机',
    image: './tools/lift.jpg',
    note: '两柱 / 四柱举升。拆底盘、行走系统与后置动力总成的前提条件。',
  },
  hoist: {
    id: 'hoist',
    name: '发动机吊装架',
    image: './tools/hoist.jpg',
    note: '把动力总成从机舱或车尾整体吊出。吊点与支撑点必须按手册标定，否则会伤到车身结构。',
  },
  rework: {
    id: 'rework',
    name: 'BGA 热风返修台',
    image: './tools/rework.jpg',
    note: '受控升温拆焊芯片级封装。只用于失效分析与良率分析，量产线上不拆。',
  },
  ndt: {
    id: 'ndt',
    name: 'X-Ray 无损检测',
    image: './tools/ndt.jpg',
    note: '不开件就能看内部缺陷。航天结构件与电子产线质检的标配手段。',
  },
  probe: {
    id: 'probe',
    name: '探针台 / 显微镜',
    image: './tools/probe.jpg',
    note: 'die 级电性测试与失效定位。到了这一层，"修"已经变成"分析"。',
  },
};

/** 关键词 → 图鉴条目。顺序即优先级（"热风返修台"要归 rework 而不是 heat） */
const TOOL_MATCHERS: { id: string; keys: string[] }[] = [
  { id: 'rework', keys: ['返修台', 'BGA', '开盖', '开封'] },
  { id: 'ndt', keys: ['无损检测', 'X-Ray', '检测'] },
  { id: 'probe', keys: ['探针台', '显微镜', 'SEM', 'FIB', '层析'] },
  { id: 'lift', keys: ['举升机'] },
  { id: 'hoist', keys: ['吊装', '吊架', '吊出'] },
  { id: 'torque', keys: ['扭矩'] },
  { id: 'heat', keys: ['加热', '热风'] },
  { id: 'tweezers', keys: ['镊子'] },
  { id: 'spudger', keys: ['撬片', '撬棒', '吸盘'] },
  { id: 'screwdriver', keys: ['螺丝刀'] },
];

/** 把步骤里的自由文本工具名映射到图鉴条目 */
export function toolIdFor(text: string): string | undefined {
  for (const m of TOOL_MATCHERS) {
    if (m.keys.some((k) => text.includes(k))) return m.id;
  }
  return undefined;
}

/** 收集一组步骤涉及的全部图鉴工具（去重，保持出现顺序） */
export function toolsForSteps(steps: { tools?: string[] }[]): ToolDef[] {
  const seen = new Set<string>();
  const out: ToolDef[] = [];
  for (const s of steps) {
    s.tools?.forEach((t) => {
      const id = toolIdFor(t);
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push(TOOLS[id]);
      }
    });
  }
  return out;
}
