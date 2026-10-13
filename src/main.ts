import './style.css';
import { TeardownViewer } from './core/viewer';
import { SUBJECTS } from './subjects';
import type { Subject } from './core/types';

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
};

const viewport = document.getElementById('viewport') as HTMLElement;
const labels = document.getElementById('labels') as HTMLDivElement;

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
const tabsEl = document.getElementById('tabs')!;
SUBJECTS.forEach((s) => {
  const b = document.createElement('button');
  b.className = 'tab';
  b.textContent = s.name;
  b.dataset.id = s.id;
  b.addEventListener('click', () => loadSubject(s.id));
  tabsEl.appendChild(b);
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

  // tabs 高亮
  tabsEl.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', (t as HTMLElement).dataset.id === s.id);
  });
}

// ---------- 加载主体 ----------
function loadSubject(id: string) {
  const s = SUBJECTS.find((x) => x.id === id);
  if (!s) return;
  current = s;
  activeLayerId = null;
  hideCard();
  viewer.load(s);
  viewer.setLabelMode('dot');
  const lb = document.getElementById('btn-labels') as HTMLElement;
  lb.textContent = '标注：点';
  lb.classList.add('on');
  renderInfo(s);
  (document.getElementById('explode') as HTMLInputElement).value = '0';
  (document.getElementById('explode-val') as HTMLElement).textContent = '0%';
  document.querySelectorAll('.layer-item').forEach((e) => e.classList.remove('active', 'solo'));
  document.querySelectorAll('.section-tools .toggle').forEach((b) => b.classList.remove('on'));
  document.querySelector('[data-sec="off"]')?.classList.add('on');
}

// ---------- 层选择 + 信息卡 ----------
function selectLayer(layerId: string, focus: boolean) {
  const layer = current.layers.find((l) => l.id === layerId);
  if (!layer) return;
  activeLayerId = layerId;

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

  if (!hs) { hideCard(); return; }
  showCard(hs.title, hs.body, hs.stats);
}

function showCard(title: string, body: string, stats?: { label: string; value: string }[]) {
  (document.getElementById('hotcard-title') as HTMLElement).textContent = title;
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
  document.querySelectorAll('.layer-item.active, .hotspot-label.active').forEach((e) =>
    e.classList.remove('active')
  );
}

document.getElementById('hotcard-close')!.addEventListener('click', hideCard);

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
  btn.textContent = next ? '影调：摄影棚' : '影调：素图';
  btn.classList.toggle('on', next);
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

document.getElementById('btn-labels')!.addEventListener('click', (ev) => {
  const btn = ev.currentTarget as HTMLElement;
  // 三态循环：圆点 → 全部文字 → 隐藏
  const order: ('dot' | 'full' | 'none')[] = ['dot', 'full', 'none'];
  const cur = order.indexOf(viewer.getLabelMode());
  const next = order[(cur + 1) % order.length];
  viewer.setLabelMode(next);
  btn.textContent = { dot: '标注：点', full: '标注：全', none: '标注：关' }[next];
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

// 键盘快捷
addEventListener('keydown', (ev) => {
  if (ev.target instanceof HTMLInputElement) return;
  if (ev.key === 'Escape') hideCard();
  if (ev.key === 'r' || ev.key === 'R') viewer.resetView();
});

// ---------- 启动 ----------
// URL 参数：?subject=<id>&explode=0-100&photo=0/1
// 既是分享深链接，也是截图脚本控制初始视图的入口
const params = new URLSearchParams(location.search);
const wanted = params.get('subject');
const initial = SUBJECTS.find((s) => s.id === wanted) ?? SUBJECTS[0];
loadSubject(initial.id);

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
  pb.textContent = '影调：素图';
  pb.classList.remove('on');
}
