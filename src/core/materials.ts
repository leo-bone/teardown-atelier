import * as THREE from 'three';
import {
  pcbTexture,
  brushedTexture,
  carbonTexture,
  waferTexture,
  ablativeTexture,
  scorchTexture,
} from './textures';

/** 统一材质库。light 主题下所有色值保证文字与图形对比度足够。 */
const cache = new Map<string, THREE.Material>();

export interface MatOpts {
  color: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transparent?: boolean;
  emissive?: number;
  emissiveIntensity?: number;
  flatShading?: boolean;
  side?: THREE.Side;
  transmission?: number;
  thickness?: number;
  /** 程序化贴图 */
  map?: THREE.Texture;
  /** 贴图重复次数 [u, v] */
  repeat?: [number, number];
  /** 法线强度（配合 bumpMap） */
  bumpScale?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
  ior?: number;
}

export function mat(opts: MatOpts): THREE.MeshStandardMaterial {
  const key = JSON.stringify({ ...opts, map: undefined, repeat: opts.repeat });
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;

  const maps = opts.map ? { map: opts.map } : {};
  const bump = opts.map ? { bumpMap: opts.map, bumpScale: opts.bumpScale ?? 0.012 } : {};

  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.color),
    // 金属默认给高 metalness + 中低 roughness；非金属反之。
    // 这是"塑料 vs 金属"观感差异的主因，默认值必须按材质语义给对。
    metalness: opts.metalness ?? 0.0,
    roughness: opts.roughness ?? 0.5,
    transparent: opts.transparent ?? (opts.opacity ?? 1) < 1,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    flatShading: opts.flatShading ?? false,
    envMapIntensity: opts.envMapIntensity ?? 1,
    ...maps,
    ...bump,
  });

  if (opts.emissive !== undefined) {
    m.emissive = new THREE.Color(opts.emissive);
    m.emissiveIntensity = opts.emissiveIntensity ?? 1;
  }

  const tr = opts.transmission ?? 0;
  if (tr > 0) {
    const pm = m as unknown as THREE.MeshPhysicalMaterial;
    pm.transmission = tr;
    pm.thickness = opts.thickness ?? 1;
    pm.ior = opts.ior ?? 1.5;
    if (opts.clearcoat !== undefined) {
      pm.clearcoat = opts.clearcoat;
      pm.clearcoatRoughness = opts.clearcoatRoughness ?? 0.1;
    }
  }

  cache.set(key, m);
  return m;
}

/**
 * 芯片 die 表面：带晶圆网格分割的功能分区纹理 + 金属反射
 */
export function dieMaterial(base = 0x1d5f5a, accent = 0x7ff0d8): THREE.MeshStandardMaterial {
  const key = `die-${base}-${accent}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(base),
    map: waferTexture('#' + base.toString(16).padStart(6, '0'), '#' + accent.toString(16).padStart(6, '0')),
    metalness: 0.92,
    roughness: 0.22,
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.14,
    envMapIntensity: 1.4,
  });
  cache.set(key, m);
  return m;
}

/** PCB 基板：绿色走线贴图，低金属度（FR-4 是玻璃纤维环氧） */
export function pcbMaterial(color = 0xffffff): THREE.MeshStandardMaterial {
  const key = `pcbmat-${color}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color,
    map: pcbTexture(),
    metalness: 0.12,
    roughness: 0.72,
    bumpMap: pcbTexture(),
    bumpScale: 0.02,
    envMapIntensity: 0.7,
  });
  cache.set(key, m);
  return m;
}

/**
 * 抛光不锈钢中框：拉丝纹 + 高金属度。
 * 用 MeshPhysicalMaterial 的各向异性（anisotropy）做拉丝——
 * 各项同性高光会把金属抹成"塑料感"，各向异性才会出现顺纹方向的细长反射条，
 * 这是拉丝金属一眼可辨的特征。
 */
