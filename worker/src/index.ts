/**
 * Teardown Atelier · 拆解生成代理（Cloudflare Worker）
 *
 * 作用：把「输入产品名 → LLM 产出结构化拆解规格」这件事搬到服务端，
 * 让 API Key 永远不出现在浏览器里。
 *
 * 端点：
 *   POST /api/teardown   body: { "query": "扫地机器人" }
 *   返回 TeardownSpec JSON（schema 见 worker/SCHEMA.md）
 *
 * 环境变量 / Secret：
 *   LLM_BASE_URL   OpenAI 兼容接口地址，默认 https://api.openai.com/v1
 *   LLM_API_KEY    （Secret）接口密钥
 *   LLM_MODEL      模型名，默认 gpt-4o-mini
 *   ALLOWED_ORIGIN 允许的跨域来源，默认 *；建议填 https://leo-bone.github.io
 *
 * 免费额度内可用：缓存命中不调 LLM；同一产品 7 天内直接返回缓存。
 */

const CACHE_TTL = 60 * 60 * 24 * 7; // 7 天
const MAX_QUERY = 60;

export interface Env {
  LLM_BASE_URL?: string;
  LLM_API_KEY?: string;
  LLM_MODEL?: string;
  ALLOWED_ORIGIN?: string;
  [k: string]: unknown;
}

const SYSTEM_PROMPT = `你是消费电子与工业产品的拆解工程师。用户给你一个产品名，你要输出该产品的结构化拆解规格，用于一个交互式 3D 拆解演示。

硬性要求：
1. 只输出 JSON，不要 markdown 代码块，不要任何解释文字。
2. 全部字段用简体中文（id / accent 除外）。
3. layers 给 4-8 个功能层，按"从外到内"的拆解顺序排列。
4. 每个 layer 必须给几何参数，用于 3D 重建：
   - shape 只能是 box / slab / cyl / lens / frame / blade 之一
   - size 是 [宽, 高, 深]，单位是"米量级的任意一致单位"，整体设备控制在宽 3.2、高 3.2、深 3.2 以内
   - pos 是该层在装配态的位置 [x, y, z]，设备整体以原点为中心，y 向上
   - 层与层在 y 方向上要分开（例如屏幕在 y=+0.2，主板 y=0，电池 y=-0.2）
   - color 是十进制 RGB 整数，如 0x8a9096
5. 不确定的数字不要编造：specs 里只写你确有把握的规格，没有就少写。
6. 明确区分"确知规格"与"常见结构推断"：overview 里说明哪些是推断。

JSON 结构：
{
  "name": "产品名（含关键型号）",
  "subtitle": "品牌 · 年份 · 定位",
  "tagline": "一句话卖点",
  "category": "类别，如 智能手机",
  "accent": "#rrggbb",
  "headline": [{"label":"指标名","value":"数值","unit":"单位"}],
  "overview": "2-4 句总体说明，说明哪些规格是确知的、哪些是结构推断",
  "narrative": ["设计取舍/工程解读，2-4 条"],
  "specs": [{"label":"规格名","value":"值","note":"可选备注"}],
  "repairability": {"score": 0-10, "difficulty": "极难/困难/中等/容易", "tools": ["工具"], "note": "评估口径"},
  "layers": [
    {
      "id": "英文小写短横线，如 screen",
      "name": "层名",
      "group": "分组，如 显示/电子/能源/结构/光学",
      "body": "这层是什么、干什么、拆的时候要注意什么（2-3 句）",
      "color": 16777215,
      "shape": "box",
      "size": [1.5, 0.05, 3.0],
      "pos": [0, 0.2, 0],
      "rot": [0, 0, 0],
      "stats": [{"label":"要点","value":"值"}],
      "tools": ["这步用到的工具"],
      "stepTitle": "拆解这一步的动作标题，动词开头",
      "extras": [{"shape":"box","size":[0.3,0.03,0.3],"pos":[0,0,0],"color":2236962}]
    }
  ]
}`;

const USER_TMPL = (query: string) => `产品：${query}

请按系统提示的 JSON 结构输出该产品的拆解规格。若该产品你很陌生，就按同类产品的常见结构给出合理推断，并在 overview 里明确标注"以下为结构推断"。`;

/**
 * CORS：ALLOWED_ORIGIN 支持逗号分隔的多个来源。
 * 请求带了 Origin 且在白名单里 → 回显该 Origin；不在白名单 → 回显第一个（让浏览器报错，而不是静默放行）。
 * 没带 Origin（如同源 / 服务端到服务端）→ 不回 CORS 头。
 */
