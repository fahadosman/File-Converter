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

/** Public https origin for post-checkout redirect; must match a Paddle-approved checkout domain. */
function resolveAppBaseUrl(request, env) {
  const configured = String(env.APP_BASE_URL || "").trim().replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  const hostHeader = (request.headers.get("Host") || "").split(":")[0].trim();
  const host = hostHeader || url.hostname;
  const proto =
    (request.headers.get("X-Forwarded-Proto") || "").split(",")[0].trim().toLowerCase() ||
    (url.protocol === "https:" ? "https" : "http");
  const scheme = proto === "https" || proto === "http" ? proto : url.protocol === "https:" ? "https" : "http";
  if (host) return `${scheme}://${host}`;
  return String(url.origin).replace(/\/$/, "");
}

function isPaddleCheckoutDomainError(message) {
  return /approved by Paddle|checkout\.url/i.test(String(message || ""));
}

async function createCheckout(request, env) {
  const body = await request.json().catch(() => ({}));
  const priceId = String(body.priceId || env.PADDLE_PRICE_ID || "").trim();
  if (!priceId) return json({ error: "PADDLE_PRICE_ID is not configured." }, 500);

  const productId = String(body.productId || env.PADDLE_PRODUCT_ID || "").trim();
  const customData = { source: "file-converter-web" };
  if (productId) customData.product_id = productId;

  const appBaseUrl = resolveAppBaseUrl(request, env);
  const successUrl = `${appBaseUrl}/?transaction_id={transaction_id}`;

  let payload;
  try {
    payload = await paddleRequest("/transactions", env, {
      method: "POST",
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        collection_mode: "automatic",
        custom_data: customData,
        checkout: { url: successUrl },
      }),
    });
  } catch (error) {
    const msg = String(error.message || "Paddle request failed.");
    if (isPaddleCheckoutDomainError(msg)) {
      return json(
        {
          error: msg,
          hint:
            "In Paddle Billing, open Checkout / payment links settings and add this exact hostname to approved domains (or your default payment link allowed domains). Set Worker secret APP_BASE_URL to your public site origin with no trailing slash, e.g. https://filesconverter.org — use the same host users see in the browser (www vs non-www must match).",
          checkoutOrigin: appBaseUrl,
        },
        400
      );
    }
    throw error;
  }

  const data = payload && payload.data;
  const checkoutUrl = data && data.checkout && data.checkout.url;
  if (!checkoutUrl) return json({ error: "Paddle checkout URL was not returned." }, 502);
  const transactionId = data && data.id;
  if (!transactionId) return json({ error: "Paddle transaction id was not returned." }, 502);
  return json({ url: checkoutUrl, transactionId });
}

async function verifyCheckout(request, env) {
  const body = await request.json().catch(() => ({}));
  const transactionId = String(body.transactionId || "").trim();
  if (!transactionId) return json({ error: "transactionId is required." }, 400);

  const payload = await paddleRequest(`/transactions/${encodeURIComponent(transactionId)}`, env);
  const data = payload && payload.data;
  const status = String((data && data.status) || "").toLowerCase();
  const isPremium = isTransactionPaid(data);
  return json({ isPremium, status, transactionId });
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
