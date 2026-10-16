/**
 * 国际化（i18n）核心。
 *
 * 设计取舍：
 * - UI 文案（导航、按钮、面板标题、提示）走 t() 字典 + data-i18n 属性批量刷新，
 *   这样切换语言不需要重建 DOM，也不需要把文案散落在业务代码里。
 * - 产品内容（层名、热点、分步、规格）不塞进字典：那是数据，不是界面。
 *   它们由 src/subjects/en/*.ts 提供英文版本，applyEn() 在渲染前做一次合并覆盖。
 *   这样中文源文件保持"唯一事实来源"，英文是可选覆盖层，缺哪项就回退中文。
 *
 * 语言存 localStorage；URL 上带 ?lang=en 优先（分享链接可直接指定语言）。
 */

export type Lang = 'zh' | 'en';

const STORAGE_KEY = 'ta:lang';

/** 双语字面量：内容型数据用它就地标注中英两种写法 */
export interface Bilingual {
  zh: string;
  en: string;
}

export function L(zh: string, en: string): Bilingual {
  return { zh, en };
}

/** 解析双语字面量（普通 string 视为无需翻译，原样返回） */
export function lt(v: Bilingual | string, lang: Lang = current): string {
  return typeof v === 'string' ? v : v[lang];
}

function detect(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
  } catch {
    /* 非浏览器环境 */
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    /* 隐私模式 */
  }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

let current: Lang = detect();

const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

/** 切换语言：写localStorage → 更新 <html lang> → 刷新 data-i18n → 通知订阅者重建内容 */
export function setLang(lang: Lang, persist = true): void {
  if (lang === current) return;
  current = lang;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* 隐私模式下忽略 */
    }
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyDomLang();
  listeners.forEach((fn) => fn());
}

/** 内容层（主体文案、图层列表…）订阅语言变化后需要整体重渲染 */
export function onLangChange(fn: () => void): void {
  listeners.add(fn);
}

export function toggleLang(): Lang {
  setLang(current === 'zh' ? 'en' : 'zh');
  return current;
}

// ---------- UI 文案字典 ----------

type Dict = Record<string, Bilingual>;

