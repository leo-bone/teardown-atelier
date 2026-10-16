import type { Subject } from '../core/types';
import { getLang } from '../i18n';
import { applyEn, applyMetaEn } from './en/apply';
import type { SubjectEn, SubjectMetaEn } from './en/types';

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
  {
    id: 'ps5',
    name: 'PlayStation 5 Pro',
    subtitle: 'Sony Interactive · 2024 年 11 月 · 第九世代高性能主机',
    tagline: 'GPU 计算单元从 36 提到 60、带宽 +28%、390W 电源——同架构下的完全体',
    accent: '#2b6cb0',
  },
  {
    id: 'a7v',
    name: 'Sony A7 V',
    subtitle: 'Sony · 全画幅微单 · 第七代基准机型',
    tagline: '3300 万像素堆栈 CMOS + BIONZ XR + 8 级五轴防抖，影像旗舰的工程基准',
    accent: '#8a1c2b',
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
  ps5: () => import('./ps5').then((m) => m.ps5Pro()),
  a7v: () => import('./a7v').then((m) => m.sonyA7V()),
};

/**
 * 英文覆盖层。**不进动态 import** —— 覆盖层是纯文案，没有 three.js 依赖，
 * 静态引入 8 个小文件（约 150KB 源码，压缩后更小）换来的是切换语言零延迟：
 * 不用等chunk、不用重建 3D 场景，只重渲染文字。
 * 真要省首屏体积，把这里也改成动态 import 即可，接口不用动。
 */
const EN_LOADERS: Record<string, () => Promise<{ en: SubjectEn; meta: SubjectMetaEn }>> = {
  iphone18: () =>
    import('./en/iphone18').then((m) => ({ en: m.iPhone18ProEn, meta: m.iPhone18ProMetaEn })),
  rubin: () => import('./en/rubin').then((m) => ({ en: m.rubinVR200En, meta: m.rubinVR200MetaEn })),
  starship: () =>
    import('./en/starship').then((m) => ({ en: m.starshipV3En, meta: m.starshipV3MetaEn })),
  mavic4: () => import('./en/mavic4').then((m) => ({ en: m.mavic4ProEn, meta: m.mavic4ProMetaEn })),
  f35: () => import('./en/f35').then((m) => ({ en: m.f35LightningIIEn, meta: m.f35LightningIIMetaEn })),
  porsche911: () =>
    import('./en/porsche911').then((m) => ({ en: m.porsche911En, meta: m.porsche911MetaEn })),
  ps5: () => import('./en/ps5').then((m) => ({ en: m.ps5ProEn, meta: m.ps5ProMetaEn })),
  a7v: () => import('./en/a7v').then((m) => ({ en: m.sonyA7VEn, meta: m.sonyA7VMetaEn })),
};

/** 英文覆盖层缓存（切换语言时直接命中，不重复 import） */
const enCache = new Map<string, { en: SubjectEn; meta: SubjectMetaEn }>();

export async function loadSubjectEn(id: string) {
  const hit = enCache.get(id);
  if (hit) return hit;
  const loader = EN_LOADERS[id];
  if (!loader) return undefined;
  const v = await loader();
  enCache.set(id, v);
  return v;
}

/** 已加载过的主体缓存。注意：缓存的是**中文原始主体**，语言在渲染前叠加 */
const cache = new Map<string, Subject>();

export async function loadSubjectDef(id: string): Promise<Subject | undefined> {
  const hit = cache.get(id);
  const loader = LOADERS[id];
  if (!loader) return undefined;
  const s = hit ?? (await loader());
  if (!hit) cache.set(id, s);
  if (getLang() === 'en') {
    const en = await loadSubjectEn(id);
    if (en) return applyEn(s, en.en);
  }
  return s;
}

/** 顶栏 tabs / 落地卡片用的元数据，按当前语言取（英文缺失时回退中文） */
export function metaFor(id: string): SubjectMeta {
  const base = SUBJECT_META.find((m) => m.id === id);
  return base ?? { id, name: id, subtitle: '', tagline: '' };
}

/** 同步版：若英文覆盖层已缓存则立即套用（供切换语言后的即时重渲染） */
export function localizeMetaSync(m: SubjectMeta): SubjectMeta {
  if (getLang() !== 'en') return m;
  const cached = enCache.get(m.id);
  return cached ? applyMetaEn(m, cached.meta) : m;
}

export function hasBuiltinSubject(id: string): boolean {
  return id in LOADERS;
}
