import './style.css';
import { TeardownViewer } from './core/viewer';
import { SUBJECT_META, loadSubjectDef } from './subjects';
import type { SubjectMeta } from './subjects';
import type { Subject, TeardownStep } from './core/types';
import { TOOLS, toolIdFor, toolsForSteps } from './data/tools';
import { generateSubject } from './data/generator';

/** 每层的代表色，用于左栏色块 */
const SWATCH: Record<string, string> = {
  cover: '#9fb8cc', display: '#1a2f3f', camera: '#4b5563', board: '#0e2f24',
  battery: '#b8bcc0', cooling: '#d08c4a', frame: '#b9c0c6', back: '#8a5a63',
  rf: '#2563eb',
  hbm: '#215a78', cowos: '#2b3440', compute: '#1f6b5c', iodie: '#3a2f6b',
  superchip: '#2a5a80', substrate: '#16321f',
  shield: '#2b2b2e', ship: '#b8bcc0', booster: '#a4a9ae', raptor: '#8a7a6a',
  hotstage: '#d0a050',
  frame2: '#2b2f33',
  // F-35
  fuselage: '#9aa0a4', canopy: '#1a2a38', avionics: '#1f6f7a', engine: '#8a7d6e',
  bays: '#14181d', wings: '#9aa0a4', gear: '#6a7075',
  // Porsche 911
  body: '#b9bdc2', flat6: '#8a8f93', pdk: '#767b80', wheels: '#0d0f12',
  suspension: '#7d8388', exhaust: '#8a8f93',
};

const viewport = document.getElementById('viewport') as HTMLElement;
const labels = document.getElementById('labels') as HTMLDivElement;
const stage = document.getElementById('stage') as HTMLElement;
const loading = document.getElementById('loading') as HTMLElement | null;
const heroShot = document.getElementById('hero-shot') as HTMLImageElement;
const heroShotCap = document.getElementById('hero-shot-cap') as HTMLElement;

let current: Subject;
let activeLayerId: string | null = null;

const viewer = new TeardownViewer(viewport, labels, {
  onPick: (id) => {
    if (!id) { hideCard(); return; }
    selectLayer(id, true);
  },
  onHover: (id) => {
    viewport.style.cursor = id ? 'pointer' : 'grab';
  },
});

// ---------- 顶栏 tabs ----------
/** 运行时生成的主体（任意产品输入）追加在这里 */
const dynamicSubjects: Subject[] = [];

async function resolveSubject(id: string): Promise<Subject | undefined> {
  return (await loadSubjectDef(id)) ?? dynamicSubjects.find((s) => s.id === id);
}

function findSubject(id: string): Subject | undefined {
  return dynamicSubjects.find((s) => s.id === id);
}

function addTab(s: Subject) {
  if (tabsEl.querySelector(`[data-id="${s.id}"]`)) return;
  const b = document.createElement('button');
  b.className = 'tab';
  b.innerHTML = `<span class="tab-idx">✦</span>${s.name}`;
  b.dataset.id = s.id;
  b.addEventListener('click', () => {
    skipIntro = true; // 顶栏切换不重复播入场动画
    void loadSubject(s.id);
  });
  tabsEl.appendChild(b);
}

const tabsEl = document.getElementById('tabs')!;
SUBJECT_META.forEach((s: SubjectMeta, i) => {
  const b = document.createElement('button');
  b.className = 'tab';
  b.innerHTML = `<span class="tab-idx">0${i + 1}</span>${s.name}`;
  b.dataset.id = s.id;
  b.addEventListener('click', () => {
    skipIntro = true; // 顶栏切换不重复播入场动画
    void loadSubject(s.id);
  });
  tabsEl.appendChild(b);
});

// ---------- 落地选择台 ----------
const heroEl = document.getElementById('hero') as HTMLElement;
const heroCards = document.getElementById('hero-cards') as HTMLElement;
SUBJECT_META.forEach((s: SubjectMeta, i) => {
  const accent = s.accent ?? '#5b8cff';
  const card = document.createElement('button');
  card.className = 'hero-card';
  card.style.setProperty('--ac', accent);
  card.innerHTML = `
    <span class="hc-index">0${i + 1}</span>
    <span class="hc-thumb">
      <img class="hc-thumb-img" src="./og/thumb/${s.id}.png" alt="" loading="lazy" />
    </span>
    <span class="hc-name">${s.name}</span>
    <span class="hc-sub">${s.subtitle}</span>
    <span class="hc-desc">${s.tagline}</span>
    <span class="hc-cta">查看拆解 →</span>`;
  card.addEventListener('click', () => {
    skipIntro = false; // 从选择台进入，播一次入场
    void loadSubject(s.id);
    hideHero();
  });
  heroCards.appendChild(card);
});

