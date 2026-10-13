import * as THREE from 'three';
import { softboxTexture, domeTexture, groundTexture } from './textures';

/**
 * 影棚环境与背景。
 *
 * 分两部分：
 *
 * 1. `createStudioEnvironment()` —— 搭一个"黑房 + 柔光箱阵列"的小场景，
 *    用 PMREM 烘焙成 IBL 环境贴图。产品摄影的质感来自大面积柔光箱在
 *    金属与玻璃上投出的**矩形柔和高光条**；RoomEnvironment 那种普通房间
 *    给的是杂散窗光，观感更像"3D 默认渲染"而不是影棚。
 *
 * 2. `createStudio()` —— 球形渐变背景罩 + 地台 + 参考网格，组成一个组。
 *    球罩半径与地台半径相同且球心落在地台上，两者在赤道处严丝合缝，
 *    看不到背景与地面的接缝。整体按主体尺寸缩放/定位。
 */

interface Softbox {
  /** 面板尺寸（场景单位） */
  w: number;
  h: number;
  /** 面板中心 */
  pos: [number, number, number];
  /** 线性 RGB 染色（1,1,1 为中性白） */
  tint: [number, number, number];
  /** HDR 增益。>1 才能让金属出现明亮高光——PMREM 期间色调映射是关闭的，
   *  半浮点目标能留住 >1 的亮度，所以这里可以安全地给到 2 以上。 */
  gain: number;
}

/**
 * 柔光箱阵列。位置即灯光方向——场景里的 RectAreaLight 与投影平行光
 * 都按同一组坐标摆放，保证"看到的反射"和"投出的阴影"是同一盏灯。
 */
const SOFTBOXES: Softbox[] = [
  // 主光：左前上方，大而暖，负责主体绝大部分造型
  { w: 8.5, h: 10.5, pos: [-9.5, 7.5, 11], tint: [1.0, 0.985, 0.95], gain: 2.3 },
  // 补光：右侧更宽更柔，冷白，把暗部细节捞回来但不抢主光
  { w: 12, h: 14, pos: [12.5, 3.5, 6.5], tint: [0.9, 0.95, 1.0], gain: 0.85 },
  // 轮廓光：背后竖条，冷蓝，把主体从背景里"切"出来
  { w: 3, h: 17, pos: [1.5, 6.5, -14], tint: [0.82, 0.9, 1.0], gain: 1.9 },
  // 顶光：长条顶灯，给水平棱边一道细高光（手机/机身的"亮边"来源）
  { w: 4, h: 19, pos: [-2.5, 12.5, 1.5], tint: [1, 1, 1], gain: 1.15 },
  // 地面反弹：下方大面板，模拟影棚白色地台的反光，避免阴影面死黑
  { w: 30, h: 30, pos: [0, -9, 0], tint: [1.0, 0.97, 0.92], gain: 0.5 },
  // 前置反光板：左前下方。竖立物体的正面玻璃只会反射"水平线以下"的景物
  // （入射角等于反射角，相机在上方时反射光就指向下），所以正面要亮，
  // 必须在下面放一块板——这是影棚给手机/手表拍正面时的标准做法。
  // 位置要卡在正面法线的镜像方向上，否则玻璃上什么都不会出现。
  { w: 16, h: 11, pos: [-12, -6, 13], tint: [1.0, 0.99, 0.97], gain: 1.5 },
];

/** 主光在世界坐标中的位置（与 SOFTBOXES[0] 同方向） */
export const KEY_LIGHT_POS = new THREE.Vector3(-9.5, 7.5, 11);
export const FILL_LIGHT_POS = new THREE.Vector3(12.5, 3.5, 6.5);
export const RIM_LIGHT_POS = new THREE.Vector3(1.5, 6.5, -14);

/** 房间内表面的线性亮度（暗灰墙，提供环境底光） */
const ROOM_LEVEL = 0.1;

/**
 * 烘焙影棚 IBL。返回环境贴图；调用方负责 `scene.environment = tex`。
 */
export function createStudioEnvironment(pmrem: THREE.PMREMGenerator): THREE.Texture {
  const scene = new THREE.Scene();

  // 房间：内表面深灰。尺寸要足够大，装下所有柔光箱且不穿墙
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(64, 44, 64),
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: new THREE.Color().setRGB(ROOM_LEVEL, ROOM_LEVEL * 1.04, ROOM_LEVEL * 1.12),
    })
  );
  scene.add(room);

  const tex = softboxTexture();
  const origin = new THREE.Vector3(0, 0, 0);
  for (const s of SOFTBOXES) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(s.w, s.h),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: new THREE.Color().setRGB(s.tint[0] * s.gain, s.tint[1] * s.gain, s.tint[2] * s.gain),
      })
    );
    m.position.set(s.pos[0], s.pos[1], s.pos[2]);
    m.lookAt(origin);
    scene.add(m);
  }

  // sigma 0.02：几乎不额外模糊，保留柔光箱的矩形轮廓
  const rt = pmrem.fromScene(scene, 0.02, 0.1, 200);

  room.geometry.dispose();
  (room.material as THREE.Material).dispose();
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o !== room) {
      (o as THREE.Mesh).geometry.dispose();
      ((o as THREE.Mesh).material as THREE.Material).dispose();
    }
  });

  return rt.texture;
}

export interface Studio {
  group: THREE.Group;
  /** 按主体包围盒定位 + 缩放：地台落在主体最低点，球罩半径包住整个拍摄范围 */
  fit(box: THREE.Box3, camDistance: number): void;
  dispose(): void;
}

/**
 * 影棚背景组。内部几何都按单位半径建模，靠 group.scale 缩放到目标尺寸，
 * 这样四个尺寸差了一两个数量级的主体（芯片 / 手机 / 无人机 / 火箭）能共用一套。
 */
export function createStudio(): Studio {
  const group = new THREE.Group();
  group.name = 'studio';

  // 球形背景罩（BackSide 看内壁），球心位于地台平面
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 32),
    new THREE.MeshBasicMaterial({ map: domeTexture(), side: THREE.BackSide })
  );
  dome.name = 'backdrop';
  group.add(dome);

  // 地台：与球罩同半径，赤道处完全重合
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshStandardMaterial({
      map: groundTexture(),
      color: 0xffffff,
      roughness: 0.68,
      metalness: 0.03,
      envMapIntensity: 0.9,
    })
  );
  ground.name = 'studio-ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  return {
    group,
    fit(box: THREE.Box3, camDistance: number) {
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const extent = Math.max(size.x, size.y, size.z);
      // 半径要同时满足：包住主体、包住相机到主体的距离（否则相机会穿到罩外）
      const r = Math.max(extent * 3.2, camDistance * 1.9, 18);
      group.position.set(center.x, box.min.y - 0.004, center.z);
      group.scale.setScalar(r);
    },
    dispose() {
      dome.geometry.dispose();
      (dome.material as THREE.Material).dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
    },
  };
}
