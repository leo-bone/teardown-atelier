import * as THREE from 'three';

/**
 * 程序化材质纹理库
 * 全部用 Canvas 2D 生成，无外部贴图依赖。
 * 目标：让纯色几何体获得可辨识的材质特征（PCB 走线、拉丝纹、碳纤维编织、晶圆网格）。
 */

const cache = new Map<string, THREE.Texture>();

/**
 * 无 DOM 环境（Node 构建期 / 几何验证脚本）下返回 null，
 * 调用方负责降级 —— 这样验证脚本能跑通纯几何逻辑，浏览器里则拿到完整贴图。
 */
export const HAS_DOM = typeof document !== 'undefined' && !!document.createElement;

function cached(key: string, make: () => THREE.Texture): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const t = make();
  cache.set(key, t);
  return t;
}

/** 无 DOM 时的统一占位：1x1 白像素，材质仍可正常渲染（只是没有细节） */
export function placeholderTexture(): THREE.Texture {
  return cached('__ph', () => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  });
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  return [c, ctx];
}

/** 影棚地台：中心亮、边缘渐隐，外沿色与背景罩腰线一致（看不出接缝） */
export function groundTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('ground', () => {
    const [c, ctx] = canvas(512);
    const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#f4f7fa');
    g.addColorStop(0.8, '#e7ecf2');
    g.addColorStop(1, '#dde3ea');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    // 极细噪点，避免大面积纯色出现色带
    const img = ctx.getImageData(0, 0, 512, 512);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 4;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** PCB：绿色基底 + 铜走线 + 焊盘 + 丝印 */
export function pcbTexture(base = '#0d3a28', trace = '#1f7a52'): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached(`pcb-${base}-${trace}`, () => {
    const S = 512;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);

    // 铜走线：曼哈顿风格随机折线
    ctx.strokeStyle = trace;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      let x = Math.random() * S;
      let y = Math.random() * S;
      ctx.moveTo(x, y);
      const segs = 2 + Math.floor(Math.random() * 4);
      for (let s = 0; s < segs; s++) {
        const horiz = Math.random() > 0.5;
        const len = 20 + Math.random() * 90;
        if (horiz) x += Math.random() > 0.5 ? len : -len;
        else y += Math.random() > 0.5 ? len : -len;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 焊盘
    ctx.fillStyle = '#c9a227';
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * S;
      const y = Math.random() * S;
      const r = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c9a227';
    }

    // 白色丝印字符
    ctx.fillStyle = 'rgba(230,240,235,0.5)';
    ctx.font = '9px monospace';
    for (let i = 0; i < 26; i++) {
      ctx.fillText(
        ['C', 'R', 'U', 'L', 'TP'][Math.floor(Math.random() * 5)] + (10 + Math.floor(Math.random() * 90)),
        Math.random() * S,
        Math.random() * S
      );
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** 拉丝金属：横向细密划痕 */
export function brushedTexture(tint = '#c8ccd0'): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached(`brushed-${tint}`, () => {
    const S = 512;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 2400; i++) {
      const y = Math.random() * S;
      const x = Math.random() * S;
      const len = 20 + Math.random() * 140;
      const a = 0.02 + Math.random() * 0.07;
      ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
      ctx.lineWidth = 0.6 + Math.random();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + (Math.random() - 0.5) * 1.5);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** 碳纤维：2x2 斜纹编织 */
export function carbonTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('carbon', () => {
    const S = 256;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = '#15171a';
    ctx.fillRect(0, 0, S, S);
    const cell = 16;
    for (let y = 0; y < S / cell; y++) {
      for (let x = 0; x < S / cell; x++) {
        const over = (x + y) % 2 === 0;
        const g = ctx.createLinearGradient(
          x * cell, y * cell,
          over ? (x + 1) * cell : x * cell,
          over ? y * cell : (y + 1) * cell
        );
        g.addColorStop(0, '#0e1013');
        g.addColorStop(0.5, '#3a4046');
        g.addColorStop(1, '#0e1013');
        ctx.fillStyle = g;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** 晶圆表面：规则的 die 阵列分割线 */
export function waferTexture(tint = '#1a6b58', line = '#7ff0d8'): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached(`wafer-${tint}-${line}`, () => {
    const S = 512;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, S, S);

    // 大面积柔和渐变，避免死板纯色
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    // die 阵列分割
    const n = 8;
    ctx.strokeStyle = line;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    for (let i = 1; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo((i * S) / n, 0);
      ctx.lineTo((i * S) / n, S);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i * S) / n);
      ctx.lineTo(S, (i * S) / n);
      ctx.stroke();
    }

    // 更细的次级分割
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 0.8;
    for (let i = 1; i < n * 4; i++) {
      const p = (i * S) / (n * 4);
      ctx.beginPath();
      ctx.moveTo(p, 0); ctx.lineTo(p, S); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p); ctx.lineTo(S, p); ctx.stroke();
    }

    // 亮块（功能单元示意）
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#bfffe8';
    for (let i = 0; i < 20; i++) {
      const cw = 8 + Math.random() * 30;
      const ch = 8 + Math.random() * 26;
      ctx.fillRect(
        Math.floor(Math.random() * n) * (S / n) + 3,
        Math.floor(Math.random() * n) * (S / n) + 3,
        Math.min(cw, S / n - 6),
        Math.min(ch, S / n - 6)
      );
    }
    ctx.globalAlpha = 1;

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** 混凝土 / 隔热瓦烧蚀面 */
export function ablativeTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('ablative', () => {
    const S = 256;
    const [c, ctx] = canvas(S);
    ctx.fillStyle = '#2a2a2d';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      const r = Math.random() * 2.4;
      const v = 30 + Math.random() * 60;
      ctx.fillStyle = `rgba(${v},${v},${v + 4},${0.12 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  });
}

/** 岩石/烧蚀再入区 */
export function scorchTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('scorch', () => {
    const S = 256;
    const [c, ctx] = canvas(S);
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#1a1a1c');
    g.addColorStop(0.5, '#0d0d0f');
    g.addColorStop(1, '#232326');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 900; i++) {
      const v = 20 + Math.random() * 70;
      ctx.fillStyle = `rgba(${v},${v - 4},${v - 8},${Math.random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, 1 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
  });
}

// ---------------------------------------------------------------------------
// 影棚背景 / 接地（摄影棚无缝罩 cove + 接触阴影）
// ---------------------------------------------------------------------------

/**
 * 无缝影棚罩（infinity cove）渐变贴图。
 *
 * 真实产品摄影在一个"地板 + 圆角转角 + 背墙"一体成型的无缝罩里拍，
 * 肉眼看不到任何接缝。这里沿剖面（v 从地板远端 → 转角 → 背墙顶端）做一道
 * 极轻微的冷暖渐变：地板略亮暖、背墙略冷暗，转角处几乎无差，
 * 让曲面过渡在视觉上"消失"。
 */
export function coveTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('cove', () => {
    const W = 8, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    // 画布原点在左上；UV v=0 对应地板远端，v=1 对应背墙顶端。
    const g = ctx.createLinearGradient(0, H, 0, 0);
    g.addColorStop(0.00, '#f7f9fb'); // 地板远端
    g.addColorStop(0.40, '#f2f5f9'); // 地板近端（主体落点，最亮）
    g.addColorStop(0.50, '#eef1f5'); // 圆角转角，极淡过渡
    g.addColorStop(0.64, '#e8edf2'); // 背墙下部
    g.addColorStop(1.00, '#dde4ec'); // 背墙上部，略冷暗
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // 极淡噪点，避免大面积渐变出现色带
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 3;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** 接触阴影：径向柔边暗斑，用来把主体"按"在地面上（柔和的 AO 接地感） */
export function contactShadowTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('contactshadow', () => {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0.0, 'rgba(10,14,20,0.72)');
    g.addColorStop(0.32, 'rgba(10,14,20,0.42)');
    g.addColorStop(0.6, 'rgba(10,14,20,0.14)');
    g.addColorStop(0.9, 'rgba(10,14,20,0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** IBL 房间：顶亮底暗的渐变球壳，给金属一个真实的"顶光"反射 */
export function envRoomTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('envroom', () => {
    const W = 16, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, '#5a626c'); // 顶（亮）
    g.addColorStop(0.45, '#333a42');
    g.addColorStop(0.78, '#1b1f25');
    g.addColorStop(1.0, '#0b0d10'); // 底（暗）
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

// ---------------------------------------------------------------------------
// 影棚环境（IBL 用）贴图
// ---------------------------------------------------------------------------

/**
 * 柔光箱光斑：解析生成的矩形软边光。
 * 用超椭圆距离场做衰减——core 段基本均匀（真实柔光箱中心也是均匀的），
 * 边缘平滑落到 0。烘焙进环境贴图后，金属/玻璃上就会出现**矩形柔和高光条**，
 * 这是产品摄影观感最关键的一处，硬边矩形或圆形光斑都不对。
 */
export function softboxTexture(size = 128, power = 5, core = 0.55): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached(`softbox-${size}-${power}-${core}`, () => {
    const [c, ctx] = canvas(size);
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = Math.abs((x / (size - 1)) * 2 - 1);
        const ny = Math.abs((y / (size - 1)) * 2 - 1);
        const dist = Math.pow(Math.pow(nx, power) + Math.pow(ny, power), 1 / power);
        // 1 → 0 的平滑衰减，core 之前保持满值
        let a = (1 - dist) / (1 - core);
        a = a < 0 ? 0 : a > 1 ? 1 : a;
        a = a * a * (3 - 2 * a);
        const i = (y * size + x) * 4;
        d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
        d[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** 背景罩：与无缝罩同色系，用户大幅拉远/穿出罩外时兜底，不会突然变黑 */
export function domeTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('dome', () => {
    const W = 16, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, '#eef2f6');
    g.addColorStop(0.55, '#e7ecf2');
    g.addColorStop(0.78, '#e0e6ee');
    g.addColorStop(1.0, '#dde4ec');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** 场景背景（等距柱状）：与背景罩同色系，用户大幅拉远时兜底，不会突然变黑 */
export function domeEquirectTexture(): THREE.Texture {
  if (!HAS_DOM) return placeholderTexture();
  return cached('dome-equirect', () => {
    const W = 32, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, '#eef2f6');
    g.addColorStop(0.55, '#e7ecf2');
    g.addColorStop(0.78, '#e0e6ee');
    g.addColorStop(1.0, '#dde4ec');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  });
}