function hideHero() {
  heroEl.classList.add('hidden');
}
function showHero() {
  heroEl.classList.remove('hidden');
}

/** 切换中央真实拆解大图（图片为主布局的核心） */
function setHero(src: string | null, cap: string) {
  if (src) {
    heroShot.src = src;
    heroShot.style.opacity = '1';
  } else {
    heroShot.removeAttribute('src');
    heroShot.style.opacity = '0';
  }
  heroShotCap.textContent = cap;
  // 换图时来一次轻淡入，读起来是"翻页"而不是硬替换
  heroShot.classList.remove('swap');
  void heroShot.offsetWidth;
  heroShot.classList.add('swap');
}
/** 当前主体整体爆炸图（未选中层时的中央大图） */
function subjectHero(s: Subject): string {
  return s.heroImage ?? `./og/${s.id}.png`;
}
/** 当前主体装配态产品照（对比滑块的左图） */
function assembledHero(id: string): string {
  return `./ref/${id}/assembled.jpg`;
}

// ---------- 拆前 / 拆后对比滑块 ----------
let compareMode = false;
const compareEl = document.getElementById('compare') as HTMLElement;

function setCompareX(pct: number) {
  compareEl.style.setProperty('--x', `${Math.max(3, Math.min(97, pct))}%`);
}

function enterCompare() {
  if (activeLayerId) { hideCard(); }
  compareMode = true;
  (document.getElementById('cmp-before') as HTMLImageElement).src = assembledHero(current.id);
  (document.getElementById('cmp-after') as HTMLImageElement).src = subjectHero(current);
  setCompareX(50);
  compareEl.removeAttribute('hidden');
  document.getElementById('hero-shot-wrap')!.style.opacity = '0';
  document.getElementById('btn-compare')!.classList.add('on');
  document.getElementById('hero-shot-cap')!.style.opacity = '0';
}

function exitCompare() {
  compareMode = false;
  compareEl.setAttribute('hidden', '');
  document.getElementById('hero-shot-wrap')!.style.opacity = '';
  document.getElementById('hero-shot-cap')!.style.opacity = '';
  document.getElementById('btn-compare')!.classList.remove('on');
}

document.getElementById('btn-compare')!.addEventListener('click', () => {
  if (compareMode) exitCompare();
  else enterCompare();
});

// 拖动分割线（指针事件，支持鼠标 / 触屏）
{
  const el = compareEl;
  let dragging = false;
  const xFromEvent = (ev: PointerEvent) => {
    const r = el.getBoundingClientRect();
    return ((ev.clientX - r.left) / r.width) * 100;
  };
  el.addEventListener('pointerdown', (ev) => {
    dragging = true;
    el.setPointerCapture(ev.pointerId);
    setCompareX(xFromEvent(ev));
  });
  el.addEventListener('pointermove', (ev) => {
    if (dragging) setCompareX(xFromEvent(ev));
  });
  const stop = (ev: PointerEvent) => {
    dragging = false;
    if (el.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
  };
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
}

document.getElementById('hero-enter')!.addEventListener('click', () => hideHero());
document.getElementById('btn-home')!.addEventListener('click', () => showHero());

// ---------- 任意产品输入（MVP：通用模板生成） ----------
function runGenerate(raw: string) {
  const q = raw.trim();
  if (!q) {
    toast('先输入一个产品名');
    return;
  }
  const s = generateSubject(q);
  if (!findSubject(s.id)) dynamicSubjects.push(s);
  addTab(s);
  try {
    localStorage.setItem('ta:lastGen', q);
  } catch {
    /* 隐私模式下忽略 */
  }
  skipIntro = false;
  hideHero();
  void loadSubject(s.id);
  toast(`已按通用模板生成「${s.name}」· ${s.layers.length} 层（示意）`);
}
document.getElementById('gen-btn')!.addEventListener('click', () => {
  runGenerate((document.getElementById('gen-input') as HTMLInputElement).value);
});
document.getElementById('gen-input')!.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') runGenerate((ev.target as HTMLInputElement).value);
});

// ---------- 主体入场：产品页式 Hero 时刻 ----------
const introEl = document.getElementById('subject-intro') as HTMLElement;
let skipIntro = false;