const UI: Dict = {
  // 品牌 / 顶栏
  'brand.subtitle': L('工程级3D 拆解工坊', 'Engineering-grade 3D teardown'),
  'badge.parametric': L('参数化重建 · 非真机扫描', 'Parametric rebuild · not a physical scan'),
  'share.copy': L('复制分享链接', 'Copy share link'),
  'share.label': L('分享', 'Share'),
  'share.toX': L('分享到 X', 'Share on X'),
  'share.toWeibo': L('分享到微博', 'Share on Weibo'),
  'home.back': L('返回选择页', 'Back to picker'),
  'home.label': L('选择台', 'Picker'),
  'gh.view': L('在 GitHub 上查看', 'View on GitHub'),
  'lang.toggle': L('切换语言 / Language', 'Switch language / 语言'),

  // 落地选择台
  'hero.kicker': L('工程级 3D 拆解 · Teardown Atelier', 'Engineering-grade 3D teardown · Teardown Atelier'),
  'hero.title1': L('把科技产品', 'Take technology'),
  'hero.title2': L('拆开看', 'apart'),
  'hero.sub': L(
    '基于公开规格与权威拆解的参数化重建 · 可旋转 · 可爆炸 · 可剖切',
    'Parametric reconstruction from public specs and teardowns · orbit · explode · section'
  ),
  'hero.cardCta': L('查看拆解 →', 'View teardown →'),
  'hero.genKicker': L('或者，随便输入一个产品名', 'Or type in any product'),
  'hero.genPlaceholder': L(
    '例如：扫地机器人 / 电饭煲 / 自行车 / 打印机',
    'e.g. robot vacuum / rice cooker / bicycle / printer'
  ),
  'hero.genBtn': L('生成拆解', 'Generate'),
  'hero.genRemote': L('用 AI 生成真实规格（需配置云端代理）', 'Use AI for real specs (requires the cloud proxy)'),
  'hero.genRemoteDown': L('AI 生成（云端未就绪，可能不可用）', 'AI generation (cloud not ready, may fail)'),
  'hero.genNote': L(
    '通用模板重建 · 结构示意图 · 非真实规格（演示用）',
    'Generic template rebuild · schematic · not real specs (demo)'
  ),
  'hero.foot': L('选一台开始', 'Pick one to begin'),
  'hero.enter': L('直接进入工坊 →', 'Enter the workshop →'),

  // 侧栏
  'repair.label': L('可维护性 / 拆解难度', 'Repairability / teardown difficulty'),
  'panel.layers': L('结构层', 'Structural layers'),
  'panel.showAll': L('全显', 'Show all'),
  'panel.specs': L('规格', 'Specifications'),

  // 3D 小窗与工具条
  'pw.title': L('3D 把玩', '3D viewer'),
  'pw.collapse': L('收起 / 展开', 'Collapse / expand'),
  'loading.baking': L('正在烘焙影棚环境…', 'Baking the studio environment…'),
  'tool.explode': L('拆解程度', 'Explode'),
  'tool.section': L('剖切', 'Section'),
  'tool.sectionOff': L('关', 'Off'),
  'tool.photoOn': L('影调', 'Graded'),
  'tool.photoOff': L('素图', 'Flat'),
  'tool.rotate': L('自转', 'Auto-rotate'),
  'tool.labelsDot': L('标注', 'Labels'),
  'tool.labelsFull': L('全显', 'All'),
  'tool.labelsNone': L('隐藏', 'Hide'),
  'tool.compare': L('对比', 'Compare'),
  'tool.steps': L('分步', 'Steps'),
  'tool.record': L('录像', 'Record'),
  'tool.shot': L('导出 PNG', 'Export PNG'),
  'tool.shotBusy': L('渲染中…', 'Rendering…'),
  'tool.reset': L('复位', 'Reset'),

  // 对比滑块
  'cmp.assembled': L('装配态', 'Assembled'),
  'cmp.exploded': L('拆解态', 'Exploded'),
  'compare.noRef': L(
    '这个主体没有装配态实拍照片，无法做拆前/拆后对比',
    'This subject has no assembled-state photo, so before/after compare is unavailable'
  ),

  // 分步拆解
  'step.kicker': L('分步拆解', 'Step-by-step'),
  'step.prev': L('上一步', 'Previous step'),
  'step.next': L('下一步', 'Next step'),

  // 主体入场
  'intro.kicker': L('工程级拆解', 'Engineering teardown'),
  'intro.enter': L('开始拆解 →', 'Start teardown →'),
  'intro.note': L(
    '参数化重建 · 非真机扫描 · 规格依据公开资料与权威拆解',
    'Parametric rebuild · not a physical scan · specs from public sources and teardowns'
  ),

  // 右栏
  'panel.overview': L('概述', 'Overview'),
  'panel.narrative': L('设计解读', 'Design notes'),
  'panel.fidelity': L('建模颗粒度', 'Modelling fidelity'),
  'fid.actual': L('真实零件量', 'Real parts'),
  'panel.tools': L('工具图鉴', 'Tool atlas'),
  'tools.note': L(
    '这台设备拆解会用到的工具，图来自通用工装实拍。',
    'The tools this teardown needs, photographed from a general tool set.'
  ),

  // 悬浮卡/ 图例
  'hotcard.close': L('关闭', 'Close'),
  'fid.sourcePrefix': L('依据：', 'Source: '),

  // 录制
  'rec.idle': L('正在录制 00:00 / 00:24', 'Recording 00:00 / 00:24'),
  'rec.running': L('正在录制 {cur} / {total}', 'Recording {cur} / {total}'),
  'rec.note': L(
    '自动分步动画：装配自转 → 连续爆炸 → 爆炸态自转 → 收起。请保持本标签页在前台。',
    'Auto sequence: assembled spin → continuous explode → exploded spin → collapse. Keep this tab in the foreground.'
  ),

  // Toast / 动态提示
  'toast.emptyQuery': L('先输入一个产品名', 'Enter a product name first'),
  'gen.busyLocal': L('生成中…', 'Generating…'),
  'gen.busyRemote': L('AI 生成中…', 'AI generating…'),
  'gen.doneLocal': L('已按通用模板生成「{name}」· {n} 层（示意）', 'Generated "{name}" from the generic template · {n} layers (schematic)'),
  'gen.doneRemote': L(
    'AI 已生成「{name}」· {n} 层（规格未经权威资料核对）',
    'AI generated "{name}" · {n} layers (specs not verified against authoritative sources)'
  ),
  'gen.fallback': L('远端生成失败（{msg}），已回落到通用模板', 'Remote generation failed ({msg}); fell back to the generic template'),
  'share.copied': L('分享链接已复制 ✓', 'Share link copied ✓'),
  'share.failed': L('复制失败，请手动复制地址栏链接', 'Copy failed — copy the address bar link manually'),
  'rec.done': L('拆解录像已下载 ✓（WebM，{size} MB）', 'Teardown video downloaded ✓ (WebM, {size} MB)'),
  'rec.failed': L('录制失败：{msg}', 'Recording failed: {msg}'),
  'rec.unsupported': L('当前浏览器不支持画布录制', 'Canvas recording is not supported in this browser'),
  'viewer.recordError': L('当前浏览器不支持画布录制', 'Canvas recording is not supported in this browser'),

  // 大图标题后缀
  'hero.capExploded': L('整体爆炸图', 'Full exploded view'),
  'hero.capRef': L('真实参考图', 'Reference photo'),
  'hero.capStep': L('步骤 {n}', 'Step {n}'),
  'share.text': L('{name} · 工程级 3D 拆解：{tagline}', '{name} · Engineering-grade 3D teardown: {tagline}'),

  // 自动生成的步骤文案（generator / buildSteps 兜底）
  'autoStep.title': L('拆下 {name}', 'Remove {name}'),
  'autoStep.body': L(
    '{group} · {name}。这一层可以在左栏单独显隐、隔离查看，也可以用剖切工具看内部堆叠。',
    '{group} · {name}. Toggle it on its own in the left panel, isolate it, or use the section tool to see the stack inside.'
  ),

  // 生成器结构示意图
  'gen.svgCap': L('结构', 'Schematic'),
  'gen.svgCapEn': L('结构示意', 'Schematic'),
};

function interpolate(tpl: string, vars?: Record<string, string | number>): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** 取 UI 文案；找不到 key 时返回 key 本身（便于开发期暴露遗漏） */
export function t(key: string, vars?: Record<string, string | number>, lang: Lang = current): string {
  const entry = UI[key];
  if (!entry) return key;
  return interpolate(entry[lang], vars);
}

// ---------- DOM 批量刷新 ----------

/**
 * 刷新所有带 data-i18n 的元素。
 *   <span data-i18n="brand.subtitle">
 *   <input data-i18n="hero.genPlaceholder" data-i18n-attr="placeholder">
 * 属性形式用于 placeholder / title / aria-label 这类非文本内容。
 */
export function applyDomLang(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t(key));
      return;
    }
    // 只覆盖纯文本节点；含子元素的（如带 <span class="hl">）保留结构，
    // 那种情况用 data-i18n-html 显式声明。
    if (el.dataset.i18nHtml !== undefined) {
      el.innerHTML = t(key);
    } else if (el.children.length === 0) {
      el.textContent = t(key);
    }
  });
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
}

/** 首次启动：把 <html lang> 与所有静态文案对齐到当前语言 */
export function initLang(): void {
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
  applyDomLang();
}
