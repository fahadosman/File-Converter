const PADDLE_API_BASE = {
  live: "https://api.paddle.com",
  sandbox: "https://sandbox-api.paddle.com",
};

const ONE_YEAR = 31536000;
const ONE_DAY = 86400;
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
/** Matches client FREE_LIMIT in public/script.js — edge usage session (cookie-backed). */
const USAGE_FREE_LIMIT = 5;
const USAGE_COOKIE_COUNT = "fc_usage";
const USAGE_COOKIE_PREMIUM = "fc_pm";

const REDIRECTS = new Map([
  ["/tools", "/tools.html"],
  ["/about", "/about.html"],
  ["/contact", "/contact.html"],
  ["/features", "/features.html"],
  ["/faq", "/faq.html"],
  ["/privacy", "/privacy.html"],
  ["/terms", "/terms.html"],
  ["/security", "/security.html"],
  ["/help", "/help.html"],
  ["/blog", "/blog.html"],
  ["/refund", "/refund.html"],
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const prefix = `${name}=`;
  const parts = raw.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(prefix)) {
      try {
        return decodeURIComponent(p.slice(prefix.length));
      } catch (e) {
        return "";
      }
    }
  }
  return "";
}

function parseUsageCount(request) {
  const v = getCookie(request, USAGE_COOKIE_COUNT);
  const n = parseInt(String(v || "0"), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 1_000_000);
}

function usageSessionPayload(request) {
  const isPremium = getCookie(request, USAGE_COOKIE_PREMIUM) === "1";
  const usageCount = parseUsageCount(request);
  return { usageCount, isPremium };
}

function handleUsageConsume(request) {
  const isPremium = getCookie(request, USAGE_COOKIE_PREMIUM) === "1";
  let usageCount = parseUsageCount(request);
  if (isPremium) {
    return withCors(json({ usageCount, isPremium: true }));
  }
  if (usageCount >= USAGE_FREE_LIMIT) {
    return withCors(json({ usageCount, isPremium: false, error: "limit" }, 403));
  }
  usageCount += 1;
  const body = JSON.stringify({ usageCount, isPremium: false });
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  headers.append(
    "Set-Cookie",
    `${USAGE_COOKIE_COUNT}=${usageCount}; Path=/; Max-Age=${ONE_YEAR}; Secure; SameSite=Lax`
  );
  return withCors(new Response(body, { status: 200, headers }));
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

function generateWeakEtag(pathname, lastModified) {
  const source = `${pathname}:${lastModified || "na"}`;
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 33) ^ source.charCodeAt(i);
  }
  return `W/"${(hash >>> 0).toString(16)}"`;
}

function withSecurityHeaders(response, requestUrl) {
  const url = new URL(requestUrl);
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("X-Robots-Tag", "all");
  headers.set("Alt-Svc", 'h3=":443"; ma=86400');
  headers.set("Content-Security-Policy", "upgrade-insecure-requests; block-all-mixed-content");
  if (isHtmlRoute(url.pathname)) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content"
    );
  }
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
    headers.set("Cache-Control", `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable, stale-if-error=${ONE_DAY}`);
  } else if (isHtmlRoute(pathname)) {
    headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400");
  } else {
    headers.set("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600, stale-if-error=3600");
  }
  headers.set("CDN-Cache-Control", headers.get("Cache-Control") || "");

  const existingEtag = headers.get("etag");
  if (!existingEtag) {
    headers.set("ETag", generateWeakEtag(pathname, headers.get("last-modified")));
  }

  return new Response(response.body, { status: response.status, headers });
}

function isLikelyMissingAsset(pathname, response) {
  if (!isStaticAsset(pathname)) return false;
  if (!response.ok) return false;
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  return contentType.includes("text/html");
}

function getCanonicalRedirect(url) {
  if (REDIRECTS.has(url.pathname)) {
    return REDIRECTS.get(url.pathname);
  }
  if (url.pathname.startsWith("/tool/")) {
    const slug = url.pathname.replace(/^\/tool\//, "").replace(/\/index\.html$/, "").replace(/\/$/, "");
    if (slug) return `/tools/${slug}.html`;
  }
  return null;
}

/** Human-readable message from Paddle Billing API error payloads. */
function formatPaddleError(payload) {
  const err = payload && payload.error;
  if (!err) return "Paddle request failed.";
  if (typeof err === "string") return err;
  const detail = err.detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((d) => {
      if (!d || typeof d !== "object") return String(d);
      return d.description || d.message || d.title || d.code || JSON.stringify(d);
    });
    const joined = parts.filter(Boolean).join("; ");
    if (joined) return joined;
  }
  if (typeof detail === "string" && detail) return detail;
  if (err.message && typeof err.message === "string") return err.message;
  if (err.code && typeof err.code === "string") return err.code;
  try {
    return JSON.stringify(err);
  } catch (e) {
    return "Paddle request failed.";
  }
}

/** True when Paddle considers the transaction successfully collected (Billing API v2). */
function isTransactionPaid(data) {
  if (!data || typeof data !== "object") return false;
  const status = String(data.status || "").toLowerCase();
  if (status === "completed" || status === "billed" || status === "paid") return true;
  const payments = Array.isArray(data.payments) ? data.payments : [];
  return payments.some((p) => {
    const ps = String(p && p.status ? p.status : "").toLowerCase();
    return ps === "captured" || ps === "completed" || ps === "paid";
  });
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
    throw new Error(formatPaddleError(payload));
  }
  return payload;
}