function showSubjectIntro(s: Subject) {
  (document.getElementById('si-title') as HTMLElement).textContent = s.name;
  (document.getElementById('si-sub') as HTMLElement).textContent = `${s.subtitle} · ${s.tagline}`;
  (document.getElementById('si-stats') as HTMLElement).innerHTML = s.headline
    .slice(0, 4)
    .map(
      (h) => `<div class="si-stat">
        <span class="v">${h.value}</span><span class="u">${h.unit ?? ''}</span>
        <span class="l">${h.label}</span>
      </div>`
    )
    .join('');
  // 生成的主体没有装配态照片，用渐变兜底
  const bg = s.heroImage;
  (document.querySelector('.si-bg') as HTMLElement).style.backgroundImage = bg
    ? `linear-gradient(135deg, #1a2030, #0c0e11)`
    : `linear-gradient(135deg, #1a2030, #0c0e11), url("${assembledHero(s.id)}")`;
  introEl.removeAttribute('hidden');
}
function hideSubjectIntro() {
  introEl.setAttribute('hidden', '');
}
document.getElementById('si-enter')!.addEventListener('click', hideSubjectIntro);
introEl.addEventListener('click', (ev) => {
  if (ev.target === introEl || (ev.target as HTMLElement).classList.contains('si-bg')) hideSubjectIntro();
});

// ---------- 分享（易传播） ----------
function shareUrlFor(id: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}?subject=${id}`;
}
let toastTimer: number | undefined;
function toast(msg: string) {
  const t = document.getElementById('toast') as HTMLElement;
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 1800);
}
function updateShareMeta(s: Subject) {
  const url = shareUrlFor(s.id);
  document.title = `${s.name} · Teardown Atelier`;
  const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
  const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
  const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
  const twImage = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
  const imageUrl = `https://leo-bone.github.io/teardown-atelier/og/${s.id}.png`;
  if (ogTitle) ogTitle.content = `${s.name} · Teardown Atelier`;
  if (ogDesc) ogDesc.content = s.tagline;
  if (ogImage) ogImage.content = imageUrl;
  if (twImage) twImage.content = imageUrl;
  const x = document.getElementById('share-x') as HTMLAnchorElement | null;
  const wb = document.getElementById('share-wb') as HTMLAnchorElement | null;
  const text = encodeURIComponent(`${s.name} · 工程级 3D 拆解：${s.tagline}`);
  if (x) x.href = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
  if (wb) wb.href = `https://service.weibo.com/share/share.php?title=${text}&url=${encodeURIComponent(url)}`;
}
document.getElementById('btn-share')!.addEventListener('click', async () => {
  const url = shareUrlFor(current.id);
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast('分享链接已复制 ✓');
  } catch {
    toast('复制失败，请手动复制地址栏链接');
  }
});

