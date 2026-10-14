import { generateSubject, subjectFromSpec } from './generator';
import type { TeardownSpec } from './generator';
import type { Subject } from '../core/types';

/**
 * 拆解数据提供方。
 *
 * - local：离线通用模板，无网络、无密钥、确定可复现，产出是"结构示意"
 * - remote：调用 Cloudflare Worker 代理 LLM，产出带真实规格的 TeardownSpec
 *
 * Worker 没部署 / 没配 `window.TEARDOWN_API` 时，remote 自动降级到 local，
 * 站点永远可用。
 */

export interface TeardownProvider {
  id: 'local' | 'remote';
  label: string;
  /** 是否真的走了远程（用于给用户一个诚实提示） */
  remote: boolean;
  generate(query: string): Promise<Subject>;
}

const API_TIMEOUT_MS = 45_000;

export function remoteApiBase(): string | undefined {
  const w = window as unknown as { TEARDOWN_API?: string };
  const base = w.TEARDOWN_API?.trim();
  if (!base) return undefined;
  return base.replace(/\/+$/, '');
}

export const localProvider: TeardownProvider = {
  id: 'local',
  label: '通用模板（离线）',
  remote: false,
  async generate(query: string) {
    return generateSubject(query);
  },
};

export const remoteProvider: TeardownProvider = {
  id: 'remote',
  label: 'AI 生成规格（云端）',
  remote: true,
  async generate(query: string): Promise<Subject> {
    const base = remoteApiBase();
    if (!base) throw new Error('未配置 TEARDOWN_API');
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);
    try {
      const res = await fetch(`${base}/api/teardown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.slice(0, 60) }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`后端返回 ${res.status}${detail ? `：${detail.slice(0, 120)}` : ''}`);
      }
      const spec = (await res.json()) as TeardownSpec;
      if (!spec || !Array.isArray(spec.layers) || spec.layers.length < 2) {
        throw new Error('后端返回的结构不完整');
      }
      // 强制标记来源，避免前端被伪造的 source 字段骗过免责声明
      return subjectFromSpec(query, { ...spec, source: 'ai', sourceNote: spec.sourceNote });
    } finally {
      window.clearTimeout(timer);
    }
  },
};

/** 远端不可用（未配置地址）时静默回落到本地模板 */
export function pickProvider(preferRemote: boolean): TeardownProvider {
  if (preferRemote && remoteApiBase()) return remoteProvider;
  return localProvider;
}
