const PADDLE_API_BASE = {
  live: "https://api.paddle.com",
  sandbox: "https://sandbox-api.paddle.com",
};

const ONE_YEAR = 31536000;
const QUERY_ALLOWLIST = new Set(["page", "lang", "v"]);
const TRACKING_QUERY_PREFIXES = ["utm_", "fbclid", "gclid", "msclkid", "ref"];
const STATIC_EXTENSIONS = new Set([
  "js",
  "css",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "avif",
  "ico",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "txt",
  "xml",
  "json",
  "pdf",
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function buildPaddleApiBase(env) {
  const mode = String(env.PADDLE_ENV || "live").toLowerCase();
  return PADDLE_API_BASE[mode] || PADDLE_API_BASE.live;
}

function isApiPath(pathname) {
  return pathname.startsWith("/api/");
}

function getExtension(pathname) {
  const last = pathname.split("/").pop() || "";
  const dot = last.lastIndexOf(".");
  if (dot < 0) return "";
  return last.slice(dot + 1).toLowerCase();
}

function isStaticAsset(pathname) {
  const ext = getExtension(pathname);
  return STATIC_EXTENSIONS.has(ext);
}

function isHtmlRoute(pathname) {
  return pathname === "/" || pathname.endsWith(".html") || !pathname.includes(".");
}

function shouldDropParam(key) {
  if (QUERY_ALLOWLIST.has(key)) return false;
  return TRACKING_QUERY_PREFIXES.some((prefix) => key === prefix || key.startsWith(prefix));
}

function normalizeCacheUrl(inputUrl) {
  const url = new URL(inputUrl.toString());
  const keys = [...url.searchParams.keys()];
  for (const key of keys) {
    if (!QUERY_ALLOWLIST.has(key) || shouldDropParam(key)) {
      url.searchParams.delete(key);
    }
  }
  return url;
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, { status: response.status, headers });
}

function withCacheHeaders(response, requestUrl, cacheState) {
  const url = new URL(requestUrl);
  const pathname = url.pathname;
  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  headers.set("Vary", "Accept-Encoding");
  headers.set("X-Edge-Cache", cacheState);

  if (isStaticAsset(pathname)) {
    headers.set("Cache-Control", `public, max-age=${ONE_YEAR}, immutable`);
  } else if (isHtmlRoute(pathname)) {
    headers.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  } else {
    headers.set("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600");
  }

  return new Response(response.body, { status: response.status, headers });
}

async function paddleRequest(path, env, init = {}) {
  if (!env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not configured.");
  }

  const apiBase = buildPaddleApiBase(env);
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.detail || payload?.error || "Paddle request failed.";
    throw new Error(message);
  }
  return payload;
}

async function createCheckout(request, env) {
  const body = await request.json().catch(() => ({}));
  const priceId = body.priceId || env.PADDLE_PRICE_ID;
  if (!priceId) return json({ error: "PADDLE_PRICE_ID is not configured." }, 500);

  const appBaseUrl = env.APP_BASE_URL || new URL(request.url).origin;
  const successUrl = `${appBaseUrl}/?transaction_id={transaction_id}`;

  const payload = await paddleRequest("/transactions", env, {
    method: "POST",
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: { source: "file-converter-web" },
      checkout: { url: successUrl },
    }),
  });

  const transaction = payload?.data || {};
  const checkoutUrl = transaction?.checkout?.url;
  if (!checkoutUrl) return json({ error: "Paddle checkout URL was not returned." }, 502);
  return json({ url: checkoutUrl, transactionId: transaction.id });
}

async function verifyCheckout(request, env) {
  const body = await request.json().catch(() => ({}));
  const transactionId = body.transactionId;
  if (!transactionId) return json({ error: "transactionId is required." }, 400);

  const payload = await paddleRequest(`/transactions/${encodeURIComponent(transactionId)}`, env);
  const status = String(payload?.data?.status || "").toLowerCase();
  const isPremium = status === "paid" || status === "completed";
  return json({ isPremium, status, transactionId });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      if (url.pathname === "/api/payments/paddle/checkout" && request.method === "POST") {
        return withCors(await createCheckout(request, env));
      }
      if (url.pathname === "/api/payments/paddle/verify" && request.method === "POST") {
        return withCors(await verifyCheckout(request, env));
      }
      if (url.pathname === "/api/health" && request.method === "GET") {
        return withCors(json({ ok: true, service: "fileconverter-worker", ts: new Date().toISOString() }));
      }
    } catch (error) {
      return withCors(json({ error: error.message || "Request failed." }, 500));
    }

    if (request.method !== "GET" || isApiPath(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
      const assetResponse = await env.ASSETS.fetch(request);
      const text = await assetResponse.text();
      const host = `${url.protocol}//${url.host}`;
      const rewritten = text.replaceAll("https://fileconverter.pages.dev", host);
      return withCacheHeaders(
        new Response(rewritten, {
          status: assetResponse.status,
          headers: assetResponse.headers,
        }),
        request.url,
        "BYPASS"
      );
    }

    const normalizedUrl = normalizeCacheUrl(url);
    const cacheKeyRequest = new Request(normalizedUrl.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKeyRequest);
    if (cached) return withCacheHeaders(cached, normalizedUrl, "HIT");

    const originResponse = await env.ASSETS.fetch(cacheKeyRequest);
    const cachable = originResponse.ok && !originResponse.headers.has("set-cookie");
    const response = withCacheHeaders(originResponse, normalizedUrl, "MISS");

    if (cachable) {
      ctx.waitUntil(cache.put(cacheKeyRequest, response.clone()));
    }

    return response;
  },
};