// ---------- 渲染主体信息 ----------
function renderInfo(s: Subject) {
  (document.getElementById('s-name') as HTMLElement).textContent = s.name;
  (document.getElementById('s-sub') as HTMLElement).textContent = s.subtitle;
  (document.getElementById('s-tagline') as HTMLElement).textContent = s.tagline;

  const hl = document.getElementById('s-headline')!;
  hl.innerHTML = s.headline
    .map(
      (h) => `<div class="hl-item">
        <div class="hl-label">${h.label}</div>
        <div class="hl-value">${h.value}<span class="hl-unit">${h.unit ?? ''}</span></div>
      </div>`
    )
    .join('');

  // 层列表（按 group 分组）
  const list = document.getElementById('layer-list')!;
  list.innerHTML = '';
  const groups = new Map<string, typeof s.layers>();
  s.layers.forEach((l) => {
    if (!groups.has(l.group)) groups.set(l.group, []);
    groups.get(l.group)!.push(l);
  });

  groups.forEach((items, gname) => {
    const gl = document.createElement('div');
    gl.className = 'layer-group-label';
    gl.textContent = gname;
    list.appendChild(gl);

    items.forEach((l) => {
      const row = document.createElement('div');
      row.className = 'layer-item';
      row.dataset.id = l.id;
      row.innerHTML = `
        <span class="layer-swatch" style="background:${SWATCH[l.id] ?? '#94a3b8'}"></span>
        <span class="layer-name">${l.name}</span>
        <button class="layer-eye" title="显示 / 隐藏">◉</button>`;
      row.addEventListener('click', (ev) => {
        if ((ev.target as HTMLElement).classList.contains('layer-eye')) {
          viewer.toggleLayer(l.id);
          row.classList.toggle('hidden-layer', viewer.isHidden(l.id));
          return;
        }
        if (viewer.getIsolated() === l.id) {
          viewer.isolate(null);
          document.querySelectorAll('.layer-item.solo').forEach((e) => e.classList.remove('solo'));
        } else {
          viewer.isolate(l.id);
          document.querySelectorAll('.layer-item.solo').forEach((e) => e.classList.remove('solo'));
          row.classList.add('solo');
        }
        viewer.focusLayer(l.id);
      });
      list.appendChild(row);
    });
  });

  // 规格表
  const st = document.getElementById('spec-table')!;
  st.innerHTML = s.specs
    .map(
      (r) => `<tr>
        <td>${r.label}</td>
        <td>${r.value}${r.note ? `<span class="note">${r.note}</span>` : ''}</td>
      </tr>`
    )
    .join('');

  // iFixit 式可维护性 / 拆解难度
  const rp = document.getElementById('repair-block')!;
  if (s.repairability) {
    rp.style.display = '';
    const r = s.repairability;
    const sc = document.getElementById('repair-score') as HTMLElement;
    sc.textContent = `${r.score}`;
    sc.dataset.tier = r.score >= 7 ? 'good' : r.score >= 4 ? 'mid' : 'poor';
    (document.getElementById('repair-diff') as HTMLElement).textContent = r.difficulty;
    (document.getElementById('repair-tools') as HTMLElement).innerHTML = r.tools
      .map((t) => `<span class="tool-chip">${t}</span>`)
      .join('');
    (document.getElementById('repair-note') as HTMLElement).textContent = r.note ?? '';
  } else {
    rp.style.display = 'none';
  }

  // 概述 + 叙事
  (document.getElementById('s-overview') as HTMLElement).innerHTML = `<p>${s.overview}</p>`;
  (document.getElementById('s-narrative') as HTMLElement).innerHTML = s.narrative
    .map((p) => `<p>${p}</p>`)
    .join('');

  // 对比表
  const cp = document.getElementById('compare-panel')!;
  if (s.comparison) {
    cp.style.display = '';
    (document.getElementById('cmp-title') as HTMLElement).textContent = s.comparison.title;
    (document.getElementById('cmp-note') as HTMLElement).textContent = s.comparison.note ?? '';
    const arrow = { up: '▲', down: '▼', flat: '=' };
    (document.getElementById('cmp-rows') as HTMLElement).innerHTML = s.comparison.rows
      .map(
        (r) => `<div class="cmp-row ${r.delta}">
          <span class="cmp-label">${r.label}</span>
          <span class="cmp-prev">${r.prev}</span>
          <span class="cmp-arrow">${arrow[r.delta]}</span>
          <span class="cmp-curr">${r.curr}</span>
        </div>`
      )
      .join('');
  } else {
    cp.style.display = 'none';
  }

  // 建模颗粒度披露
  const fp = document.getElementById('fidelity-panel')!;
  if (s.fidelity) {
    fp.style.display = '';
    (document.getElementById('fid-actual') as HTMLElement).textContent =
      s.fidelity.actualParts.toLocaleString();
    (document.getElementById('fid-modeled') as HTMLElement).textContent =
      s.fidelity.modeledParts.toLocaleString();
    (document.getElementById('fid-source') as HTMLElement).textContent = `依据：${s.fidelity.source}`;
    (document.getElementById('fid-note') as HTMLElement).textContent = s.fidelity.note;
  } else {
    fp.style.display = 'none';
  }

  // 剖切工具可用性
  (document.getElementById('section-tools') as HTMLElement).style.display = s.sectionable ? '' : 'none';

  // 工具图鉴：这台设备全部步骤涉及的工装
  const grid = document.getElementById('tools-grid')!;
  const toolList = toolsForSteps(steps);
  grid.innerHTML = toolList
    .map(
      (t) => `<figure class="tool-card">
        <img src="${t.image}" alt="${t.name}" loading="lazy" />
        <figcaption><strong>${t.name}</strong><span>${t.note}</span></figcaption>
      </figure>`
    )
    .join('');
  (document.getElementById('tools-panel') as HTMLElement).style.display = toolList.length ? '' : 'none';

  // tabs 高亮
  tabsEl.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', (t as HTMLElement).dataset.id === s.id);
  });

  staggerPanels();
}

