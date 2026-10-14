import * as THREE from 'three';

/** 一个可独立控制的结构层 */
export interface Layer {
  id: string;
  name: string;
  /** 该层在拆解列表中的分组：屏幕 / 主板 / 光学 / 能源 / 结构 / 推进 … */
  group: string;
  /** 爆炸位移方向（世界坐标），长度即最大位移距离（场景单位） */
  explodeDir: THREE.Vector3;
  /** 爆炸位移倍率，1 = 使用 explodeDir 的长度；可做二次拉伸 */
  explodeScale?: number;
  /** 该层是否可被剖切平面切开 */
  sectionable?: boolean;
  /** 建造该层的几何体 */
  build: () => THREE.Object3D;
  /** 热点标注锚点（局部坐标，相对层自身） */
  hotspots?: Hotspot[];
  /** 该层真实 / AI 参考图（右侧说明卡展示，与 3D 模型对照） */
  refImage?: string;
}

export interface Hotspot {
  id: string;
  title: string;
  /** HTML 正文，见 content.ts 中的 map */
  body: string;
  /** 锚点（局部坐标） */
  anchor: THREE.Vector3;
  /** 标注引线的方向，决定标签摆放面 */
  dir?: THREE.Vector3;
  /** 关键参数速览 */
  stats?: { label: string; value: string }[];
}

export interface SpecRow {
  label: string;
  value: string;
  note?: string;
}

export interface ComparisonRow {
  label: string;
  prev: string;
  curr: string;
  delta: 'up' | 'down' | 'flat';
}

export interface Subject {
  id: string;
  name: string;
  subtitle: string;
  /** 一句话定位 */
  tagline: string;
  /** 顶部关键指标 */
  headline: { label: string; value: string; unit?: string }[];
  overview: string;
  /** 设计取舍/工程叙事，2-4 段 */
  narrative: string[];
  specs: SpecRow[];
  comparison?: {
    title: string;
    note?: string;
    rows: ComparisonRow[];
  };
  layers: Layer[];
  /** 相机初始位置与目标 */
  camera: { position: [number, number, number]; target: [number, number, number] };
  /** 默认爆炸距离的整体缩放 */
  explodeScale?: number;
  /** 背景色 */
  background?: number;
  accent?: string;
  /** 是否展示剖切工具 */
  sectionable?: boolean;
  /** iFixit 式可维护性 / 拆解难度评估 */
  repairability?: {
    /** 0–10，越高越易维护（iFixit 口径） */
    score: number;
    /** 难度文字：极难 / 困难 / 中等 / 容易 */
    difficulty: string;
    /** 拆解/维护所需的专用工具或设备 */
    tools: string[];
    /** 评估口径说明（如"iFixit 实测"或"工程评估"） */
    note?: string;
  };
  /** 建模颗粒度披露：真实零件量 vs 模型表达的内容 */
  fidelity?: {
    actualParts: number;
    source: string;
    modeledLayers: number;
    modeledParts: number;
    note: string;
  };
}
