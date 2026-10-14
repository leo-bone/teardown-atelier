import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Layer, Subject, TeardownStep, Hotspot } from '../core/types';

/**
 * 任意产品输入 → 拆解页（MVP 生成器）
 *
 * 设计约束（必须诚实）：
 * - 这是**通用模板重建**，不是该产品的真实规格。页面所有地方都要标明这一点。
 * - 完全离线、确定性：不调用任何外部服务，不需要后端，不暴露任何密钥。
 * - 参考图用 SVG 结构示意图（data URI），不是照片。
 * - 后续要换成 LLM 真实生成时，只需替换 generateSubject() 的产出，
 *   渲染链路（viewer / 层列表 / 参数卡 / 分步 / 对比）完全复用。
 */

// ---------- 几何片段 DSL ----------

type Shape = 'box' | 'slab' | 'cyl' | 'lens' | 'frame' | 'blade';

interface Piece {
  shape: Shape;
  size: [number, number, number];
  pos: [number, number, number];
  color: number;
  metalness?: number;
  roughness?: number;
  rot?: [number, number, number];
}

interface BlueprintLayer {
  id: string;
  name: string;
  group: string;
  pieces: Piece[];
  explodeScale?: number;
  body: string;
  stats: { label: string; value: string }[];
  stepTitle: string;
  tools: string[];
}

interface Blueprint {
  match: string[];
  label: string;
  layers: BlueprintLayer[];
}

const M = (metalness: number, roughness = 0.35) => ({ metalness, roughness });
const PLASTIC = { metalness: 0.05, roughness: 0.55 };
const GLASS = { metalness: 0.1, roughness: 0.08 };