/** 切换主体时，左右栏面板错落淡入 */
function staggerPanels() {
  ['sidebar', 'inspector'].forEach((id) => {
    const root = document.getElementById(id)!;
    root.querySelectorAll(':scope > .panel').forEach((p, i) => {
      (p as HTMLElement).style.setProperty('--i', String(i));
    });
    root.classList.remove('enter');
    void root.offsetWidth; // 强制重排，让动画能重新触发
    root.classList.add('enter');
  });
}

// ---------- 加载主体 ----------
async function loadSubject(id: string) {
  // 先把视口淡出，再等主体 chunk 下载完——读起来是平滑过渡而不是白屏
  stage.classList.add('pre-load');
  const s = await resolveSubject(id);
  if (!s) {
    stage.classList.remove('pre-load');
    return;
  }
  current = s;
  activeLayerId = null;
  hideCard();
  if (compareMode) exitCompare();
  steps = buildSteps(s);
  // 产品页式入场：首次进入 / 从选择台进入时播一次，顶栏切换不重复
  if (skipIntro) hideSubjectIntro();
  else showSubjectIntro(s);
  skipIntro = false;
  viewer.load(s);
  viewer.setLabelMode('dot');
  const lb = document.getElementById('btn-labels') as HTMLElement;
  (lb.querySelector('.btn-txt') as HTMLElement).textContent = '标注';
  lb.classList.add('on');
  renderInfo(s);
  updateShareMeta(s);
  // 图片为主：默认展示整体爆炸大图
  setHero(subjectHero(s), `${s.name} · 整体爆炸图`);
  if (stepMode) renderStep(0);
  (document.getElementById('explode') as HTMLInputElement).value = '0';
  (document.getElementById('explode-val') as HTMLElement).textContent = '0%';
  document.querySelectorAll('.layer-item').forEach((e) => e.classList.remove('active', 'solo'));
  document.querySelectorAll('.section-tools .toggle').forEach((b) => b.classList.remove('on'));
  document.querySelector('[data-sec="off"]')?.classList.add('on');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => stage.classList.remove('pre-load'))
  );
}

/** 首帧渲染完成后淡出加载遮罩（多重保险：rAF 链 + 超时兜底） */
function hideLoading() {
  loading?.classList.add('hide');
}
requestAnimationFrame(() =>
  requestAnimationFrame(() => requestAnimationFrame(hideLoading))
);
setTimeout(hideLoading, 1500);

// ---------- 层选择 + 信息卡 ----------
function selectLayer(layerId: string, focus: boolean) {
  const layer = current.layers.find((l) => l.id === layerId);
  if (!layer) return;
  activeLayerId = layerId;
  if (compareMode) exitCompare();

  document.querySelectorAll('.layer-item').forEach((e) => {
    e.classList.toggle('active', (e as HTMLElement).dataset.id === layerId);
  });
  document.querySelectorAll('.hotspot-label').forEach((e) => {
    e.classList.toggle('active', (e as HTMLElement).dataset.layerId === layerId);
  });

  if (focus) viewer.focusLayer(layerId);
  // 让该层的标注常驻展开（否则隐藏掉文字就看不出选中了什么）
  const hs = layer.hotspots?.[0];
  viewer.setLabelFocus(hs ? `${layerId}:${hs.id}` : null);

  // 图片为主：中央大图切到该层的真实参考图（无则回退整体爆炸图）
  if (layer.refImage) {
    setHero(layer.refImage, `${layer.name} · 真实参考图`);
  } else {
    setHero(subjectHero(current), `${current.name} · 整体爆炸图`);
  }

  if (!hs) { hideCard(); return; }
  showCard(hs.title, hs.body, hs.stats, layer.name);
}

function showCard(
  title: string,
  body: string,
  stats?: { label: string; value: string }[],
  layerName?: string
) {
  const titleEl = document.getElementById('hotcard-title') as HTMLElement;
  if (layerName && layerName !== title) {
    titleEl.innerHTML = `<span class="hotcard-layer">${layerName}</span>${title}`;
  } else {
    titleEl.textContent = title;
  }
  (document.getElementById('hotcard-body') as HTMLElement).innerHTML = body;
  const st = document.getElementById('hotcard-stats')!;
  st.innerHTML = (stats ?? [])
    .map((s) => `<div class="stat-row"><span class="k">${s.label}</span><span class="v">${s.value}</span></div>`)
    .join('');

  document.getElementById('hotcard')!.removeAttribute('hidden');
}

