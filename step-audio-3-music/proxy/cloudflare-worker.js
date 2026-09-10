/**
 * Cloudflare Worker · StepAudio-3-Music demo 的接口代理
 * =============================================================================
 * 作用：把 API Key 留在服务端，前端只请求这个 Worker。
 *      顺带做 Origin 白名单 + 按 IP 限流 + 每日配额，
 *      避免一个 bot 把额度刷光、导致所有真实访客看到 429。
 *
 * 部署（约 3 分钟）：
 *   1. npm i -g wrangler && wrangler login
 *   2. wrangler init stepmusic-proxy   （选 "Hello World" worker）
 *   3. 用本文件覆盖 src/index.js
 *   4. 写入密钥（不会出现在代码里）：
 *        wrangler secret put STEPFUN_API_KEY
 *   5. 建限流用的 KV：
 *        wrangler kv namespace create RATE
 *      把返回的 id 填进 wrangler.toml：
 *        [[kv_namespaces]]
 *        binding = "RATE"
 *        id = "xxxxxxxx"
 *   6. wrangler deploy
 *   7. 把部署得到的地址填进 assets/js/config.js 的 PROXY_URL，
 *      并把 MODE 改成 'proxy'。前端别处不用动。
 *
 * 免费额度：Workers 10 万请求/天，KV 10 万读 + 1000 写/天。
 * 这个 demo 的量级完全够用。
 * =============================================================================
 */

const UPSTREAM = 'https://api.stepfun.com';

// 只允许你自己的站点调用。加上本地开发地址方便调试。
const ALLOWED_ORIGINS = [
  'https://stepaudiollm.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

const ALLOWED_PATHS = new Set([
  '/v1/audio/music/submit',
  '/v1/audio/music/query',
]);

// 限流：提交类请求才计数，查询不限（轮询很频繁，限了会误伤）
const SUBMIT_PER_IP_PER_DAY = 8;
const SUBMIT_PER_IP_PER_MIN = 2;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(allowOrigin) });
    }
    if (request.method !== 'POST') {
      return err(405, 'method_not_allowed', 'Only POST is supported', allowOrigin);
    }
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return err(403, 'not_allowed', 'Origin not allowed', allowOrigin);
    }

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.has(url.pathname)) {
      return err(404, 'not_found', 'Unknown endpoint', allowOrigin);
    }

    const key = env.STEPFUN_API_KEY;
    if (!key) return err(500, 'service_unavailable', 'Proxy misconfigured', allowOrigin);

    // ── 限流（仅 submit）────────────────────────────────────────────────
    if (url.pathname.endsWith('/submit') && env.RATE) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const minute = Math.floor(Date.now() / 60000);
      const dayKey = `d:${ip}:${day}`;
      const minKey = `m:${ip}:${minute}`;

      const [dRaw, mRaw] = await Promise.all([
        env.RATE.get(dayKey), env.RATE.get(minKey),
      ]);
      const dCount = Number(dRaw || 0), mCount = Number(mRaw || 0);

      if (dCount >= SUBMIT_PER_IP_PER_DAY) {
        return err(429, 'rate_limited', 'Daily limit reached for this IP', allowOrigin);
      }
      if (mCount >= SUBMIT_PER_IP_PER_MIN) {
        return err(429, 'rate_limited', 'Too many requests, slow down', allowOrigin);
      }
      // 先记账再转发：宁可少算一次成功，也不要放过一次超限
      await Promise.all([
        env.RATE.put(dayKey, String(dCount + 1), { expirationTtl: 172800 }),
        env.RATE.put(minKey, String(mCount + 1), { expirationTtl: 120 }),
      ]);
    }

    // ── 转发 ────────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.text();
      if (body.length > 30 * 1024 * 1024) {
        return err(413, 'request_params_invalid', 'Payload too large', allowOrigin);
      }
      JSON.parse(body);                       // 早点拒掉坏 JSON，不浪费上游配额
    } catch {
      return err(400, 'request_params_invalid', 'Body must be valid JSON', allowOrigin);
    }

    let upstream;
    try {
      upstream = await fetch(UPSTREAM + url.pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body,
      });
    } catch (e) {
      return err(502, 'service_unavailable', 'Upstream unreachable', allowOrigin);
    }

    const headers = cors(allowOrigin);
    headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    const trace = upstream.headers.get('x-trace-id');
    if (trace) headers.set('x-trace-id', trace);
    const shouldRetry = upstream.headers.get('x-should-retry');
    if (shouldRetry) headers.set('x-should-retry', shouldRetry);

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};

function cors(origin) {
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'x-trace-id, x-should-retry',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
}

function err(status, type, message, origin) {
  const h = cors(origin);
  h.set('Content-Type', 'application/json');
  h.set('x-should-retry', 'false');
  return new Response(JSON.stringify({ error: { type, message } }), { status, headers: h });
}