export function steelMaterial(color = 0xc4c9ce): THREE.MeshPhysicalMaterial {
  const key = `steel-${color}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshPhysicalMaterial;
  const m = new THREE.MeshPhysicalMaterial({
    color,
    map: brushedTexture(),
    metalness: 1.0,
    roughness: 0.28,
    bumpMap: brushedTexture(),
    bumpScale: 0.004,
    envMapIntensity: 1.85,
    anisotropy: 0.7,
    anisotropyRotation: Math.PI * 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.14,
  });
  cache.set(key, m);
  return m;
}

/**
 * 深色高反光面板（手机前屏 / 背板玻璃）。
 *
 * 真实手机的前后都是**不透光**的深色高光面——靠环境反射成像，而不是透过去看见内部。
 * 之前用 transmission 0.92 做"玻璃"，结果前盖像一层保鲜膜，整机读不出"这是一台手机"。
 * 这里改成低透射 + 高 clearcoat 的深色物理材质：黑亮面板上拖出柔光箱的条形高光。
 */
export function panelGlassMaterial(color = 0x141a22, opacity = 0.94): THREE.MeshPhysicalMaterial {
  const key = `panel-${color}-${opacity}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshPhysicalMaterial;
  const m = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.08,
    //  roughness 0.05 是"镜面玻璃"，高光会缩成一根细线，数码味重。
    //  真实手机玻璃是微绒面，高光摊成一条柔和的宽带——0.12 是这个手感。
    roughness: 0.12,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.038,
    envMapIntensity: 1.6,
    ior: 1.5,
    specularIntensity: 1,
    side: THREE.FrontSide,
  });
  cache.set(key, m);
  return m;
}

/** 玻璃 / 陶瓷：物理透射 + clearcoat 高光 */
export function glassMaterial(color = 0xaac4dd, opacity = 0.3): THREE.MeshPhysicalMaterial {
  const key = `glass-${color}-${opacity}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshPhysicalMaterial;
  const m = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: 0.045,
    transmission: 0.92,
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    specularIntensity: 1,
    side: THREE.DoubleSide,
    envMapIntensity: 1.7,
  });
  cache.set(key, m);
  return m;
}

/** 通用金属 */
export function metalMaterial(color: number, rough = 0.3, metal = 1): THREE.MeshStandardMaterial {
  const key = `metal-${color}-${rough}-${metal}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: rough,
    envMapIntensity: 1.35,
  });
  cache.set(key, m);
  return m;
}

/** 碳纤维复材（机臂 / 竞速件） */
export function carbonMaterial(): THREE.MeshStandardMaterial {
  const key = 'carbonmat';
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: carbonTexture(),
    bumpMap: carbonTexture(),
    bumpScale: 0.03,
    metalness: 0.45,
    roughness: 0.42,
    envMapIntensity: 1.2,
  });
  cache.set(key, m);
  return m;
}

/** 隔热瓦（多孔烧蚀陶瓷） */
export function ablativeMaterial(color = 0x2b2b2e): THREE.MeshStandardMaterial {
  const key = `abl-${color}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color,
    map: ablativeTexture(),
    bumpMap: ablativeTexture(),
    bumpScale: 0.05,
    metalness: 0.05,
    roughness: 0.95,
    envMapIntensity: 0.5,
  });
  cache.set(key, m);
  return m;
}

/** 再入烧蚀痕 */
export function scorchMaterial(): THREE.MeshStandardMaterial {
  const key = 'scorch';
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: scorchTexture(),
    metalness: 0.1,
    roughness: 0.88,
    envMapIntensity: 0.6,
    side: THREE.DoubleSide,
  });
  cache.set(key, m);
  return m;
}

/** 线框叠加，用于强调结构 */
export function wireOverlay(geo: THREE.BufferGeometry, color = 0x64748b, opacity = 0.28) {
  const edges = new THREE.EdgesGeometry(geo, 25);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  return line;
}

/**
 * 给一组几何体批量加线框。
 *
 * 注意：线框必须挂成**网格自己的子节点**。之前是挂到 group 上、直接用几何体
 * 原始坐标，结果所有线框都漂到分组原点去了——摄像头层因此多出 ±0.66 的 z 跨度，
 * 机身中间平白出现一圈错位的框。挂到 mesh 上才会跟着网格的变换一起走。
 */
export function addEdges(group: THREE.Object3D, color = 0x64748b, opacity = 0.3) {
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh;
      m.add(wireOverlay(m.geometry as THREE.BufferGeometry, color, opacity));
    }
  });
}