function hideCard() {
  document.getElementById('hotcard')!.setAttribute('hidden', '');
  activeLayerId = null;
  viewer.setLabelFocus(null);
  // 取消选中：中央大图回到整体爆炸图
  setHero(subjectHero(current), `${current.name} · 整体爆炸图`);
  document.querySelectorAll('.layer-item.active, .hotspot-label.active').forEach((e) =>
    e.classList.remove('active')
  );
}

document.getElementById('hotcard-close')!.addEventListener('click', hideCard);

// ---------- 分步拆解（iFixit 式 Step 序列） ----------
let stepMode = false;
let stepIndex = 0;
let steps: TeardownStep[] = [];

/** 主体自带 steps 就用；否则按层列表顺序自动生成一套保底步骤 */
function buildSteps(s: Subject): TeardownStep[] {
  if (s.steps && s.steps.length) return s.steps;
  return s.layers.map((l) => ({
    id: `auto-${l.id}`,
    title: `拆下 ${l.name}`,
    body: `${l.group} · ${l.name}。这一层可以在左栏单独显隐、隔离查看，也可以用剖切工具看内部堆叠。`,
    layers: [l.id],
  }));
}

function enterStepMode() {
  stepMode = true;
  stepIndex = 0;
  if (compareMode) exitCompare();
  document.getElementById('step-rail')!.removeAttribute('hidden');
  document.getElementById('btn-steps')!.classList.add('on');
  hideCard();
  renderStep(0);
}

function exitStepMode() {
  stepMode = false;
  document.getElementById('step-rail')!.setAttribute('hidden', '');
  document.getElementById('btn-steps')!.classList.remove('on');
  // 恢复全显 + 默认机位
  current.layers.forEach((l) => {
    if (viewer.isHidden(l.id)) viewer.toggleLayer(l.id);
  });
  viewer.isolate(null);
  viewer.resetView();
  document.querySelectorAll('.layer-item').forEach((e) => e.classList.remove('solo', 'active', 'hidden-layer'));
  setHero(subjectHero(current), `${current.name} · 整体爆炸图`);
}

function renderStep(i: number) {
  if (!steps.length) return;
  stepIndex = Math.max(0, Math.min(steps.length - 1, i));
  const st = steps[stepIndex];

  (document.getElementById('step-cur') as HTMLElement).textContent = String(stepIndex + 1);
  (document.getElementById('step-total') as HTMLElement).textContent = `/${steps.length}`;
  (document.getElementById('step-title') as HTMLElement).textContent = st.title;
  (document.getElementById('step-body') as HTMLElement).textContent = st.body;

  const toolsEl = document.getElementById('step-tools')!;
  const hasTools = !!st.tools?.length;
  toolsEl.innerHTML = hasTools
    ? st.tools!
        .map((t) => {
          const id = toolIdFor(t);
          const def = id ? TOOLS[id] : undefined;
          const img = def
            ? `<img class="tool-chip-img" src="${def.image}" alt="${def.name}" loading="lazy" />`
            : '';
          return `<span class="tool-chip${def ? ' has-img' : ''}">${img}${t}</span>`;
        })
        .join('')
    : '';
  toolsEl.style.display = hasTools ? '' : 'none';

  const statsEl = document.getElementById('step-stats')!;
  statsEl.innerHTML = (st.stats ?? [])
    .map((s) => `<div class="stat-row"><span class="k">${s.label}</span><span class="v">${s.value}</span></div>`)
    .join('');

  const dotsEl = document.getElementById('step-dots')!;
  dotsEl.innerHTML = steps
    .map(
      (s, di) =>
        `<button class="step-dot${di === stepIndex ? ' on' : ''}" data-i="${di}" title="${s.title}"></button>`
    )
    .join('');
  dotsEl.querySelectorAll<HTMLButtonElement>('.step-dot').forEach((b) =>
    b.addEventListener('click', () => renderStep(Number(b.dataset.i)))
  );
  (document.getElementById('step-prev') as HTMLButtonElement).disabled = stepIndex === 0;
  (document.getElementById('step-next') as HTMLButtonElement).disabled =
    stepIndex === steps.length - 1;

  // 3D 小窗：只保留这一步涉及的层；单层时直接隔离
  const inStep = st.layers.filter((id) => current.layers.some((l) => l.id === id));
  if (inStep.length === 1) {
    viewer.isolate(inStep[0]);
  } else {
    viewer.isolate(null);
    current.layers.forEach((l) => {
      const want = inStep.includes(l.id);
      if (viewer.isHidden(l.id) !== !want) viewer.toggleLayer(l.id);
    });
  }
  if (inStep[0]) viewer.focusLayer(inStep[0]);

  // 左栏列表同步高亮
  document.querySelectorAll('.layer-item').forEach((e) => {
    const id = (e as HTMLElement).dataset.id;
    e.classList.toggle('active', inStep.includes(id!));
    e.classList.toggle('solo', inStep.length === 1 && id === inStep[0]);
    e.classList.toggle('hidden-layer', viewer.isHidden(id!));
  });

  // 中央大图：取这一步第一个有参考图的层
  const withRef = inStep
    .map((id) => current.layers.find((l) => l.id === id))
    .find((l) => l?.refImage);
  if (withRef) {
    setHero(withRef.refImage!, `${withRef.name} · 步骤 ${stepIndex + 1}`);
  } else {
    setHero(subjectHero(current), `${current.name} · 整体爆炸图`);
  }
}

