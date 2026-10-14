# Teardown Atelier · LLM 拆解生成代理（Cloudflare Worker）

把「输入产品名 → LLM 产出结构化拆解规格」放在服务端，**API Key 永远不进浏览器**。
前端只在 `window.TEARDOWN_API` 指向这个 Worker 时才会启用「AI 生成真实规格」。

**已部署地址：https://teardown-atelier-api.57990177.workers.dev**
（账户 57990177@qq.com，版本见 `wrangler deployments list`）

---

## 一、它做什么

| 关注点 | 实现 |
|---|---|
| 密钥不出前端 | Key 以 Worker Secret 存放，浏览器只跟 Worker 说话 |
| 不重复花钱 | 同一产品 7 天内命中 Cache API 直接返回，不调 LLM |
| 不被白嫖 | 按 IP 每分钟 12 次限流（Cache API 计数，免费额度内够用） |
| 坏数据不外溢 | 服务端结构校验（layers 2–12 个、name/body 必填），不合格返回 502 |
| 跨域 | `ALLOWED_ORIGIN` 控制；预检 OPTIONS 已处理 |
| 提示词 | 内嵌在 `src/index.ts` 的 `SYSTEM_PROMPT`，直接改即可 |

## 二、端点

```
GET  /health            → { ok, llmConfigured, model }
POST /api/teardown      body { "query": "扫地机器人" }  → TeardownSpec JSON
```

## 三、部署（已完成一次，下面是复用命令）

```bash
cd worker
# 本机已 OAuth 登录（~/.wrangler/config/default.toml），直接：
node ~/.workbuddy/binaries/node/workspace/node_modules/.bin/wrangler deploy
```

首次部署需要：

```bash
npm install                           # 装 wrangler
npx wrangler login                    # 浏览器授权（本机已登录 57990177@qq.com）
npx wrangler secret put LLM_API_KEY   # 粘贴你的 LLM 密钥  ← 唯一还缺的一步
npm run deploy
```

> **当前状态**：Worker 已部署并放量，但 `LLM_API_KEY` 尚未设置。
> 此时 `/health` 返回 `llmConfigured: false`，前端**不会**显示「AI 真实规格」开关，
> 生成走本地通用模板——功能完好，只是还没接上真实规格。

本地调试（不花额度前先看提示词效果）：

```bash
cp .dev.vars.example .dev.vars   # 填入 LLM_API_KEY
npm run dev                      # http://localhost:8787
curl -s localhost:8787/health
curl -s -X POST localhost:8787/api/teardown \
  -H 'Content-Type: application/json' \
  -d '{"query":"扫地机器人"}'
```

## 四、接入前端（已接好）

`index.html` 里已注入：

```html
<script>window.TEARDOWN_API = 'https://teardown-atelier-api.57990177.workers.dev';</script>
```

前端行为：
- 启动时探测 `/health`，**只有 `llmConfigured: true` 才显示**「用 AI 生成真实规格」勾选框
- 勾上走 Worker；没勾 / 没配地址 / Worker 挂了，都自动回落到本地通用模板，功能不会坏
- AI 产出的规格可信度标注为「中」，页面保留「未经权威资料核对」提示

## 五、换 LLM 供应商

Worker 走的是 **OpenAI 兼容**接口，改两个环境变量即可：

| 供应商 | LLM_BASE_URL | LLM_MODEL |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 月之暗面 | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| 阿里百炼 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |

```bash
npx wrangler secret put LLM_API_KEY     # 换成对应家的 Key
# vars 在 wrangler.toml 里改，或：
npx wrangler deploy --var LLM_BASE_URL:https://api.deepseek.com/v1 --var LLM_MODEL:deepseek-chat
```

## 六、成本量级

免费额度：每天 100,000 请求。一次生成 ≈ 1 次 Worker 请求 + 1 次 LLM 调用。
按 `gpt-4o-mini` 计，单次约 1–2 美分；`deepseek-chat` 约 0.1 美分。
**7 天缓存**意味着同一产品只在第一次花钱。

## 七、诚实的边界

- LLM 会给错参数（螺丝数量、胶合方式、电池容量）。页面已把它标成「中」可信度，不要当维修手册用。
- 想让可信度上去，需要在提示词里接权威拆解资料检索（iFixit / 厂商维修手册），那是下一档工作量。
- 免费版 Cache API 是"尽力而为"缓存，不保证一定命中；真要强一致得上 KV。
