import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Layer, Subject, TeardownStep, Hotspot } from '../core/types';
import { getLang } from '../i18n';
import { BLUEPRINT_EN } from './en/blueprints';

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
    match: ['汽车', '轿车', 'suv', '电动车', '特斯拉', 'byd', '燃油车'],
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
  {
    match: ['相机', '单反', '微单', '镜头', '摄影机', 'camera', 'dslr', 'mirrorless'],
    label: '相机 / 镜头',
    layers: [
      {
        id: 'body', name: '机身与外壳', group: '结构', pieces: [
          { shape: 'box', size: [2.4, 1.5, 0.9], pos: [0, 0, 0], color: 0x1c1f24, metalness: 0.5, roughness: 0.45 },
          { shape: 'box', size: [0.7, 0.6, 0.4], pos: [1.0, 0.3, 0], color: 0x2a2e34 },
        ], body: '机身是骨架与蒙皮，握持处包覆蒙皮、按键与转盘集成其上。单反有反光镜箱、微单取消反光镜以缩短法兰距。', stats: [{ label: '类型', value: '单反 / 微单' }, { label: '开盖', value: '底盖 + 侧盖' }],
        stepTitle: '卸下外壳与握持蒙皮', tools: ['精密螺丝刀', '塑料撬片'],
      },
      {
        id: 'sensor', name: '影像传感器（CMOS）', group: '光学', pieces: [
          { shape: 'slab', size: [1.1, 0.06, 0.75], pos: [0, -0.1, 0], color: 0x14171c, metalness: 0.3, roughness: 0.3 },
        ], body: 'CMOS 是相机的"底片"，对震动与静电极敏感。APS-C 与全画幅只是面积不同；清洁要一气呵成、避免划伤低通/保护玻璃。', stats: [{ label: '核心', value: 'CMOS 感光' }, { label: '注意', value: '静电 / 划伤' }],
        stepTitle: '断开排线，取出传感器总成', tools: ['防静电镊子', '无尘环境'],
      },
      {
        id: 'lens', name: '镜头组', group: '光学', pieces: [
          { shape: 'cyl', size: [0.8, 1.4, 0.8], pos: [0, 0.3, 0.2], color: 0x0a0d11, rot: [Math.PI / 2, 0, 0] },
          { shape: 'cyl', size: [0.5, 0.5, 0.5], pos: [0, 0.3, -0.4], color: 0x2c3036 },
        ], body: '镜头是玻璃镜片组 + 对焦/防抖马达。卡口是机身与镜头的接口标准，不同品牌互不通用。', stats: [{ label: '组成', value: '镜片组 + 马达' }, { label: '接口', value: '卡口标准' }],
        stepTitle: '旋下镜头（先关机释放卡口）', tools: ['镜头释放钮', '镜头后盖'],
      },
      {
        id: 'viewfinder', name: '取景与显示', group: '显示', pieces: [
          { shape: 'slab', size: [1.0, 0.05, 0.7], pos: [0, 0.55, -0.2], color: 0x0d1116 },
          { shape: 'box', size: [0.4, 0.3, 0.3], pos: [-0.8, 0.6, 0], color: 0x1a1f25 },
        ], body: 'EVF 电子取景器与背屏是取景与回放界面；微单用 EVF 取代单反的五棱镜。', stats: [{ label: '取景', value: 'EVF / 背屏' }, { label: '单反差异', value: '无五棱镜' }],
        stepTitle: '拆取景器与背屏总成', tools: ['精密螺丝刀', '防静电镊子'],
      },
      {
        id: 'board', name: '主板与图像处理器', group: '电子', pieces: [
          { shape: 'slab', size: [1.6, 0.04, 1.1], pos: [0, -0.3, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.4, 0.05, 0.4], pos: [0.4, -0.27, 0.2], color: 0x1b2228 },
        ], body: '图像处理器（ISP / 引擎）把 CMOS 信号渲染成照片，是各家的算法护城河。', stats: [{ label: '核心', value: 'ISP 引擎' }, { label: '维修', value: '整板更换' }],
        stepTitle: '断开排线，取出主板', tools: ['防静电镊子', '精密螺丝刀'],
      },
      {
        id: 'battery', name: '电池与存储', group: '能源', pieces: [
          { shape: 'box', size: [1.0, 0.4, 0.5], pos: [-0.6, -0.5, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
          { shape: 'box', size: [0.3, 0.1, 0.2], pos: [0.6, -0.5, 0], color: 0x1b2228 },
        ], body: '锂电与 SD 卡槽都在手柄/底盖侧。插拔卡要断电，电池鼓包必须停用。', stats: [{ label: '存储', value: 'SD / CFexpress' }, { label: '安全', value: '先断电' }],
        stepTitle: '取出电池与存储卡', tools: ['塑料撬棒'],
      },
    ],
  },
  {
    match: ['游戏机', '游戏主机', 'ps5', 'switch', 'xbox', '主机', 'console', 'ps4', 'ps'],
    label: '游戏主机',
    layers: [
      {
        id: 'shell', name: '外壳与上盖', group: '结构', pieces: [
          { shape: 'box', size: [3.0, 0.7, 2.6], pos: [0, 0.2, 0], color: 0x2b3138 },
        ], body: '外壳多为卡扣 + 少量螺丝，拆前先找隐藏螺丝（常在脚垫 / 贴纸下）。', stats: [{ label: '固定', value: '卡扣 + 螺丝' }, { label: '注意', value: '隐藏螺丝' }],
        stepTitle: '拆下外壳上盖', tools: ['精密螺丝刀', '塑料撬片'],
      },
      {
        id: 'drive', name: '光驱 / 数字版', group: '读取', pieces: [
          { shape: 'box', size: [2.2, 0.4, 1.4], pos: [0, -0.1, 0], color: 0x161a1f },
          { shape: 'cyl', size: [0.5, 0.3, 0.5], pos: [0.6, 0, 0], color: 0x2a2e34, rot: [Math.PI / 2, 0, 0] },
        ], body: '光驱是故障高发件，数字版则省掉它换更大散热空间。', stats: [{ label: '版本', value: '光驱 / 数字' }, { label: '高发故障', value: '光驱' }],
        stepTitle: '取出光驱模块', tools: ['精密螺丝刀', '防静电镊子'],
      },
      {
        id: 'board', name: '主板与 APU', group: '电子', pieces: [
          { shape: 'slab', size: [2.4, 0.06, 2.0], pos: [0, -0.4, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.7, 0.08, 0.7], pos: [0, -0.36, 0], color: 0x1b2228 },
        ], body: 'APU（CPU+GPU 合一）是核心，焊在主板上，过热与虚焊是主因。', stats: [{ label: '核心', value: 'APU 合一' }, { label: '维修', value: '整板更换' }],
        stepTitle: '断开排线，取出主板', tools: ['防静电镊子', '精密螺丝刀'],
      },
      {
        id: 'cooling', name: '散热模组', group: '热学', pieces: [
          { shape: 'box', size: [0.9, 0.3, 0.9], pos: [0, -0.1, 0.4], color: 0xc9a06a, metalness: 0.85, roughness: 0.3 },
          { shape: 'cyl', size: [0.1, 0.2, 0.1], pos: [0, 0.1, 0.9], color: 0x8f98a1, metalness: 0.85, rot: [Math.PI / 2, 0, 0] },
        ], body: '均热板 + 涡轮风扇把 APU 热量排出；清灰换硅脂是延寿第一招。', stats: [{ label: '维护', value: '清灰 / 换硅脂' }, { label: '周期', value: '1–2 年' }],
        stepTitle: '拆散热模组，清灰换硅脂', tools: ['精密螺丝刀', '导热硅脂'],
      },
      {
        id: 'power', name: '电源', group: '能源', pieces: [
          { shape: 'box', size: [1.6, 0.5, 1.2], pos: [-0.6, -0.7, 0], color: 0x9aa0a6, metalness: 0.85 },
        ], body: '电源把市电转成主板/硬盘所需直流；电容老化会啸叫或掉电。', stats: [{ label: '作用', value: 'AC→DC' }, { label: '老化', value: '电容' }],
        stepTitle: '断开供电，取出电源', tools: ['精密螺丝刀'],
      },
      {
        id: 'io', name: '接口与手柄', group: '输入', pieces: [
          { shape: 'box', size: [2.0, 0.15, 0.3], pos: [0, -0.7, 1.1], color: 0x1a1f25 },
          { shape: 'box', size: [0.6, 0.3, 0.2], pos: [0.9, -0.5, 0.6], color: 0x2a2e34 },
        ], body: '前置 USB / 网口在前面板；手柄是独立可换部件，摇杆漂移是通病。', stats: [{ label: '通病', value: '摇杆漂移' }, { label: '接口', value: '前置 USB' }],
        stepTitle: '拆前面板与接口板', tools: ['塑料撬片', '防静电镊子'],
      },
    ],
  },
  {
    match: ['耳机', '音箱', '耳麦', '扬声器', '蓝牙耳机', '音响', 'headphone', 'speaker', 'earbud'],
    label: '耳机 / 音箱',
    layers: [
      {
        id: 'housing', name: '腔体与外壳', group: '结构', pieces: [
          { shape: 'box', size: [1.6, 1.9, 1.8], pos: [0, 0.2, 0], color: 0x1c1f24, metalness: 0.3, roughness: 0.5 },
          { shape: 'cyl', size: [0.5, 0.2, 0.5], pos: [0, -0.6, 0], color: 0x2a2e34, rot: [Math.PI / 2, 0, 0] },
        ], body: '腔体决定声学容积与共振；密闭式与开放式音色取向完全不同。', stats: [{ label: '类型', value: '密闭 / 开放' }, { label: '作用', value: '声学容积' }],
        stepTitle: '拆下耳罩与腔体', tools: ['精密螺丝刀', '塑料撬片'],
      },
      {
        id: 'driver', name: '扬声器单元', group: '声学', pieces: [
          { shape: 'cyl', size: [1.1, 0.5, 1.1], pos: [0, 0.1, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35, rot: [Math.PI / 2, 0, 0] },
        ], body: '动圈单元由振膜 + 音圈 + 磁路组成，是换能核心。振膜破损会破音。', stats: [{ label: '核心', value: '动圈振膜' }, { label: '故障', value: '破音' }],
        stepTitle: '取出扬声器单元', tools: ['精密螺丝刀', '防静电镊子'],
      },
      {
        id: 'anc', name: '降噪与麦克风', group: '声学', pieces: [
          { shape: 'box', size: [0.3, 0.1, 0.3], pos: [0.5, 0.3, 0.6], color: 0x1b2228 },
          { shape: 'cyl', size: [0.1, 0.1, 0.1], pos: [-0.5, 0.4, 0.6], color: 0x2a2e34, rot: [Math.PI / 2, 0, 0] },
        ], body: '前馈 + 反馈麦克风采集环境噪声，与扬声器形成主动抵消。', stats: [{ label: '技术', value: '主动降噪 ANC' }, { label: '组成', value: '多麦克风阵列' }],
        stepTitle: '拆麦克风与降噪板', tools: ['防静电镊子', '精密螺丝刀'],
      },
      {
        id: 'board', name: '主板与蓝牙', group: '电子', pieces: [
          { shape: 'slab', size: [1.2, 0.04, 0.9], pos: [0, -0.3, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.3, 0.05, 0.3], pos: [0.3, -0.27, 0.1], color: 0x1b2228 },
        ], body: '蓝牙 SoC 与 DAC 集成在主板上，固件决定连接稳定性与音质。', stats: [{ label: '核心', value: '蓝牙 SoC' }, { label: '维修', value: '整板更换' }],
        stepTitle: '取出主控板', tools: ['防静电镊子', '精密螺丝刀'],
      },
      {
        id: 'battery', name: '电池', group: '能源', pieces: [
          { shape: 'box', size: [0.7, 0.3, 0.4], pos: [-0.5, -0.5, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '锂电循环衰减后续航骤降；真无线耳机电池太小，常整只换新。', stats: [{ label: '衰减', value: '快' }, { label: '安全', value: '先断电' }],
        stepTitle: '取出电池', tools: ['塑料撬棒'],
      },
    ],
  },
  {
    match: ['咖啡机', '微波炉', '洗衣机', '冰箱', '家电', '电饭煲', '电磁炉', '烤箱', '空气净化器'],
    label: '家用电器',
    layers: [
      {
        id: 'shell', name: '外壳与控制面板', group: '结构', pieces: [
          { shape: 'box', size: [2.6, 2.4, 2.2], pos: [0, 0.2, 0], color: 0x2b3138 },
          { shape: 'slab', size: [2.0, 0.1, 0.6], pos: [0, 1.0, 1.1], color: 0x1a1f25 },
        ], body: '外壳是钣金或注塑，控制面板集成按键/屏，拆前先断电拔插。', stats: [{ label: '固定', value: '螺丝 + 卡扣' }, { label: '前提', value: '先断电' }],
        stepTitle: '拆外壳与面板', tools: ['螺丝刀', '塑料撬片'],
      },
      {
        id: 'core', name: '核心部件', group: '执行', pieces: [
          { shape: 'cyl', size: [0.9, 1.2, 0.9], pos: [0, -0.3, 0], color: 0x8a8f93, metalness: 0.85, rot: [Math.PI / 2, 0, 0] },
          { shape: 'box', size: [1.0, 0.5, 1.0], pos: [0, -0.6, 0], color: 0x6e6a66, metalness: 0.5 },
        ], body: '加热管 / 电机 / 压缩机是家电的执行核心，过载与老化是主因。', stats: [{ label: '核心', value: '加热 / 电机' }, { label: '故障', value: '过载老化' }],
        stepTitle: '拆核心部件', tools: ['套筒扳手', '螺丝刀'],
      },
      {
        id: 'tank', name: '内胆 / 水路', group: '容器', pieces: [
          { shape: 'box', size: [2.0, 1.6, 1.6], pos: [0, -0.4, 0], color: 0xb9bdc2, metalness: 0.6, roughness: 0.4 },
        ], body: '内胆、水箱、管路承担载物与流体；密封失效会漏水/串味。', stats: [{ label: '风险', value: '漏水 / 密封' }, { label: '清洁', value: '除垢' }],
        stepTitle: '取出内胆与水路', tools: ['螺丝刀', '密封圈工具'],
      },
      {
        id: 'board', name: '控制板与电源', group: '电子', pieces: [
          { shape: 'slab', size: [1.4, 0.04, 1.0], pos: [0, 0.6, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.8, 0.4, 0.6], pos: [-0.8, 0.2, 0], color: 0x9aa0a6, metalness: 0.85 },
        ], body: '控制板管程序与驱动，电源把市电转直流；电容鼓包是家电常见死因。', stats: [{ label: '核心', value: 'MCU 控制' }, { label: '老化', value: '电源电容' }],
        stepTitle: '取出控制板与电源', tools: ['防静电镊子', '螺丝刀'],
      },
      {
        id: 'fan', name: '风道与散热', group: '热学', pieces: [
          { shape: 'cyl', size: [0.8, 0.4, 0.8], pos: [0, -0.1, 0.8], color: 0x8f98a1, metalness: 0.85, rot: [Math.PI / 2, 0, 0] },
        ], body: '风扇负责散热或风循环；积灰卡转会触发过热保护停机。', stats: [{ label: '维护', value: '清灰' }, { label: '保护', value: '过热停机' }],
        stepTitle: '清理风扇与风道', tools: ['毛刷', '螺丝刀'],
      },
    ],
  },
  {
    match: ['摩托', '电动车', '自行车', '助力车', '电瓶车', '电驴', '摩托车', 'motorcycle', 'ebike', 'scooter'],
    label: '电动交通',
    layers: [
      {
        id: 'frame', name: '车架与外壳', group: '结构', pieces: [
          { shape: 'box', size: [3.2, 1.0, 1.0], pos: [0, 0.4, 0], color: 0x2b3138 },
          { shape: 'blade', size: [1.6, 0.1, 0.1], pos: [0, 0.8, 0], color: 0x7d8388, metalness: 0.9 },
        ], body: '车架是受力主体，外壳多为覆盖件；碰撞后先查车架是否变形。', stats: [{ label: '受力', value: '车架主体' }, { label: '覆盖', value: '外壳件' }],
        stepTitle: '拆覆盖件，检查车架', tools: ['套筒扳手', '内六角'],
      },
      {
        id: 'motor', name: '电机 / 轮毂', group: '动力', pieces: [
          { shape: 'cyl', size: [0.7, 0.5, 0.7], pos: [-1.2, -0.3, 0], color: 0x8a8f93, metalness: 0.9, rot: [Math.PI / 2, 0, 0] },
          { shape: 'cyl', size: [0.3, 0.3, 0.3], pos: [1.2, -0.3, 0.6], color: 0x767b80, metalness: 0.9, rot: [Math.PI / 2, 0, 0] },
        ], body: '轮毂电机或中置电机是动力源，进水与过热是两大杀手。', stats: [{ label: '类型', value: '轮毂 / 中置' }, { label: '杀手', value: '进水 / 过热' }],
        stepTitle: '拆电机', tools: ['拉马', '套筒扳手'],
      },
      {
        id: 'battery', name: '电池组', group: '能源', pieces: [
          { shape: 'box', size: [1.8, 0.6, 0.7], pos: [0, -0.1, 0], color: 0xb9bdc2, metalness: 0.7, roughness: 0.35 },
        ], body: '锂电组是高压件，拆前必须断电放电；鼓包、穿刺都极度危险。', stats: [{ label: '安全', value: '高压 / 先放电' }, { label: '寿命', value: '循环衰减' }],
        stepTitle: '高压下电后取电池', tools: ['绝缘工具', '套筒扳手'],
      },
      {
        id: 'controller', name: '控制器', group: '电子', pieces: [
          { shape: 'box', size: [0.9, 0.4, 0.6], pos: [0.6, 0.1, 0], color: 0x0f2f26 },
          { shape: 'box', size: [0.3, 0.05, 0.3], pos: [0.6, 0.32, 0], color: 0x1b2228 },
        ], body: '控制器管电机驱动与限速，是故障与改装重灾区。', stats: [{ label: '作用', value: '电机驱动' }, { label: '风险', value: '改装 / 烧毁' }],
        stepTitle: '取出控制器', tools: ['螺丝刀', '防静电镊子'],
      },
      {
        id: 'brake', name: '刹车与轮组', group: '行走', pieces: [
          { shape: 'cyl', size: [0.4, 0.2, 0.4], pos: [1.2, -0.3, 0], color: 0x0d0f12, rot: [Math.PI / 2, 0, 0] },
          { shape: 'blade', size: [1.2, 0.08, 0.08], pos: [1.2, -0.3, 0.5], color: 0x7d8388, metalness: 0.9 },
        ], body: '碟刹/鼓刹与轮组是安全件，刹车皮磨损必须按时换。', stats: [{ label: '安全件', value: '是' }, { label: '维护', value: '换刹车皮' }],
        stepTitle: '拆轮组与刹车', tools: ['快拆杆', '扭矩扳手'],
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

// ---------- 规格 → 主体（模板与 LLM 共用同一条路） ----------

/**
 * 拆解规格：模板产出的蓝图和 LLM 产出的 JSON 都归一到这个结构，
 * 再由 subjectFromSpec() 变成可渲染的 Subject。
 * LLM 只需要填这个 schema，不需要知道 three.js。
 */
export interface LayerSpec {
  id: string;
  name: string;
  group: string;
  /** 这一层是什么 / 干什么 / 拆的时候要注意什么 */
  body: string;
  stats?: { label: string; value: string }[];
  tools?: string[];
  /** 主色，0xRRGGBB */
  color?: number;
  shape?: Shape;
  size?: [number, number, number];
  pos?: [number, number, number];
  rot?: [number, number, number];
  /** 额外装饰件（焊盘、接口、镜片等） */
  extras?: Piece[];
  stepTitle?: string;
  explodeScale?: number;
}

export interface StepSpec {
  title: string;
  body: string;
  layers: string[];
  tools?: string[];
  stats?: { label: string; value: string }[];
}

export interface TeardownSpec {
  name?: string;
  subtitle?: string;
  tagline?: string;
  accent?: string;
  category?: string;
  headline?: { label: string; value: string; unit?: string }[];
  overview?: string;
  narrative?: string[];
  specs?: { label: string; value: string; note?: string }[];
  repairability?: { score: number; difficulty: string; tools: string[]; note?: string };
  layers: LayerSpec[];
  steps?: StepSpec[];
  /** 数据来源：template=通用模板（示意），ai=LLM 生成 */
  source?: 'template' | 'ai';
  sourceNote?: string;
}

const SHAPES: Shape[] = ['box', 'slab', 'cyl', 'lens', 'frame', 'blade'];

function clamp(v: number, lo: number, hi: number, fallback: number): number {
  return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
}

function toVec3(v: unknown, fallback: [number, number, number]): [number, number, number] {
  const a = Array.isArray(v) ? v : [];
  return [
    clamp(Number(a[0]), -3, 3, fallback[0]),
    clamp(Number(a[1]), -3, 3, fallback[1]),
    clamp(Number(a[2]), -3, 3, fallback[2]),
  ];
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

/**
 * 按模型实际包围盒算相机距离。
 * 相机 FOV 是 38°（viewer.ts），这里用同样口径反推，保证再大的蓝图
 * （汽车 3.4 单位、火箭更高）也能整件入画，不会切边。
 */
function autoCamera(layerCount: number): { position: [number, number, number]; target: [number, number, number] } {
  const n = Math.max(3, Math.min(10, layerCount));
  // 层在 y 上最大跨度 ≈ 每层 0.16 的装配间隔 + 爆炸位移 1.25 + i*0.28
  const spanY = (n - 1) * 0.16 + 1.25 + (n - 1) * 0.28 + 0.6;
  const spanXZ = 3.2; // size 上限就是 3.2
  const radius = Math.max(spanY, spanXZ) * 0.5;
  const fov = (38 * Math.PI) / 180;
  const dist = (radius / Math.tan(fov / 2)) * 1.28;
  const d = Math.max(3, Math.min(26, dist));
  const dir = new THREE.Vector3(0.52, 0.4, 1).normalize().multiplyScalar(d);
  return { position: [dir.x, dir.y, dir.z], target: [0, 0, 0] };
}

/**
 * 把一段（可能是 LLM 产出的）文本收敛成安全的纯文本。
 * 纵深防御：LLM 偶尔会在正文里塞控制字符、零宽字符、替换符（U+FFFD）或
 * 未转义的尖括号，这些在 3D 标签 / 卡片里会渲染成乱码或破坏布局。
 * 这里统一净化：按 Unicode 码点剔除不可见字符、中和 HTML 尖括号、压缩空白。
 */
function text(v: unknown, fallback = ''): string {
  if (typeof v !== 'string') return fallback;
  let t = '';
  for (const ch of v) {
    const cp = ch.codePointAt(0) ?? 0;
    // C0 控制字符（< 0x20）与 C1 控制字符（0x7F–0x9F）
    if (cp < 0x20) continue;
    if (cp >= 0x7f && cp <= 0x9f) continue;
    // 零宽/格式字符、软连字符、BOM、替换符
    if (
      cp === 0x200b || cp === 0x200c || cp === 0x200d ||
      cp === 0x2060 || cp === 0xfeff || cp === 0xfffd || cp === 0xad
    ) continue;
    t += ch;
  }
  t = t
    .replace(/</g, '＜') // 中和尖括号（防注入 / 防 3D 标签断裂）
    .replace(/>/g, '＞')
    .replace(/"/g, '＂')
    .replace(/'/g, '＇')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > 400 ? `${t.slice(0, 400)}…` : t;
}

function statList(v: unknown): { label: string; value: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === 'object')
    .slice(0, 6)
    .map((x) => ({ label: text((x as { label?: unknown }).label, '—'), value: text((x as { value?: unknown }).value, '—') }))
    .filter((x) => x.label !== '—' || x.value !== '—');
}

function strList(v: unknown, max = 6): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => text(x)).filter(Boolean).slice(0, max);
}

/** 规格 → 可渲染 Subject。size/pos 全部做了范围收敛，防止 LLM 给出离谱数值把场景撑爆 */
export function subjectFromSpec(rawQuery: string, spec: TeardownSpec): Subject {
  const isEn = getLang() === 'en';
  const query = text(rawQuery, isEn ? 'Unnamed product' : '未命名产品') || (isEn ? 'Unnamed product' : '未命名产品');
  const id = slugify(query);
  const name = text(spec.name, query).slice(0, 28) || query.slice(0, 28);
  const isAI = spec.source === 'ai';
  const n = Math.max(3, Math.min(10, spec.layers.length));

  const layers: Layer[] = spec.layers.slice(0, 10).map((l, i) => {
    const lid = /^[a-z0-9_-]{1,24}$/.test(l.id) ? l.id : `l${i + 1}`;
    const color = Number.isFinite(l.color) ? Number(l.color) & 0xffffff : 0x4b5563;
    const shape: Shape = SHAPES.includes(l.shape as Shape) ? (l.shape as Shape) : 'box';
    const size = toVec3(l.size, [1.2, 0.1, 0.9]) as [number, number, number];
    // 尺寸下限保护：LLM 有时会给 0 导致几何体退化
    const safeSize: [number, number, number] = [
      clamp(size[0], 0.05, 3.2, 1.2),
      clamp(size[1], 0.01, 3.2, 0.1),
      clamp(size[2], 0.05, 3.2, 0.9),
    ];
    const pos = toVec3(l.pos, [0, (i - (n - 1) / 2) * 0.16, 0]) as [number, number, number];
    const main: Piece = { shape, size: safeSize, pos, color };
    if (l.rot) main.rot = toVec3(l.rot, [0, 0, 0]) as [number, number, number];
    const extras = Array.isArray(l.extras)
      ? l.extras.slice(0, 6).map((p) => ({
          ...p,
          size: toVec3(p.size, [0.1, 0.05, 0.1]) as [number, number, number],
          pos: toVec3(p.pos, [0, 0, 0]) as [number, number, number],
          color: Number.isFinite(p.color) ? Number(p.color) & 0xffffff : 0x4b5563,
        }))
      : [];
    const pieces = [main, ...extras];
    const body = text(l.body, isEn ? `${text(l.name, 'This layer')}: generic structural layer.` : `${text(l.name, '该层')}：通用结构层。`);

    const hotspots: Hotspot[] = [
      {
        id: `${lid}-main`,
        title: text(l.name, isEn ? 'Structural layer' : '结构层'),
        body,
        anchor: new THREE.Vector3(pos[0], pos[1] + safeSize[1] / 2 + 0.12, pos[2]),
        stats: statList(l.stats),
      },
    ];

    return {
      id: lid,
      name: text(l.name, isEn ? `Structural layer ${i + 1}` : `结构层 ${i + 1}`),
      group: text(l.group, isEn ? 'Structure' : '结构'),
      explodeDir: new THREE.Vector3(
        (i - (n - 1) / 2) * 0.34,
        1.25 + i * 0.28,
        0.16 * (i - (n - 1) / 2)
      ),
      explodeScale: clamp(Number(l.explodeScale), 0.3, 3, 1),
      sectionable: true,
      build: () => buildGroup(pieces),
      hotspots,
      refImage: explodedSvg(name, `${text(l.group, isEn ? 'Structure' : '结构')} · ${isEn ? 'schematic' : '结构示意'}`, [
        { name: text(l.name, isEn ? `Structural layer ${i + 1}` : `结构层 ${i + 1}`), group: text(l.group, isEn ? 'Structure' : '结构'), color },
      ]),
    };
  });

  const stepSpecs: StepSpec[] =
    Array.isArray(spec.steps) && spec.steps.length
      ? spec.steps.slice(0, 12)
      : spec.layers.map((l, i) => ({
          title: text(l.stepTitle, isEn ? `Remove ${text(l.name, `layer ${i + 1}`)}` : `拆下 ${text(l.name, `第 ${i + 1} 层`)}`),
          body: text(l.body, isEn ? 'Work on this layer using the generic teardown procedure.' : '按通用拆解流程处理这一层。'),
          layers: [l.id],
          tools: strList(l.tools),
          stats: statList(l.stats),
        }));

  const steps: TeardownStep[] = stepSpecs.map((st, i) => ({
    id: `gen-s${i + 1}`,
    title: text(st.title, isEn ? `Step ${i + 1}` : `步骤 ${i + 1}`),
    body: text(st.body, isEn ? 'Work through the generic teardown procedure.' : '按通用拆解流程处理。'),
    layers: strList(st.layers, 6).filter((x) => layers.some((l) => l.id === x)),
    tools: strList(st.tools),
    stats: statList(st.stats),
  }));

  const heroImage = explodedSvg(
    name,
    `${text(spec.category, isEn ? 'Device' : '设备')} · ${n} ${isEn ? 'structural layers' : '个结构层'} · ${isAI ? (isEn ? 'AI generated' : 'AI 生成') : isEn ? 'generic template rebuild' : '通用模板重建'}`,
    layers.map((l) => ({ name: l.name, group: l.group, color: 0x4b5563 }))
  );
  const modeledParts = layers.reduce(
    (acc, l, i) => acc + 1 + (Array.isArray(spec.layers[i]?.extras) ? spec.layers[i].extras!.length : 0),
    0
  );

  const trustRow = isAI
    ? isEn
      ? { label: 'Spec confidence', value: 'Medium', note: 'AI generated, not verified against authoritative teardowns' }
      : { label: '规格可信度', value: '中', note: 'AI 生成，未经权威拆解资料核对' }
    : isEn
      ? { label: 'Spec confidence', value: 'Low', note: 'For demonstrating the presentation only' }
      : { label: '规格可信度', value: '低', note: '仅用于演示呈现方式' };

  return {
    id,
    name,
    subtitle: text(
      spec.subtitle,
      `${text(spec.category, isEn ? 'Device' : '设备')} · ${isAI ? (isEn ? 'AI generated' : 'AI 生成') : isEn ? 'generic template rebuild' : '通用模板重建'}`
    ),
    tagline: text(
      spec.tagline,
      isEn
        ? `A ${n}-layer teardown presentation demonstrating the interaction and information structure`
        : `${n} 个结构层的拆解呈现，用于演示交互与信息组织方式`
    ),
    headline:
      Array.isArray(spec.headline) && spec.headline.length
        ? spec.headline.slice(0, 4).map((h) => ({
            label: text(h.label, isEn ? 'Metric' : '指标'),
            value: text(h.value, '—'),
            unit: h.unit ? text(h.unit) : undefined,
          }))
        : isEn
          ? [
              { label: 'Structural layers', value: String(n), unit: 'layers' },
              { label: 'Teardown steps', value: String(steps.length), unit: 'steps' },
              { label: 'Form', value: isAI ? 'AI generated' : 'Schematic' },
              { label: 'Spec confidence', value: isAI ? 'Medium' : 'Low' },
            ]
          : [
              { label: '结构层', value: String(n), unit: '层' },
              { label: '拆解步骤', value: String(steps.length), unit: '步' },
              { label: '形态', value: isAI ? 'AI 生成' : '示意' },
              { label: '规格可信度', value: isAI ? '中' : '低' },
            ],
    background: 0x0c0e11,
    accent: /^#[0-9a-fA-F]{6}$/.test(spec.accent ?? '') ? spec.accent! : '#5b8cff',
    camera: autoCamera(spec.layers.length),
    explodeScale: 1,
    sectionable: true,
    heroImage,
    layers,
    steps,
    overview: text(
      spec.overview,
      isAI
        ? isEn
          ? `This is an AI-generated structural teardown for “${name}”. The layer breakdown and parameters come from model inference, are not verified against authoritative teardown sources, and are for reference only.`
          : `这是针对「${name}」由 AI 生成的结构拆解。层划分与参数来自模型归纳，未经权威拆解资料核对，仅供演示与参考。`
        : isEn
          ? `This is a structural schematic auto-generated for “${name}” from the generic template; it is not the product's real specification.`
          : `这是针对「${name}」按通用模板自动生成的结构示意，不是该产品的真实规格。`
    ),
    narrative:
      Array.isArray(spec.narrative) && spec.narrative.length
        ? spec.narrative.map((p) => text(p)).filter(Boolean).slice(0, 5)
        : isAI
          ? isEn
            ? [
                '**Data source**: inferred by AI from the common structure of this product class, not verified against authoritative teardown sources.',
                '**What is solid**: the layer breakdown, explode directions, step flow and parameter cards behave exactly as they do for the curated subjects.',
                '**Caveat**: screw counts, bonding methods and flex positions must be checked against the official service manual.',
              ]
            : [
                '**数据来源**：AI 依据该类产品的常见结构归纳，未经权威拆解资料核对。',
                '**能用的部分**：层划分、爆炸方向、分步流程、参数卡与真实主体完全一致。',
                '**注意**：具体螺丝数量、胶合方式、排线位置请以官方维修手册为准。',
              ]
          : isEn
            ? [
                '**Why this is a schematic**: a real teardown of an arbitrary product needs authoritative sources; the generic template can only give the common structure of that product class.',
                '**What is solid**: the teardown presentation itself — layer breakdown, explode directions, step flow, parameter cards — is identical to the curated subjects.',
                '**To get real specs**: connect the LLM backend proxy (see worker/README.md).',
              ]
            : [
                '**为什么是"示意"**：任意产品的真实拆解需要权威拆解资料支撑，通用模板只能给出这一类产品的常见结构。',
                '**能用的部分**：拆解呈现方式（层划分、爆炸方向、分步流程、参数卡）与真实主体完全一致。',
                '**要做成真实规格**：接入 LLM 后端代理即可（见 worker/README.md）。',
              ],
    specs:
      Array.isArray(spec.specs) && spec.specs.length
        ? spec.specs
            .slice(0, 10)
            .map((r) => ({ label: text(r.label, isEn ? 'Item' : '项'), value: text(r.value, '—'), note: r.note ? text(r.note) : undefined }))
        : isEn
          ? [
              { label: 'Product', value: name },
              { label: 'Category', value: text(spec.category, 'Device') },
              { label: 'Structural layers', value: `${n}` },
            ]
          : [
              { label: '产品', value: name },
              { label: '类别', value: text(spec.category, '设备') },
              { label: '结构层', value: `${n} 层` },
            ],
    ...(spec.repairability && Number.isFinite(spec.repairability.score)
      ? {
          repairability: {
            score: Math.max(0, Math.min(10, Math.round(spec.repairability.score))),
            difficulty: text(spec.repairability.difficulty, isEn ? 'Unknown' : '未知'),
            tools: strList(spec.repairability.tools, 8),
            note: text(
              spec.repairability.note,
              isAI
                ? isEn
                  ? 'AI estimate, for reference only'
                  : 'AI 估计值，仅供参考'
                : isEn
                  ? 'Generic template estimate'
                  : '通用模板估计值'
            ),
          },
        }
      : {}),
    fidelity: {
      actualParts: 0,
      source: text(
        spec.sourceNote,
        isAI
          ? isEn
            ? 'AI generated, no authoritative teardown source'
            : 'AI 生成，无权威拆解资料'
          : isEn
            ? 'None (generic template, no authoritative teardown source)'
            : '无（通用模板，无权威拆解资料）'
      ),
      modeledLayers: n,
      modeledParts,
      note: isAI
        ? isEn
          ? 'The AI output is not tied to a specific model, so this only describes the scale of the model itself.'
          : 'AI 未对应具体机型的真实零件数，此栏仅说明模型自身的表达规模。'
        : isEn
          ? 'The template is not tied to any specific model, so there is no real part count.'
          : '模板未对应任何具体机型的真实零件数。',
    },
  };
}

function pickBlueprint(query: string): Blueprint {
  const q = query.toLowerCase();
  for (const bp of BLUEPRINTS) {
    if (bp.match.some((k) => q.includes(k.toLowerCase()))) return bp;
  }
  return DEFAULT_BLUEPRINT;
}

/** 本地模板生成（离线、确定性、无密钥） */
export function generateSubject(rawQuery: string): Subject {
  const query = rawQuery.trim();
  const bp = pickBlueprint(query);
  // 英文界面下蓝图也走英文覆盖层，否则生成出来的主体是"英文 UI + 中文层名"的混排
  const en = getLang() === 'en' ? BLUEPRINT_EN[bp.label] : undefined;
  const layerName = (l: BlueprintLayer) => en?.layers[l.id]?.name ?? l.name;
  const layerGroup = (l: BlueprintLayer) => en?.layers[l.id]?.group ?? l.group;
  const layerBody = (l: BlueprintLayer) => en?.layers[l.id]?.body ?? l.body;
  const layerStats = (l: BlueprintLayer) => {
    const m = en?.layers[l.id]?.stats;
    return m ? l.stats.map((x) => ({ label: m[x.label] ?? x.label, value: x.value })) : l.stats;
  };
  const catLabel = en?.label ?? bp.label;

  const spec: TeardownSpec = {
    name: query.length > 28 ? `${query.slice(0, 28)}…` : query,
    subtitle: en
      ? `${catLabel} · generic template rebuild`
      : `${bp.label} · 通用模板重建`,
    tagline: en
      ? `A ${bp.layers.length}-layer schematic rebuilt from the generic template, demonstrating how a teardown is presented`
      : `按通用模板重建的 ${bp.layers.length} 层结构示意，用于演示拆解呈现方式`,
    category: catLabel,
    source: 'template',
    layers: bp.layers.map((l) => ({
      id: l.id,
      name: layerName(l),
      group: layerGroup(l),
      body: layerBody(l),
      stats: layerStats(l),
      tools: en?.layers[l.id]?.tools ?? l.tools,
      color: l.pieces[0]?.color ?? 0x4b5563,
      shape: l.pieces[0]?.shape ?? 'box',
      size: l.pieces[0]?.size,
      pos: l.pieces[0]?.pos,
      extras: l.pieces.slice(1),
      stepTitle: en?.layers[l.id]?.stepTitle ?? l.stepTitle,
      explodeScale: l.explodeScale,
    })),
  };
  const s = subjectFromSpec(query, spec);
  // 模板路线保留更明确的免责叙述
  if (en) {
    s.overview =
      `This is a structural schematic auto-generated for “${query}” from the **generic template**; it is not the product's real specification. ` +
      `The template gives ${bp.layers.length} layers typical of the ${catLabel} class: ${bp.layers.map(layerName).join(', ')}. ` +
      `Every layer's shape, position and parameters are schematic and must not be used as a repair reference.`;
    s.specs = [
      { label: 'Product', value: s.name },
      { label: 'Category', value: catLabel },
      { label: 'Structural layers', value: `${bp.layers.length}` },
      {
        label: 'Modelling',
        value: 'Parametric rebuild · generic template',
        note: 'Not a physical scan, not real specs',
      },
      { label: 'Reference images', value: 'Schematic', note: 'Generated SVG, not photographs' },
      { label: 'Spec confidence', value: 'Low', note: 'For demonstrating the presentation only' },
    ];
  } else {
    s.overview =
      `这是针对「${query}」按**通用模板**自动生成的结构示意，不是该产品的真实规格。` +
      `模板按${bp.label}的常见结构给出 ${bp.layers.length} 个层：${bp.layers.map((l) => l.name).join('、')}。` +
      `所有层的形状、位置、参数均为示意，不能作为维修依据。`;
    s.specs = [
      { label: '产品', value: s.name },
      { label: '类别', value: bp.label },
      { label: '结构层', value: `${bp.layers.length} 层` },
      { label: '建模方式', value: '参数化重建 · 通用模板', note: '非真机扫描、非真实规格' },
      { label: '参考图', value: '结构示意图', note: 'SVG 生成，非实拍照片' },
      { label: '规格可信度', value: '低', note: '仅用于演示呈现方式' },
    ];
  }
  return s;
}