function cors(env: Env, request: Request): Record<string, string> {
  const allow = (env.ALLOWED_ORIGIN ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = request.headers.get('Origin');
  let origin: string;
  if (allow.includes('*')) {
    origin = '*';
  } else if (reqOrigin && allow.includes(reqOrigin)) {
    origin = reqOrigin;
  } else {
    origin = allow[0] ?? '*';
  }
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

/** 把 query 归一成缓存键 */
function cacheKey(query: string): Request {
  const norm = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return new Request(`https://cache.internal/teardown/${encodeURIComponent(norm)}`);
}

/** 从 LLM 回复里抠出 JSON（容忍 ```json 围栏和前后废话） */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  if (start < 0) throw new Error('LLM 未返回 JSON');
  const opener = raw[start];
  const closer = opener === '[' ? ']' : '}';
  // 从后往前找最后一个配对收尾符，容忍尾部废话
  const end = raw.lastIndexOf(closer);
  if (end <= start) throw new Error('LLM 返回的 JSON 不完整');
  return JSON.parse(raw.slice(start, end + 1));
}

/** 服务端也要做一次结构校验，坏数据不进缓存也不回给前端 */
function validateSpec(spec: unknown): { ok: true } | { ok: false; error: string } {
  if (!spec || typeof spec !== 'object') return { ok: false, error: '不是对象' };
  const s = spec as Record<string, unknown>;
  if (!Array.isArray(s.layers) || s.layers.length < 2) {
    return { ok: false, error: 'layers 少于 2 个' };
  }
  if (s.layers.length > 12) return { ok: false, error: 'layers 超过 12 个' };
  for (const [i, l] of s.layers.entries()) {
    if (!l || typeof l !== 'object') return { ok: false, error: `layers[${i}] 不是对象` };
    const o = l as Record<string, unknown>;
    if (typeof o.name !== 'string' || !o.name.trim()) return { ok: false, error: `layers[${i}].name 缺失` };
    if (typeof o.body !== 'string' || !o.body.trim()) return { ok: false, error: `layers[${i}].body 缺失` };
  }
  return { ok: true };
}

/** 极简按 IP 限流：用 Cache API 记一个 60 秒计数器（免费额度内够用） */
async function rateLimited(ip: string, limit = 12): Promise<boolean> {
  const key = new Request(`https://rl.internal/${ip}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  const n = hit ? Number(await hit.text()) : 0;
  if (n >= limit) return true;
  await cache.put(
    key,
    new Response(String(n + 1), {
      headers: { 'Cache-Control': `max-age=60` },
    })
  );
  return false;
}

async function callLLM(env: Env, query: string): Promise<unknown> {
  const base = (env.LLM_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = env.LLM_MODEL ?? 'gpt-4o-mini';
  const key = env.LLM_API_KEY;
  if (!key) throw new Error('服务端未配置 LLM_API_KEY');

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_TMPL(query) },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`LLM ${res.status}: ${detail.slice(0, 160)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM 返回为空');
  return extractJson(content);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    
    const url = new URL(request.url);

    const h = cors(env, request);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: h });
    }

    if (url.pathname === '/health') {
      return json(
        {
          ok: true,
          llmConfigured: !!env.LLM_API_KEY,
          model: env.LLM_MODEL ?? 'gpt-4o-mini',
        },
        200,
        h
      );
    }

    if (url.pathname !== '/api/teardown') {
      return json({ error: 'Not found' }, 404, h);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Use POST' }, 405, h);
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'anonymous';
    if (await rateLimited(ip)) {
      return json({ error: '请求太频繁，请稍后再试（每分钟上限 12 次）' }, 429, h);
    }

    let query = '';
    try {
      const body = (await request.json()) as { query?: unknown };
      if (typeof body.query !== 'string') throw new Error('query 必须是字符串');
      query = body.query.trim().slice(0, MAX_QUERY);
    } catch (e) {
      return json({ error: `请求体无效：${(e as Error).message}` }, 400, h);
    }

    if (query.length < 2) {
      return json({ error: '产品名太短' }, 400, h);
    }

    const cache = caches.default;
    const key = cacheKey(query);

    // 1) 缓存命中：不花 LLM 钱
    const cached = await cache.match(key);
    if (cached) {
      const body = await cached.json();
      return json(body, 200, h);
    }

    // 2) 调 LLM
    let spec: unknown;
    try {
      spec = await callLLM(env, query);
    } catch (e) {
      return json({ error: (e as Error).message }, 502, h);
    }

    // 3) 结构校验
    const check = validateSpec(spec);
    if (!check.ok) {
      return json({ error: `LLM 产出不合格：${check.error}` }, 502, h);
    }

    // 4) 写缓存（前端也会再做一次范围收敛，这里只做结构把关）
    const res = json(spec, 200, h);
    res.headers.set('Cache-Control', `max-age=${CACHE_TTL}`);
    await cache.put(key, res.clone());

    return res;
  },
};