async function verifyCheckout(request, env) {
  const body = await request.json().catch(() => ({}));
  const transactionId = String(body.transactionId || "").trim();
  if (!transactionId) return json({ error: "transactionId is required." }, 400);
  // Paddle Billing ids are txn_ + alphanumeric (see Paddle ID reference). Reject garbage without 400 so
  // older cached clients do not show an error toast when the return URL has a placeholder or junk param.
  if (!/^txn_[0-9a-z]{4,}$/i.test(transactionId)) {
    return json({ isPremium: false, status: "skipped_invalid_id", transactionId: null });
  }

  const apiPayload = await paddleRequest(`/transactions/${encodeURIComponent(transactionId)}`, env);
  const data = apiPayload && apiPayload.data;
  const status = String((data && data.status) || "").toLowerCase();
  const isPremium = isTransactionPaid(data);
  const verifyBody = { isPremium, status, transactionId };
  if (isPremium) {
    const res = json(verifyBody);
    const headers = new Headers(res.headers);
    headers.append(
      "Set-Cookie",
      `${USAGE_COOKIE_PREMIUM}=1; Path=/; Max-Age=${ONE_YEAR}; Secure; SameSite=Lax`
    );
    return new Response(res.body, { status: res.status, headers });
  }
  return json(verifyBody);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const start = Date.now();
    const requestId = crypto.randomUUID();

    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

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
      if (url.pathname === "/api/rum" && request.method === "POST") {
        const payload = await request.json().catch(() => ({}));
        console.log(JSON.stringify({ level: "info", type: "rum", requestId, payload }));
        return withCors(json({ ok: true }, 202));
      }
      if (url.pathname === "/api/payments/paddle/verify" && request.method === "POST") {
        return withCors(await verifyCheckout(request, env));
      }
      if (url.pathname === "/api/health" && request.method === "GET") {
        return withCors(json({ ok: true, service: "fileconverter-worker", ts: new Date().toISOString() }));
      }
      if (url.pathname === "/api/usage/session/start" && request.method === "POST") {
        return withCors(json(usageSessionPayload(request)));
      }
      if (url.pathname === "/api/usage/session/status" && request.method === "GET") {
        return withCors(json(usageSessionPayload(request)));
      }
      if (url.pathname === "/api/usage/session/consume" && request.method === "POST") {
        return handleUsageConsume(request);
      }
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          type: "api_exception",
          requestId,
          path: url.pathname,
          message: error.message || "Request failed.",
        })
      );
      return withCors(json({ error: error.message || "Request failed." }, 500));
    }

    const canonicalRedirect = getCanonicalRedirect(url);
    if (canonicalRedirect) {
      return Response.redirect(new URL(canonicalRedirect, `${url.protocol}//${url.host}`).toString(), 301);
    }

    try {
      if (request.method !== "GET" || isApiPath(url.pathname)) {
        return withSecurityHeaders(await env.ASSETS.fetch(request), request.url);
      }

      if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
        const assetResponse = await env.ASSETS.fetch(request);
        const text = await assetResponse.text();
        const host = `${url.protocol}//${url.host}`;
        const rewritten = text.replaceAll("https://fileconverter.pages.dev", host);
        return withSecurityHeaders(
          withCacheHeaders(
            new Response(rewritten, {
              status: assetResponse.status,
              headers: assetResponse.headers,
            }),
            request.url,
            "BYPASS"
          ),
          request.url
        );
      }

      const normalizedUrl = normalizeCacheUrl(url);
      const cacheKeyRequest = new Request(normalizedUrl.toString(), request);
      const cache = caches.default;
      const cached = await cache.match(cacheKeyRequest);
      if (cached) return withSecurityHeaders(withCacheHeaders(cached, normalizedUrl, "HIT"), request.url);

      const originResponse = await env.ASSETS.fetch(cacheKeyRequest);
      if (isLikelyMissingAsset(url.pathname, originResponse)) {
        return withSecurityHeaders(
          new Response("Not Found", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=60" },
          }),
          request.url
        );
      }
      const cachable = originResponse.ok && !originResponse.headers.has("set-cookie");
      let response = withCacheHeaders(originResponse, normalizedUrl, "MISS");

      if (cachable) {
        ctx.waitUntil(
          cache.put(cacheKeyRequest, response.clone()).catch((err) => {
            console.error(
              JSON.stringify({
                level: "error",
                type: "cache_put_failed",
                requestId,
                path: url.pathname,
                message: err && err.message ? err.message : String(err),
              })
            );
          })
        );
      }

      const elapsed = Date.now() - start;
      const headers = new Headers(response.headers);
      headers.set("Server-Timing", `edge;dur=${elapsed}`);
      headers.set("X-Request-Id", requestId);
      response = new Response(response.body, { status: response.status, headers });

      if (response.status >= 500) {
        console.error(
          JSON.stringify({
            level: "error",
            type: "origin_5xx",
            requestId,
            path: url.pathname,
            status: response.status,
            elapsed,
          })
        );
      }

      if (response.status >= 400 && response.status < 500) {
        console.warn(
          JSON.stringify({
            level: "warn",
            type: "origin_4xx",
            requestId,
            path: url.pathname,
            status: response.status,
            elapsed,
          })
        );
      }

      return withSecurityHeaders(response, request.url);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          type: "asset_route_exception",
          requestId,
          path: url.pathname,
          message: error.message || "Request failed.",
        })
      );
      return new Response("Service temporarily unavailable.", {
        status: 503,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "X-Request-Id": requestId,
        },
      });
    }
  },
};