function buildGroup(pieces: Piece[]): THREE.Group {
  const g = new THREE.Group();
  for (const p of pieces) {
    const [w, h, d] = p.size;
    let geo: THREE.BufferGeometry;
    switch (p.shape) {
      case 'cyl':
        geo = new THREE.CylinderGeometry(w, w, h, 28);
        break;
      case 'lens':
        geo = new THREE.SphereGeometry(w, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        break;
      case 'blade':
        geo = new THREE.BoxGeometry(w, h * 0.08, d);
        break;
      case 'frame': {
        // 四根细杆拼一个空心框，比实心盒更像"中框"
        const t = Math.max(w, d) * 0.035;
        const bar = (bw: number, bd: number, bx: number, bz: number) => {
          const m = new THREE.Mesh(
            new RoundedBoxGeometry(bw, h, bd, 2, t * 0.3),
            new THREE.MeshStandardMaterial({ color: p.color, ...M(p.metalness ?? 0.85, p.roughness ?? 0.3) })
          );
          m.position.set(bx, 0, bz);
          g.add(m);
        };
        bar(w, t, 0, -d / 2);
        bar(w, t, 0, d / 2);
        bar(t, d, -w / 2, 0);
        bar(t, d, w / 2, 0);
        continue;
      }
      case 'box':
      case 'slab': {
        // 圆角立方体：消费类产品的壳体几乎都是圆角的，直角盒一眼假
        const r = Math.min(w, h, d) * (p.shape === 'slab' ? 0.22 : 0.1);
        geo = new RoundedBoxGeometry(w, h, d, 3, Math.max(0.004, r));
        break;
      }
      default:
        geo = new THREE.BoxGeometry(w, h, d);
    }
    const base = p.shape === 'slab' || p.shape === 'lens' ? GLASS : PLASTIC;
    const override: { metalness?: number; roughness?: number } = {};
    if (p.metalness !== undefined) override.metalness = p.metalness;
    if (p.roughness !== undefined) override.roughness = p.roughness;
    const mat = new THREE.MeshStandardMaterial({
      color: p.color,
      ...base,
      ...override,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...p.pos);
    if (p.rot) mesh.rotation.set(...p.rot);
    g.add(mesh);
  }
  return g;
}

// ---------- 蓝图库 ----------

const BLUEPRINTS: Blueprint[] = [
  {
    match: ['手机', 'phone', 'iphone', '小米', '华为', '三星', 'oppo', 'vivo', '旗舰机', '智能机'],
    label: '智能手机',
    layers: [
      {
        id: 'screen', name: '屏幕总成', group: '显示', pieces: [
          { shape: 'slab', size: [1.46, 0.045, 2.9], pos: [0, 0.2, 0], color: 0x0d1116 },
          { shape: 'box', size: [0.22, 0.01, 0.22], pos: [0, 0.225, -1.1], color: 0x05070a },
        ], body: '最外层是粘合的屏幕总成：OLED 面板 + 触控层 + 盖板玻璃。拆它必须靠加热软化结构胶，硬撬必裂。', stats: [{ label: '拆解难度', value: '高（胶合）' }, { label: '复用性', value: '差' }],
        stepTitle: '加热软化边缘胶，吸盘开缝', tools: ['加热台 / 热风枪', '吸盘', '塑料撬片'],
      },
      {
        id: 'frame', name: '中框', group: '结构', pieces: [
          { shape: 'frame', size: [1.5, 0.15, 3.0], pos: [0, 0.1, 0], color: 0x8d949b },
        ], body: '金属中框承担结构强度与散热，同时是天线与按键的载体。多数机型从这里开始"散架"。', stats: [{ label: '材质', value: '铝 / 钢 / 钛' }, { label: '作用', value: '结构 + 散热 + 天线' }],
        stepTitle: '卸下固定螺丝，分离中框', tools: ['精密螺丝刀'],
      },
      {
        id: 'board', name: '主板', group: '电子', pieces: [
          { shape: 'slab', size: [1.25, 0.03, 2.3], pos: [0, 0, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.34, 0.03, 0.34], pos: [-0.25, 0.03, 0.5], color: 0x1b2228 },
          { shape: 'box', size: [0.2, 0.02, 0.2], pos: [0.3, 0.025, -0.4], color: 0x1b2228 },
        ], body: '主板把 SoC、存储、电源与射频收在一块板子上。现代机型大量采用堆叠与侧边封装来省面积。', stats: [{ label: '核心', value: 'SoC + 存储' }, { label: '维修性', value: '整板更换' }],
        stepTitle: '断开所有排线，取出主板', tools: ['防静电镊子', '塑料撬片'],
      },
      {
        id: 'battery', name: '电池', group: '能源', pieces: [
          { shape: 'box', size: [1.15, 0.085, 2.1], pos: [0, -0.12, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '锂聚合物软包电池，用拉片取出而不是撬——撬破的就是一颗火源。这是拆机安全的第一红线。', stats: [{ label: '类型', value: '锂聚合物软包' }, { label: '取出方式', value: '拉片' }],
        stepTitle: '先断电池排线，再拉拉片取出', tools: ['电池拉片', '塑料撬棒'],
      },
      {
        id: 'camera', name: '摄像头模组', group: '光学', pieces: [
          { shape: 'box', size: [0.52, 0.07, 0.52], pos: [-0.42, 0.02, -1.05], color: 0x1c2026 },
          { shape: 'cyl', size: [0.14, 0.06, 0.14], pos: [-0.5, 0.06, -1.13], color: 0x0a0d11 },
          { shape: 'cyl', size: [0.14, 0.06, 0.14], pos: [-0.3, 0.06, -1.13], color: 0x0a0d11 },
          { shape: 'cyl', size: [0.14, 0.06, 0.14], pos: [-0.4, 0.06, -0.94], color: 0x0a0d11 },
        ], body: '多摄共用一块金属底板整体拆下。镜头出厂已做光学对齐，不要单独拧镜片。', stats: [{ label: '维护性', value: '整组更换' }, { label: '对齐', value: '出厂校准' }],
        stepTitle: '取下多摄模组', tools: ['精密螺丝刀', '防静电镊子'],
      },
      {
        id: 'cooling', name: '散热层', group: '热学', pieces: [
          { shape: 'slab', size: [1.2, 0.02, 2.2], pos: [0, 0.07, 0], color: 0xd08c4a },
        ], body: '石墨 + 均热板把 SoC 的热摊到更大面积。背胶贴合，撕下基本不可复用。', stats: [{ label: '形式', value: '均热板 + 石墨' }, { label: '复用性', value: '一次性' }],
        stepTitle: '撕开散热层', tools: ['塑料撬棒', '加热台'],
      },
      {
        id: 'back', name: '后盖', group: '结构', pieces: [
          { shape: 'slab', size: [1.46, 0.04, 2.9], pos: [0, -0.22, 0], color: 0x2b3138 },
        ], body: '后盖同样是一圈结构胶，需要加热后慢撬。无线充电线圈与 NFC 常贴在内侧。', stats: [{ label: '材质', value: '玻璃 / 素皮 / 金属' }, { label: '拆后复用', value: '基本不可' }],
        stepTitle: '加热取下后盖', tools: ['加热台 / 热风枪', '撬片'],
      },
    ],
  },
  {
    match: ['笔记本', '电脑', 'laptop', 'macbook', 'thinkpad', '游戏本', '平板'],
    label: '笔记本电脑',
    layers: [
      {
        id: 'display', name: '屏幕与 A 面', group: '显示', pieces: [
          { shape: 'slab', size: [2.1, 0.03, 1.25], pos: [0, 0.62, -0.75], color: 0x0d1116 },
          { shape: 'box', size: [2.16, 0.06, 1.32], pos: [0, 0.56, -0.75], color: 0x9aa0a6, metalness: 0.8 },
        ], body: 'A 面与屏幕总成先整体拆下。排线穿过屏轴，是笔记本拆机最容易扯断的一处。', stats: [{ label: '易损点', value: '屏轴排线' }, { label: '维修性', value: '整屏更换' }],
        stepTitle: '拆下 A 面与屏幕总成', tools: ['精密螺丝刀', '塑料撬片'],
      },
      {
        id: 'keyboard', name: '键盘面（C 面）', group: '输入', pieces: [
          { shape: 'slab', size: [2.0, 0.03, 1.1], pos: [0, 0.3, 0.25], color: 0x1a1f25 },
        ], body: 'C 面承载键盘、触控板与电源键，多数通过排线与主板相连。', stats: [{ label: '连接', value: '排线' }, { label: '注意', value: '卡扣易断' }],
        stepTitle: '取下 C 面键盘板', tools: ['塑料撬片', '防静电镊子'],
      },
      {
        id: 'board', name: '主板', group: '电子', pieces: [
          { shape: 'slab', size: [1.7, 0.035, 1.0], pos: [0, 0.12, 0.1], color: 0x0f2f26 },
          { shape: 'box', size: [0.3, 0.04, 0.3], pos: [-0.4, 0.15, 0.25], color: 0x1b2228 },
        ], body: '笔记本主板集成度低于手机，CPU/GPU 常可单独更换，内存与 SSD 多为可插拔设计。', stats: [{ label: '可升级件', value: '内存 / SSD' }, { label: '可更换件', value: 'CPU / GPU（部分）' }],
        stepTitle: '断开排线，取出主板', tools: ['防静电镊子', '精密螺丝刀'],
      },
      {
        id: 'cooling', name: '散热模组', group: '热学', pieces: [
          { shape: 'box', size: [0.7, 0.09, 0.7], pos: [-0.35, 0.06, 0.1], color: 0xc9a06a, metalness: 0.85, roughness: 0.3 },
          { shape: 'cyl', size: [0.075, 0.05, 0.075], pos: [0.25, 0.06, 0.35], color: 0x8f98a1, metalness: 0.85, rot: [Math.PI / 2, 0, 0] },
        ], body: '热管 + 风扇把热量排到出风口。清灰换硅脂是笔记本最常见也最值得做的维护。', stats: [{ label: '维护项', value: '清灰 / 换硅脂' }, { label: '周期', value: '1–2 年' }],
        stepTitle: '拆散热模组，清灰换硅脂', tools: ['精密螺丝刀', '导热硅脂'],
      },
      {
        id: 'battery', name: '电池', group: '能源', pieces: [
          { shape: 'box', size: [1.5, 0.09, 0.85], pos: [0, -0.02, 0.15], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '内置锂聚合物电池，老化后续航骤降。更换时务必先断电，且不要刺穿软包。', stats: [{ label: '类型', value: '锂聚合物' }, { label: '衰减信号', value: '续航骤降 / 鼓包' }],
        stepTitle: '断电后取出电池', tools: ['精密螺丝刀', '塑料撬棒'],
      },
      {
        id: 'base', name: '底壳（D 面）', group: '结构', pieces: [
          { shape: 'slab', size: [2.0, 0.035, 1.15], pos: [0, -0.14, 0.2], color: 0x2b3138 },
        ], body: '最后是 D 面底壳，同时承担进风与脚垫。拆到底这里就该做全机清灰了。', stats: [{ label: '作用', value: '防护 + 进风' }, { label: '可换件', value: '脚垫' }],
        stepTitle: '拆下 D 面底壳', tools: ['精密螺丝刀'],
      },
    ],
  },
  {
    match: ['无人机', 'drone', '飞行器', '四轴', '穿越机'],
    label: '无人机',
    layers: [
      {
        id: 'body', name: '机身与机臂', group: '结构', pieces: [
          { shape: 'box', size: [0.62, 0.16, 0.42], pos: [0, 0, 0], color: 0x3a4048 },
          { shape: 'blade', size: [0.85, 0.05, 0.05], pos: [0, 0.05, 0.3], color: 0x2c3238, rot: [0, 0, 0] },
          { shape: 'blade', size: [0.85, 0.05, 0.05], pos: [0, 0.05, -0.3], color: 0x2c3238, rot: [0, 0, 0] },
        ], body: '机臂是碳纤维折叠结构，摔裂了按"件"换——碳纤维轻且刚，但坏了不能焊。', stats: [{ label: '机臂', value: '碳纤维折叠' }, { label: '维修', value: '整件更换' }],
        stepTitle: '检查并更换机臂', tools: ['碳纤维切割工具', '机臂校准工装'],
      },
      {
        id: 'motors', name: '电机与桨叶', group: '动力', pieces: [
          { shape: 'cyl', size: [0.075, 0.09, 0.075], pos: [0.42, 0.05, 0.3], color: 0x9aa0a6, metalness: 0.85 },
          { shape: 'cyl', size: [0.075, 0.09, 0.075], pos: [-0.42, 0.05, 0.3], color: 0x9aa0a6, metalness: 0.85 },
          { shape: 'cyl', size: [0.075, 0.09, 0.075], pos: [0.42, 0.05, -0.3], color: 0x9aa0a6, metalness: 0.85 },
          { shape: 'cyl', size: [0.075, 0.09, 0.075], pos: [-0.42, 0.05, -0.3], color: 0x9aa0a6, metalness: 0.85 },
        ], body: '无刷电机是易损件，摔机后按"换不修"处理——单台成本远低于拆开重绕。', stats: [{ label: '数量', value: '4 台无刷' }, { label: '策略', value: '换不修' }],
        stepTitle: '卸桨叶，拆四台电机', tools: ['桨叶拆装扳手', '电机固定螺丝刀'],
      },
      {
        id: 'gimbal', name: '云台相机', group: '光学', pieces: [
          { shape: 'box', size: [0.26, 0.24, 0.26], pos: [0, -0.14, 0.22], color: 0x1c2026 },
          { shape: 'cyl', size: [0.055, 0.05, 0.055], pos: [0, -0.1, 0.34], color: 0x0a0d11, rot: [Math.PI / 2, 0, 0] },
        ], body: '云台是整机最精密的模组，三轴增稳。拆时先断排线再松减震球，硬掰直接废掉增稳电机。', stats: [{ label: '轴数', value: '三轴' }, { label: '维修性', value: '整组更换' }],
        stepTitle: '拆云台相机模组', tools: ['精密螺丝刀', '防静电镊子'],
      },
      {
        id: 'sensor', name: '图像传感器', group: '光学', pieces: [
          { shape: 'box', size: [0.16, 0.1, 0.16], pos: [0, -0.2, 0.26], color: 0x11151a, metalness: 0.4 },
        ], body: '传感器与镜筒的对位精度要求极高，属于不可外场维修件。', stats: [{ label: '维护性', value: '不可外场维修' }, { label: '对位', value: '光学级' }],
        stepTitle: '取出图像传感器', tools: ['无尘环境', '光学对准工装'],
      },
      {
        id: 'board', name: '飞控与图传', group: '电子', pieces: [
          { shape: 'slab', size: [0.42, 0.02, 0.3], pos: [0, 0.11, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.12, 0.03, 0.08], pos: [0.1, 0.13, -0.08], color: 0x1b2228 },
        ], body: '飞控 + 图传 + 全向避讳的视觉/红外孔径集中在这块，排线密、屏蔽要求高。', stats: [{ label: '组成', value: '飞控 + 图传' }, { label: '感知', value: '全向视觉 / 红外' }],
        stepTitle: '拆飞控与图传模块', tools: ['防静电镊子', '射频线压接工具'],
      },
      {
        id: 'battery', name: '飞行电池', group: '能源', pieces: [
          { shape: 'box', size: [0.3, 0.12, 0.22], pos: [0, 0.02, -0.12], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '拆任何东西之前先把电池拔掉。带电拆机既危险也容易烧电调。', stats: [{ label: '安装', value: '卡扣快拆' }, { label: '安全', value: '先断电' }],
        stepTitle: '先取飞行电池', tools: ['无（卡扣式快拆）'],
      },
    ],
  },
  {
    match: ['汽车', '轿车', 'suv', '电动车', '特斯拉', 'byd', '车'],
    label: '汽车',
    layers: [
      {
        id: 'body', name: '车身与外壳', group: '结构', pieces: [
          { shape: 'slab', size: [3.4, 0.5, 1.6], pos: [0, 0.32, 0], color: 0x9aa0a6, metalness: 0.6, roughness: 0.3 },
          { shape: 'slab', size: [1.2, 0.42, 1.5], pos: [-0.2, 0.6, 0], color: 0x1a2028 },
        ], body: '外壳覆盖件多为胶接 + 铆接固定，拆解基本等于破坏性作业。', stats: [{ label: '固定', value: '胶接 + 铆接' }, { label: '拆解', value: '破坏性' }],
        stepTitle: '拆下车身覆盖件', tools: ['车身胶接切割设备', '铆钉钻除工具'],
      },
      {
        id: 'wheels', name: '车轮与制动', group: '行走', pieces: [
          { shape: 'cyl', size: [0.34, 0.24, 0.34], pos: [-1.1, -0.25, 0.72], color: 0x0d0f12, rot: [0, 0, Math.PI / 2] },
          { shape: 'cyl', size: [0.34, 0.24, 0.34], pos: [1.1, -0.25, 0.72], color: 0x0d0f12, rot: [0, 0, Math.PI / 2] },
          { shape: 'cyl', size: [0.34, 0.24, 0.34], pos: [-1.1, -0.25, -0.72], color: 0x0d0f12, rot: [0, 0, Math.PI / 2] },
          { shape: 'cyl', size: [0.34, 0.24, 0.34], pos: [1.1, -0.25, -0.72], color: 0x0d0f12, rot: [0, 0, Math.PI / 2] },
        ], body: '先上举升机卸四轮，刹车、悬架与动力总成全露出面来，是整条拆解线的入口。', stats: [{ label: '机轮', value: '4 × 单轮' }, { label: '制动', value: '通风盘 + 多活塞' }],
        stepTitle: '举升车辆，卸下四条轮', tools: ['四柱 / 两柱举升机', '扭矩扳手'],
      },
      {
        id: 'suspension', name: '悬架系统', group: '行走', pieces: [
          { shape: 'blade', size: [0.5, 0.06, 0.06], pos: [-1.0, -0.05, 0.6], color: 0x7d8388, metalness: 0.9 },
          { shape: 'blade', size: [0.5, 0.06, 0.06], pos: [1.0, -0.05, 0.6], color: 0x7d8388, metalness: 0.9 },
        ], body: '悬架连杆按对角顺序松橡胶衬套螺栓，避免衬套预载变形。', stats: [{ label: '前悬架', value: '麦弗逊' }, { label: '后悬架', value: '多连杆' }],
        stepTitle: '拆前后悬架总成', tools: ['悬架拆装工装', '四轮定位仪'],
      },
      {
        id: 'powertrain', name: '动力总成', group: '动力', pieces: [
          { shape: 'box', size: [0.8, 0.6, 0.9], pos: [0.1, 0.0, 0], color: 0x8a8f93, metalness: 0.85, roughness: 0.3 },
          { shape: 'cyl', size: [0.28, 0.3, 0.28], pos: [0.5, 0.0, 0], color: 0x767b80, metalness: 0.85, rot: [0, 0, Math.PI / 2] },
        ], body: '燃油车是发动机 + 变速箱，电动车是电机 + 电控 + 减速器。共同点是都必须整体吊出。', stats: [{ label: '燃油车', value: '发动机 + 变速箱' }, { label: '电动车', value: '电机 + 电控' }],
        stepTitle: '吊出动力总成', tools: ['发动机吊装架', '变速箱支撑架'],
      },
      {
        id: 'battery', name: '高压电池（如电车）', group: '能源', pieces: [
          { shape: 'slab', size: [2.4, 0.16, 1.3], pos: [0, -0.05, 0], color: 0x2b3440, metalness: 0.6 },
        ], body: '电动车的动力电池平铺在底盘。拆它之前必须做高压下电，等待电容放电。', stats: [{ label: '安全', value: '高压下电 + 等待放电' }, { label: '位置', value: '底盘平铺' }],
        stepTitle: '高压下电后拆电池包', tools: ['高压绝缘工具', '举升机'],
      },
      {
        id: 'interior', name: '内饰与线束', group: '座舱', pieces: [
          { shape: 'box', size: [1.6, 0.35, 1.2], pos: [-0.3, 0.45, 0], color: 0x3a2f2a },
        ], body: '内饰件多为卡扣固定，拆的时候要按顺序，硬掰会断一批卡扣。', stats: [{ label: '固定', value: '卡扣 + 螺丝' }, { label: '注意', value: '卡扣易断' }],
        stepTitle: '拆内饰与线束', tools: ['塑料撬板', '精密螺丝刀'],
      },
    ],
  },
  {
    match: ['芯片', 'gpu', 'cpu', '显卡', '处理器', 'ai', '加速卡', '板卡'],
    label: '半导体器件',
    layers: [
      {
        id: 'package', name: '封装整体', group: '封装', pieces: [
          { shape: 'box', size: [1.3, 0.14, 1.3], pos: [0, 0, 0], color: 0x2b3440, metalness: 0.5, roughness: 0.4 },
        ], body: '从主板取下整块封装。这是最贵的一颗件，一次拆卸基本等于报废，只发生在失效分析场景。', stats: [{ label: '拆解场景', value: '失效分析' }, { label: '复用', value: '不可' }],
        stepTitle: '从主板取下封装', tools: ['BGA 热风返修台', 'X-Ray 检测'],
      },
      {
        id: 'substrate', name: '封装基板', group: '封装', pieces: [
          { shape: 'slab', size: [1.2, 0.04, 1.2], pos: [0, -0.12, 0], color: 0x1f6b5c },
        ], body: '有机基板承载全部供电与信号再分配，BGA 焊球把封装连到主板。分层数直接决定供电能力。', stats: [{ label: '连接', value: 'BGA 焊球' }, { label: '作用', value: '供电 + 信号再分配' }],
        stepTitle: '分离封装基板', tools: ['基板切割设备', '层析检测设备'],
      },
      {
        id: 'interposer', name: '硅中介层', group: '互连', pieces: [
          { shape: 'slab', size: [1.05, 0.02, 1.05], pos: [0, -0.2, 0], color: 0x215a78 },
        ], body: '中介层把多个 die 与显存连到同一平面。TSV 硅通孔 + 再分配层，是先进封装真正的技术壁垒。', stats: [{ label: '关键结构', value: 'TSV + RDL' }, { label: '地位', value: '先进封装核心' }],
        stepTitle: '拆开硅中介层', tools: ['激光开盖设备', 'SEM / FIB 检测'],
      },
      {
        id: 'dies', name: '计算与 I/O die', group: '核心', pieces: [
          { shape: 'box', size: [0.44, 0.03, 0.44], pos: [-0.2, -0.26, -0.2], color: 0x1f6b5c },
          { shape: 'box', size: [0.3, 0.03, 0.3], pos: [0.22, -0.26, 0.22], color: 0x3a2f6b },
        ], body: '计算 die 做到 reticle 极限尺寸，I/O die 负责对外互连。分开做可以在同一制程下分别优化两者。', stats: [{ label: '计算 die', value: 'reticle 级' }, { label: 'I/O die', value: 'SerDes 互连' }],
        stepTitle: '取出计算与 I/O die', tools: ['芯片级开封设备', '探针台'],
      },
      {
        id: 'memory', name: '显存堆栈', group: '存储', pieces: [
          { shape: 'box', size: [0.26, 0.07, 0.16], pos: [0.3, -0.26, -0.3], color: 0x2a5a80 },
          { shape: 'box', size: [0.26, 0.07, 0.16], pos: [-0.3, -0.26, 0.3], color: 0x2a5a80 },
        ], body: '3D 堆叠的 DRAM 用 TSV 垂直互连，带宽是传统 GDDR 的数倍——算力瓶颈往往在喂不喂得进数据。', stats: [{ label: '形式', value: '3D 堆叠' }, { label: '互连', value: 'TSV 垂直' }],
        stepTitle: '取下显存堆栈', tools: ['堆叠拆解设备', '金相显微镜'],
      },
    ],
  },
  {
    match: ['手表', 'watch', '手环', '智能穿戴'],
    label: '智能手表',
    layers: [
      {
        id: 'case', name: '表壳', group: '结构', pieces: [
          { shape: 'box', size: [0.5, 0.14, 0.6], pos: [0, 0, 0], color: 0x9aa0a6, metalness: 0.85 },
          { shape: 'cyl', size: [0.05, 0.06, 0.05], pos: [0.26, 0, 0], color: 0x767b80, metalness: 0.85 },
        ], body: '表壳承担密封与结构，多数从背面开启。防水胶圈是拆后必须更换的易损件。', stats: [{ label: '开启方式', value: '后盖' }, { label: '必换件', value: '防水胶圈' }],
        stepTitle: '打开表壳后盖', tools: ['专用后盖工具', '防水胶圈'],
      },
      {
        id: 'display', name: '显示屏', group: '显示', pieces: [
          { shape: 'slab', size: [0.44, 0.02, 0.54], pos: [0, 0.08, 0], color: 0x0d1116 },
        ], body: 'OLED 屏幕多为胶合，加热后开启。边框极窄，撬的时候很容易伤到边缘。', stats: [{ label: '维修性', value: '整屏更换' }, { label: '开启', value: '加热 + 撬' }],
        stepTitle: '加热取下显示屏', tools: ['加热台', '塑料撬片'],
      },
      {
        id: 'board', name: '主板', group: '电子', pieces: [
          { shape: 'slab', size: [0.4, 0.02, 0.48], pos: [0, 0, 0], color: 0x0f2f26 },
        ], body: '手表主板高度集成，SiP 封装把处理器、存储、无线收在一颗件里。', stats: [{ label: '封装', value: 'SiP' }, { label: '维修性', value: '整板更换' }],
        stepTitle: '取出主板', tools: ['防静电镊子'],
      },
      {
        id: 'battery', name: '电池', group: '能源', pieces: [
          { shape: 'box', size: [0.34, 0.06, 0.42], pos: [0, -0.09, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '手表电池容量小、循环次数多，是最先老化的件。更换要断电并避免刺破。', stats: [{ label: '老化', value: '快' }, { label: '安全', value: '先断电' }],
        stepTitle: '断电后取出电池', tools: ['塑料撬棒'],
      },
      {
        id: 'sensor', name: '健康传感器', group: '传感', pieces: [
          { shape: 'box', size: [0.2, 0.03, 0.2], pos: [0, -0.13, 0.14], color: 0x1f6f7a },
        ], body: '底部光学 + 电极阵列测心率血氧。窗口玻璃有污渍会直接导致读数漂移。', stats: [{ label: '组成', value: '光学 + 电极' }, { label: '维护', value: '清洁窗口' }],
        stepTitle: '检查健康传感器窗口', tools: ['无尘布', '精密螺丝刀'],
      },
      {
        id: 'strap', name: '表带', group: '结构', pieces: [
          { shape: 'slab', size: [0.16, 0.04, 0.9], pos: [0, 0, 0.62], color: 0x2b3138 },
          { shape: 'slab', size: [0.16, 0.04, 0.9], pos: [0, 0, -0.62], color: 0x2b3138 },
        ], body: '表带是快拆设计，属于唯一可以无损自行更换的部分。', stats: [{ label: '更换', value: '快拆无损' }, { label: '材质', value: '硅胶 / 金属 / 皮革' }],
        stepTitle: '更换快拆表带', tools: ['无（快拆）'],
      },
    ],
  },
];

const DEFAULT_BLUEPRINT: Blueprint = {
  match: [],
  label: '通用设备',
  layers: [
    {
      id: 'shell', name: '外壳 / 上盖', group: '结构', pieces: [
        { shape: 'slab', size: [1.5, 0.06, 1.1], pos: [0, 0.16, 0], color: 0x2b3138 },
      ], body: '外壳多为卡扣 + 螺丝固定。先找螺丝再找卡扣，顺序错了会断一批卡扣。', stats: [{ label: '固定', value: '卡扣 + 螺丝' }, { label: '注意', value: '卡扣易断' }],
      stepTitle: '拆下外壳上盖', tools: ['精密螺丝刀', '塑料撬片'],
    },
    {
      id: 'panel', name: '控制面板 / 接口板', group: '电子', pieces: [
        { shape: 'slab', size: [1.2, 0.03, 0.7], pos: [0, 0.05, 0], color: 0x0f2f26 },
        { shape: 'box', size: [0.24, 0.05, 0.16], pos: [-0.3, 0.04, -0.2], color: 0x1b2228 },
      ], body: '按键、旋钮、接口通常集中在一块小板上，通过排线与主板相连。', stats: [{ label: '连接', value: '排线' }, { label: '维修', value: '小板更换' }],
      stepTitle: '取下控制面板', tools: ['防静电镊子', '塑料撬片'],
    },
    {
      id: 'board', name: '主控板', group: '电子', pieces: [
        { shape: 'slab', size: [1.3, 0.035, 0.9], pos: [0, -0.05, 0], color: 0x0f2f26 },
        { shape: 'box', size: [0.3, 0.04, 0.3], pos: [0.2, -0.02, 0.2], color: 0x1b2228 },
      ], body: '主控板是设备的核心，控制器、电源与驱动电路都在这上面。', stats: [{ label: '组成', value: '控制器 + 电源' }, { label: '维修', value: '整板更换' }],
      stepTitle: '取出主控板', tools: ['防静电镊子', '精密螺丝刀'],
    },
    {
      id: 'battery', name: '电池 / 电源模块', group: '能源', pieces: [
        { shape: 'box', size: [0.9, 0.1, 0.5], pos: [0, -0.16, -0.1], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
      ], body: '带电设备拆机第一件事永远是断电。电池不要刺破、不要短路。', stats: [{ label: '安全', value: '先断电' }, { label: '风险', value: '刺破 / 短路' }],
      stepTitle: '断电后取出电池', tools: ['塑料撬棒', '精密螺丝刀'],
    },
    {
      id: 'motor', name: '执行 / 传动部件', group: '动力', pieces: [
        { shape: 'cyl', size: [0.16, 0.16, 0.16], pos: [0, -0.1, 0.28], color: 0x9aa0a6, metalness: 0.85 },
        { shape: 'box', size: [0.3, 0.08, 0.12], pos: [0, -0.1, 0.42], color: 0x767b80, metalness: 0.85 },
      ], body: '电机 / 泵 / 传动机构是机械磨损的主要来源，通常是整机寿命的瓶颈。', stats: [{ label: '磨损', value: '主要来源' }, { label: '维修', value: '部件更换' }],
      stepTitle: '拆下执行部件', tools: ['精密螺丝刀', '专用拉马'],
    },
    {
      id: 'base', name: '底壳 / 底座', group: '结构', pieces: [
        { shape: 'slab', size: [1.5, 0.05, 1.1], pos: [0, -0.26, 0], color: 0x1f242a },
      ], body: '最后是底壳，通常还承担脚垫、进风与配重作用。', stats: [{ label: '作用', value: '防护 + 配重' }, { label: '可换件', value: '脚垫' }],
      stepTitle: '拆下底壳底座', tools: ['精密螺丝刀'],
    },
  ],
};

// ---------- SVG 结构示意图（离线参考图） ----------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function shade(color: number, f: number): string {
  const r = Math.round(((color >> 16) & 255) * f);
  const g = Math.round(((color >> 8) & 255) * f);
  const b = Math.round((color & 255) * f);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** 生成一张爆炸结构示意图（SVG data URI） */
export function explodedSvg(
  title: string,
  subtitle: string,
  items: { name: string; group: string; color: number }[]
): string {
  const W = 900;
  const H = 600;
  const parts: string[] = [];
  parts.push(
    `<rect width="${W}" height="${H}" fill="#0c0e11"/>`,
    `<rect x="0" y="0" width="${W}" height="3" fill="url(#g)"/>`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0" stop-color="#5b8cff"/><stop offset="1" stop-color="#9b7bff"/></linearGradient></defs>`
  );

  const n = items.length;
  const boxW = 330;
  const boxH = 66;
  const startX = 70;
  // 纵向：在 130–500 区间内居中堆叠，层数多时自动压缩间距，避免撞底部脚注
  const step = Math.min(62, (500 - 130) / Math.max(1, n - 1));
  const stackH = (n - 1) * step + boxH;
  const startY = 130 + (370 - stackH) / 2;

  items.forEach((it, i) => {
    const x = startX + i * 26;
    const y = startY + i * step;
    const fill = shade(it.color, 0.42);
    const stroke = shade(it.color, 0.85);
    parts.push(
      `<g>`,
      `<rect x="${x + 6}" y="${y + 6}" width="${boxW}" height="${boxH}" rx="12" fill="rgba(0,0,0,.45)"/>`,
      `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`,
      `<rect x="${x + 14}" y="${y + boxH / 2 - 9}" width="18" height="18" rx="5" fill="${stroke}"/>`,
      `<text x="${x + 44}" y="${y + 27}" font-family="-apple-system,PingFang SC,sans-serif" font-size="15" font-weight="700" fill="#e9ecf0">${esc(it.name)}</text>`,
      `<text x="${x + 44}" y="${y + 47}" font-family="-apple-system,PingFang SC,sans-serif" font-size="11" fill="#8b95a1">${esc(it.group)}</text>`,
      `<text x="${x + boxW - 16}" y="${y + boxH / 2 + 5}" text-anchor="end" font-family="ui-monospace,monospace" font-size="13" font-weight="700" fill="#c7d0da">${String(i + 1).padStart(2, '0')}</text>`,
      `</g>`
    );
  });

  parts.push(
    `<text x="56" y="72" font-family="-apple-system,PingFang SC,sans-serif" font-size="30" font-weight="800" fill="#ffffff">${esc(title)}</text>`,
    `<text x="56" y="100" font-family="-apple-system,PingFang SC,sans-serif" font-size="14" fill="#aab2bd">${esc(subtitle)}</text>`,
    `<text x="56" y="${H - 26}" font-family="-apple-system,PingFang SC,sans-serif" font-size="11" fill="#5d6771">结构示意图 · 通用模板生成 · 非实拍、非真实规格</text>`
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ---------- 主体生成 ----------

function pickBlueprint(query: string): Blueprint {
  const q = query.toLowerCase();
  for (const bp of BLUEPRINTS) {
    if (bp.match.some((k) => q.includes(k.toLowerCase()))) return bp;
  }
  return DEFAULT_BLUEPRINT;
}

function slugify(s: string): string {
  return (
    'gen-' +
    (s
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'device')
  );
}

export function generateSubject(rawQuery: string): Subject {
  const query = rawQuery.trim();
  const bp = pickBlueprint(query);
  const id = slugify(query);
  const name = query.length > 28 ? `${query.slice(0, 28)}…` : query;
  const n = bp.layers.length;

  const layers: Layer[] = bp.layers.map((l, i) => {
    const refImage = explodedSvg(
      name,
      `${bp.label} · ${l.group} · 结构示意`,
      [{ name: l.name, group: l.group, color: l.pieces[0]?.color ?? 0x4b5563 }]
    );
    const hotspots: Hotspot[] = [
      {
        id: `${l.id}-main`,
        title: l.name,
        body: l.body,
        anchor: new THREE.Vector3(
          l.pieces[0]?.pos[0] ?? 0,
          (l.pieces[0]?.pos[1] ?? 0) + 0.12,
          l.pieces[0]?.pos[2] ?? 0
        ),
        stats: l.stats,
      },
    ];
    return {
      id: l.id,
      name: l.name,
      group: l.group,
      explodeDir: new THREE.Vector3((i - (n - 1) / 2) * 0.34, 1.25 + i * 0.28, 0.16 * (i - (n - 1) / 2)),
      explodeScale: l.explodeScale ?? 1,
      sectionable: true,
      build: () => buildGroup(l.pieces),
      hotspots,
      refImage,
    };
  });

  const steps: TeardownStep[] = bp.layers.map((l, i) => ({
    id: `gen-s${i + 1}`,
    title: l.stepTitle,
    body: `${l.body}（通用模板步骤，实际拆解请以该产品的官方维修手册为准。）`,
    layers: [l.id],
    tools: l.tools,
    stats: l.stats,
  }));

  const heroImage = explodedSvg(name, `${bp.label} · ${n} 个结构层 · 通用模板重建`, [
    ...bp.layers.map((l) => ({ name: l.name, group: l.group, color: l.pieces[0]?.color ?? 0x4b5563 })),
  ]);

  const modeledParts = bp.layers.reduce((acc, l) => acc + l.pieces.length, 0);

  return {
    id,
    name,
    subtitle: `${bp.label} · 通用模板重建`,
    tagline: `按通用模板重建的 ${n} 层结构示意，用于演示拆解呈现方式`,
    headline: [
      { label: '结构层', value: String(n), unit: '层' },
      { label: '拆解步骤', value: String(n), unit: '步' },
      { label: '形态', value: '示意' },
      { label: '规格可信度', value: '低' },
    ],
    background: 0x0c0e11,
    accent: '#5b8cff',
    camera: { position: [0, 0.9, 3.4], target: [0, 0, 0] },
    explodeScale: 1,
    sectionable: true,
    heroImage,
    layers,
    steps,
    overview:
      `这是针对「${query}」按**通用模板**自动生成的结构示意，不是该产品的真实规格。` +
      `模板按${bp.label}的常见结构给出 ${n} 个层：${bp.layers.map((l) => l.name).join('、')}。` +
      `所有层的形状、位置、参数均为示意，不能作为维修依据。`,
    narrative: [
      `**为什么是"示意"**：任意产品的真实拆解需要权威拆解资料支撑，通用模板只能给出这一类产品的常见结构。`,
      `**能用的部分**：拆解呈现方式（层划分、爆炸方向、分步流程、参数卡）与真实主体完全一致，可以直接对照体验。`,
      `**要做成真实规格**：需要接入 LLM + 权威资料检索，由后端代理调用（见仓库 GAP_ANALYSIS.md 的 MVP 方案）。`,
    ],
    specs: [
      { label: '产品', value: name },
      { label: '类别', value: bp.label },
      { label: '结构层', value: `${n} 层` },
      { label: '建模方式', value: '参数化重建 · 通用模板', note: '非真机扫描、非真实规格' },
      { label: '参考图', value: '结构示意图', note: 'SVG 生成，非实拍照片' },
      { label: '规格可信度', value: '低', note: '仅用于演示呈现方式' },
    ],
    fidelity: {
      actualParts: 0,
      source: '无（通用模板，无权威拆解资料）',
      modeledLayers: n,
      modeledParts,
      note: '模板未对应任何具体机型的真实零件数。',
    },
  };
}
