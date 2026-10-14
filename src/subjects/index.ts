import type { Subject } from '../core/types';

/**
 * 主体元数据：顶栏 tabs 与落地卡片只需要这些字段，
 * 不必把完整模型（星舰 652 个网格那种）塞进首屏包。
 */
export interface SubjectMeta {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  accent?: string;
}

export const SUBJECT_META: SubjectMeta[] = [
  {
    id: 'iphone18',
    name: 'iPhone 18 Pro',
    subtitle: 'Apple · 2026 年 9 月',
    tagline: '首款 2nm 芯片 + 可变光圈 + 首次液冷，为折叠款打前站的 Pro',
    accent: '#6b7280',
  },
  {
    id: 'rubin',
    name: 'NVIDIA Rubin VR200',
    subtitle: 'NVIDIA · 2026 下半年 · Blackwell 之后的第一代',
    tagline: '四 tile 架构：2 计算 die + 2 I/O die + 8 组 HBM4，把带宽推到 22 TB/s',
    accent: '#76b900',
  },
  {
    id: 'starship',
    name: 'SpaceX Starship V3',
    subtitle: 'SpaceX · 2026 年 5 月首飞 · Flight 12',
    tagline: '124.4 米、33 台猛禽 3、约 9240 吨推力——人类目前最强运力',
    accent: '#0b7285',
  },
  {
    id: 'mavic4',
    name: 'DJI Mavic 4 Pro',
    subtitle: '大疆创新 · 三摄旗舰影像航拍机',
    tagline: '1 亿像素哈苏主摄 + 双长焦 + 360° 万象云台 + 30km 10-bit 图传',
    accent: '#0a7ea4',
  },
  {
    id: 'f35',
    name: 'F-35A Lightning II',
    subtitle: 'Lockheed Martin · 2015 服役 · 第五代隐身多用途',
    tagline: '单发 19 吨加力、Mach 1.6、RCS 0.001㎡——西方主力五代机',
    accent: '#3b6ea5',
  },
  {
    id: 'porsche911',
    name: 'Porsche 911 Carrera S',
    subtitle: 'Porsche · 992 II（2025） · 后置后驱跑车',
    tagline: '3.0T 水平对置六缸 480 PS，0–100 3.3s，极致平衡',
    accent: '#b11226',
  },
];

/** 完整主体按需加载：动态 import 让每个主体成为独立 chunk，首屏只付当前那一个 */
const LOADERS: Record<string, () => Promise<Subject>> = {
  iphone18: () => import('./iphone18').then((m) => m.iPhone18Pro()),
  rubin: () => import('./rubin').then((m) => m.rubinVR200()),
  starship: () => import('./starship').then((m) => m.starshipV3()),
  mavic4: () => import('./mavic4').then((m) => m.mavic4Pro()),
  f35: () => import('./f35').then((m) => m.f35LightningII()),
  porsche911: () => import('./porsche911').then((m) => m.porsche911()),
};

/** 已加载过的主体缓存，来回切换不重复解析 */
const cache = new Map<string, Subject>();

export async function loadSubjectDef(id: string): Promise<Subject | undefined> {
  const hit = cache.get(id);
  if (hit) return hit;
  const loader = LOADERS[id];
  if (!loader) return undefined;
  const s = await loader();
  cache.set(id, s);
  return s;
}

export function hasBuiltinSubject(id: string): boolean {
  return id in LOADERS;
}