document.getElementById('btn-steps')!.addEventListener('click', () => {
  if (stepMode) exitStepMode();
  else enterStepMode();
});
document.getElementById('step-prev')!.addEventListener('click', () => renderStep(stepIndex - 1));
document.getElementById('step-next')!.addEventListener('click', () => renderStep(stepIndex + 1));

// ---------- 工具条 ----------
const explodeInput = document.getElementById('explode') as HTMLInputElement;
explodeInput.addEventListener('input', () => {
  const v = Number(explodeInput.value);
  viewer.setExplode(v / 100);
  (document.getElementById('explode-val') as HTMLElement).textContent = `${v}%`;
});

document.querySelectorAll('[data-sec]').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-sec]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    const mode = (b as HTMLElement).dataset.sec!;
    if (mode === 'off') viewer.setSection(false);
    else viewer.setSection(true, mode as 'x' | 'y' | 'z', 0);
  });
});

document.getElementById('btn-photo')!.addEventListener('click', (ev) => {
  const btn = ev.currentTarget as HTMLElement;
  const next = !viewer.getPhotoGrade();
  viewer.setPhotoGrade(next);
  (btn.querySelector('.btn-txt') as HTMLElement).textContent = next ? '影调' : '素图';
  btn.classList.toggle('on', next);
});

// ---------- 录像：自动分步动画导出 WebM ----------
const REC_SECONDS = 24;
function recFmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `00:${String(s).padStart(2, '0')}`;
}
document.getElementById('btn-record')!.addEventListener('click', async () => {
  const btn = document.getElementById('btn-record') as HTMLButtonElement;
  const overlay = document.getElementById('rec-overlay') as HTMLElement;
  const bar = document.getElementById('rec-bar') as HTMLElement;
  const label = document.getElementById('rec-label') as HTMLElement;
  btn.disabled = true;
  overlay.removeAttribute('hidden');
  // 退出其它模式，保证录到的画面干净
  if (stepMode) exitStepMode();
  if (compareMode) exitCompare();
  hideCard();
  hideSubjectIntro();
  try {
    const blob = await viewer.record(REC_SECONDS, (p) => {
      bar.style.width = `${p * 100}%`;
      label.textContent = `正在录制 ${recFmt(p * REC_SECONDS)} / ${recFmt(REC_SECONDS)}`;
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.id}-teardown.webm`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(`拆解录像已下载 ✓（WebM，${(blob.size / 1024 / 1024).toFixed(1)} MB）`);
  } catch (e) {
    toast((e as Error).message || '录制失败');
  } finally {
    overlay.setAttribute('hidden', '');
    btn.disabled = false;
    // 复位爆炸滑块，与录制结束的状态保持一致
    const ex = document.getElementById('explode') as HTMLInputElement;
    ex.value = '0';
    (document.getElementById('explode-val') as HTMLElement).textContent = '0%';
  }
});

document.getElementById('btn-shot')!.addEventListener('click', () => {
  const btn = document.getElementById('btn-shot') as HTMLElement;
  btn.textContent = '渲染中…';
  // 让浏览器先画出按钮文字，再去做那一帧高分辨率渲染
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        const url = viewer.screenshot(2);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${current.id}-teardown.png`;
        a.click();
      } catch (e) {
        console.error('导出失败', e);
      }
      btn.textContent = '导出 PNG';
    });
  });
});

