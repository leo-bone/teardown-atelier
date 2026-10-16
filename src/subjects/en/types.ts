/**
 * 英文内容覆盖层（English content overlay）
 *
 * 为什么用"覆盖层"而不是把主体文件改成中英双语字段：
 * 8 个主体文件合计 ~5900 行、大部分是几何构建代码。为了加一种语言就把它们
 * 全部重写成双语字段，diff 会淹没真正的模型改动，也很难review。
 *
 * 这里的做法是：中文主体文件保持唯一事实来源，英文作为**可选覆盖层**单独存放，
 * 渲染前merge 一次。好处：
 *  - 缺翻译自动回退中文，页面永远不会出现空洞
 *  - 新增主体不需要动任何 i18n 代码
 *  - 几何代码与文案彻底解耦，翻译改动不会碰到 build() 实现
 *
 * 所有 key 用「中文原文」或「稳定 id」做锚点，不依赖数组下标——
 * 下标对位是最容易在改文案时静默错位的方式。
 */

/**
 * 单个数据点的覆盖项。
 * 只给 label 时保留中文 value；value 里带中文说明的（如「350 mm 通风盘」）必须一起覆盖，
 * 否则英文界面会中英混排。
 */
export interface EnCell {
  label?: string;
  value?: string;
  /** headline 的单位也可能含中文（如「亿」「英寸」），需要时一并覆盖 */
  unit?: string;
}

/**
 * label → 覆盖项。两种写法都合法：
 *   stats: { '厚度': 'Thickness' }                       // 简写：只翻label，value 保留
 *   stats: { '盘径': { label: 'Disc dia.', value: '350 mm' } }  // 完整：value 里含中文时必须用这种
 * 数值型 value（'0.55 mm'、'480 PS'）用简写即可，不必重复写一遍。
 */
export type EnLabelMap = Record<string, string | EnCell>;

/** 取label 的便捷函数，兼容两种写法 */
export function enLabel(map: EnLabelMap | undefined, zhLabel: string): string | undefined {
  const v = map?.[zhLabel];
  if (v === undefined) return undefined;
  return typeof v === 'string' ? v : (v.label ?? undefined);
}

/** 取 value 的便捷函数；未覆盖时返回 undefined 表示"沿用中文" */
export function enValue(map: EnLabelMap | undefined, zhLabel: string): string | undefined {
  const v = map?.[zhLabel];
  if (v === undefined || typeof v === 'string') return undefined;
  return v.value;
}

/** 取 unit 的便捷函数 */
export function enUnit(map: EnLabelMap | undefined, zhLabel: string): string | undefined {
  const v = map?.[zhLabel];
  if (v === undefined || typeof v === 'string') return undefined;
  return v.unit;
}

export interface EnHotspot {
  title: string;
  body: string;
  stats?: EnLabelMap;
}

/** 层 id → 英文层名与热点文案 */
export interface EnLayer {
  name: string;
  group?: string;
  /** hotspot id → 英文热点 */
  hotspots?: Record<string, EnHotspot>;
}

/** 步骤 id → 英文步骤文案 */
export interface EnStep {
  title: string;
  body: string;
  stats?: EnLabelMap;
  /** 工具名用 tools.ts 里的规范英文名，保证图鉴能匹配上 */
  tools?: string[];
}

export interface EnSpecCell {
  label?: string;
  value?: string;
  note?: string;
}
export interface EnComparisonRow {
  prev?: string;
  curr?: string;
}

/** 一个主体的完整英文覆盖层 */
export interface SubjectEn {
  name: string;
  subtitle: string;
  tagline: string;
  overview: string;
  /** headline：中文 label → 英文 label */
  headline?: EnLabelMap;
  /** specs：中文 label → 覆盖项 */
  specs?: Record<string, EnSpecCell>;
  /** 叙事段落，按顺序一一对应（散文按序渲染，用下标是安全的） */
  narrative?: string[];
  comparison?: {
    title?: string;
    note?: string;
    /** 中文 row label → 英文 */
    rows?: Record<string, EnComparisonRow>;
  };
  repairability?: {
    difficulty?: string;
    tools?: string[];
    note?: string;
  };
  fidelity?: {
    source?: string;
    note?: string;
  };
  /** 层 id → 英文层 */
  layers: Record<string, EnLayer>;
  /** 步骤 id → 英文步骤 */
  steps?: Record<string, EnStep>;
}

/** 元数据（顶栏 tabs / 落地卡片）的英文版 */
export interface SubjectMetaEn {
  name: string;
  subtitle: string;
  tagline: string;
}
