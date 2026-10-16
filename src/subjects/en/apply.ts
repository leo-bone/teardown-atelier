import type { Subject, Layer, Hotspot, TeardownStep } from '../../core/types';
import { enLabel, enUnit, enValue, type SubjectEn, type SubjectMetaEn } from './types';
import type { SubjectMeta } from '../index';

/**
 * 把英文覆盖层merge 到中文主体上，产出一个"当前语言"的 Subject。
 *
 * 原则：**只覆盖明确提供的字段**，其余原样保留中文。这样任何一条漏翻都不会
 * 造成空白或 undefined，只会让那一处仍然是中文——可接受、可增量补齐。
 *
 * 注意 `build()` 与几何参数绝不触碰：这里只换文案，不碰模型。
 */
export function applyEn(s: Subject, en: SubjectEn | undefined): Subject {
  if (!en) return s;

  const layers: Layer[] = s.layers.map((l) => {
    const e = en.layers?.[l.id];
    if (!e) return l;
    const hotspots: Hotspot[] | undefined = l.hotspots?.map((h) => {
      const eh = e.hotspots?.[h.id];
      if (!eh) return h;
      return {
        ...h,
        title: eh.title,
        body: eh.body,
        stats: h.stats
          ? h.stats.map((st) => ({
              label: enLabel(eh.stats, st.label) ?? st.label,
              value: enValue(eh.stats, st.label) ?? st.value,
            }))
          : undefined,
      };
    });
    return {
      ...l,
      name: e.name ?? l.name,
      group: e.group ?? l.group,
      hotspots,
    };
  });

  const steps: TeardownStep[] | undefined = s.steps?.map((st) => {
    const es = en.steps?.[st.id];
    if (!es) return st;
    return {
      ...st,
      title: es.title ?? st.title,
      body: es.body ?? st.body,
      // 工具名整体替换：中文工具名匹配不到 tools.ts 的英文图鉴，整列换掉最干净
      tools: es.tools ?? st.tools,
      stats: st.stats
        ? st.stats.map((x) => ({
            label: enLabel(es.stats, x.label) ?? x.label,
            value: enValue(es.stats, x.label) ?? x.value,
          }))
        : undefined,
    };
  });

  // 先取到局部变量：s.comparison.rows.map 的回调是新的闭包，
  // TS 不会把外层 `&&` 的窄化带进回调里，直接用 en.comparison 会报 possibly undefined
  const enCmp = en.comparison;

  return {
    ...s,
    name: en.name ?? s.name,
    subtitle: en.subtitle ?? s.subtitle,
    tagline: en.tagline ?? s.tagline,
    overview: en.overview ?? s.overview,
    headline: s.headline.map((h) => ({
      ...h,
      label: enLabel(en.headline, h.label) ?? h.label,
      value: enValue(en.headline, h.label) ?? h.value,
      unit: enUnit(en.headline, h.label) ?? h.unit,
    })),
    narrative: en.narrative && en.narrative.length === s.narrative.length
      ? en.narrative
      : s.narrative,
    specs: s.specs.map((r) => {
      const e = en.specs?.[r.label];
      return {
        label: e?.label ?? r.label,
        value: e?.value ?? r.value,
        note: e?.note ?? r.note,
      };
    }),
    comparison: s.comparison && enCmp
      ? {
          title: enCmp.title ?? s.comparison.title,
          note: enCmp.note ?? s.comparison.note,
          rows: s.comparison.rows.map((r) => {
            const e = enCmp.rows?.[r.label];
            return {
              label: r.label,
              prev: e?.prev ?? r.prev,
              curr: e?.curr ?? r.curr,
              delta: r.delta,
            };
          }),
        }
      : s.comparison,
    repairability: s.repairability && en.repairability
      ? {
          score: s.repairability.score,
          difficulty: en.repairability.difficulty ?? s.repairability.difficulty,
          tools: en.repairability.tools ?? s.repairability.tools,
          note: en.repairability.note ?? s.repairability.note,
        }
      : s.repairability,
    fidelity: s.fidelity && en.fidelity
      ? {
          actualParts: s.fidelity.actualParts,
          modeledParts: s.fidelity.modeledParts,
          modeledLayers: s.fidelity.modeledLayers,
          source: en.fidelity.source ?? s.fidelity.source,
          note: en.fidelity.note ?? s.fidelity.note,
        }
      : s.fidelity,
    layers,
    steps,
  };
}

/** 元数据的英文版（顶栏 tab / 落地卡片在切换语言时要跟着变） */
export function applyMetaEn(m: SubjectMeta, en: SubjectMetaEn | undefined): SubjectMeta {
  if (!en) return m;
  return { ...m, name: en.name ?? m.name, subtitle: en.subtitle ?? m.subtitle, tagline: en.tagline ?? m.tagline };
}