document.getElementById('btn-rotate')!.addEventListener('click', (ev) => {
  const btn = ev.currentTarget as HTMLElement;
  const next = !viewer.getAutoRotate();
  viewer.setAutoRotate(next);
  btn.classList.toggle('on', next);
});

document.getElementById('btn-labels')!.addEventListener('click', (ev) => {
  const btn = ev.currentTarget as HTMLElement;
  // 三态循环：圆点 → 全部文字 → 隐藏
  const order: ('dot' | 'full' | 'none')[] = ['dot', 'full', 'none'];
  const cur = order.indexOf(viewer.getLabelMode());
  const next = order[(cur + 1) % order.length];
  viewer.setLabelMode(next);
  (btn.querySelector('.btn-txt') as HTMLElement).textContent =
    { dot: '标注', full: '全显', none: '隐藏' }[next];
  btn.classList.toggle('on', next !== 'none');
});

document.getElementById('btn-reset')!.addEventListener('click', () => viewer.resetView());
document.getElementById('btn-show-all')!.addEventListener('click', () => {
  current.layers.forEach((l) => {
    if (viewer.isHidden(l.id)) viewer.toggleLayer(l.id);
  });
  document.querySelectorAll('.layer-item').forEach((e) => e.classList.remove('hidden-layer'));
  viewer.isolate(null);
  document.querySelectorAll('.layer-item').forEach((e) => e.classList.remove('solo'));
});

// 3D 把玩小窗：收起 / 展开
document.getElementById('pw-toggle')!.addEventListener('click', () => {
  const pw = document.getElementById('play-widget') as HTMLElement;
  const collapsed = pw.classList.toggle('collapsed');
  (document.getElementById('pw-toggle') as HTMLElement).textContent = collapsed ? '+' : '—';
});

// 键盘快捷
addEventListener('keydown', (ev) => {
  if (ev.target instanceof HTMLInputElement) return;
  if (ev.key === 'Escape') {
    if (!introEl.hasAttribute('hidden')) hideSubjectIntro();
    else if (stepMode) exitStepMode();
    else hideCard();
  }
  if (ev.key === 'r' || ev.key === 'R') viewer.resetView();
  // 分步模式下用左右方向键翻步
  if (stepMode && ev.key === 'ArrowRight') renderStep(stepIndex + 1);
  if (stepMode && ev.key === 'ArrowLeft') renderStep(stepIndex - 1);
});

// ---------- 启动 ----------
// URL 参数：?subject=<id>&explode=0-100&photo=0/1
// 既是分享深链接，也是截图脚本控制初始视图的入口
const params = new URLSearchParams(location.search);
const wanted = params.get('subject');
// 支持 ?subject=gen-xxx：从本地记录的上一次输入重建（同浏览器内有效）
let restoredQuery: string | null = null;
if (wanted?.startsWith('gen-')) {
  try {
    restoredQuery = localStorage.getItem('ta:lastGen');
  } catch {
    /* ignore */
  }
}
const initialId =
  SUBJECT_META.find((s) => s.id === wanted)?.id ??
  (restoredQuery ? generateSubject(restoredQuery).id : undefined) ??
  SUBJECT_META[0].id;
if (restoredQuery && initialId.startsWith('gen-')) {
  dynamicSubjects.push(generateSubject(restoredQuery));
}
void loadSubject(initialId);

const exRaw = params.get('explode');
if (exRaw !== null && Number.isFinite(Number(exRaw))) {
  const v = Math.max(0, Math.min(100, Number(exRaw)));
  viewer.setExplode(v / 100);
  (document.getElementById('explode') as HTMLInputElement).value = String(v);
  (document.getElementById('explode-val') as HTMLElement).textContent = `${v}%`;
}

const secRaw = params.get('section');
if (secRaw !== null) {
  if (secRaw === 'off') {
    viewer.setSection(false);
  } else if (secRaw === 'x' || secRaw === 'y' || secRaw === 'z') {
    viewer.setSection(true, secRaw, 0);
    document.querySelectorAll('[data-sec]').forEach((x) => x.classList.remove('on'));
    document.querySelector(`[data-sec="${secRaw}"]`)?.classList.add('on');
  }
}

if (params.get('photo') === '0') {
  viewer.setPhotoGrade(false);
  const pb = document.getElementById('btn-photo') as HTMLElement;
  (pb.querySelector('.btn-txt') as HTMLElement).textContent = '素图';
  pb.classList.remove('on');
}
