// worker.js
// The whole server. Read it before you deploy it.
//
// One function. Cloudflare calls it with every request that reaches your
// workers.dev URL and sends back whatever Response you return.
//
// Four things to recognize here, because you will need to recognize them
// later in code you did not write:
//   env.DB      the D1 binding from wrangler.toml (no connection string, nothing to leak)
//   bind(?)     the user's value goes in as a parameter, never pasted into the SQL
//   status 400  the EARS "unwanted behavior" row, executable
//   CORS        headers that tell the browser your page is allowed to call this Worker

// Narrowed from "*" (HW4 Craft credit): only these page origins may call the
// Worker from a browser. Before deploying, add the Live Server origin from the
// Codespace Ports tab (https://<codespace-name>-5500.app.github.dev, no
// trailing slash). curl is not a browser and ignores CORS; this protects
// users from other sites calling the Worker, not the table from curl.
const ALLOWED_ORIGINS = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://supreme-engine-g5qr94rpx7rcx9q-5500.app.github.dev"
];

const SERVICE_MAX_CHARS = 200;

function corsHeaders(request) {
  const headers = {
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type",
    // The answer depends on who asked, so caches must not reuse it across origins.
    "vary": "Origin",
  };
  const origin = request.headers.get("origin");
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);
    // Anything that throws below becomes a readable 500 instead of a bare
    // "Error 1101: Worker threw exception". The message names the cause,
    // which is what your verification table needs.
    try {
      return await handle(request, env, cors);
    } catch (err) {
      return new Response("server error: " + err.message, { status: 500, headers: cors });
    }
  },
};

async function handle(request, env, cors) {
  const url = new URL(request.url);

  // Browsers send an OPTIONS "preflight" before a JSON POST from another
  // origin. Answer it with the CORS headers and nothing else.
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // The most common Session B failure: the D1 binding did not attach because
  // wrangler.toml still says PASTE_ID_HERE or the id was pasted badly.
  if (!env.DB) {
    return new Response(
      "server error: no D1 binding. Check database_id in wrangler.toml and redeploy.",
      { status: 500, headers: cors });
  }

  // EARS: THE SYSTEM SHALL return all entries in creation order.
  // The bare workers.dev URL answers the same way, so whoever opens the root
  // (a grader, a link without /entries) sees the entries instead of a 404.
  if (request.method === "GET" && (url.pathname === "/entries" || url.pathname === "/")) {
    const { results } = await env.DB.prepare(
      "SELECT id, service, price, created_at FROM entries ORDER BY id").all();
    return Response.json(results, { headers: cors });
  }

  // EARS: WHEN a valid subscription is submitted, THE SYSTEM SHALL store it and confirm.
  if (request.method === "POST" && url.pathname === "/entries") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("body must be JSON", { status: 400, headers: cors });
    }
    if (body === null || typeof body !== "object") {
      return new Response("body must be a JSON object", { status: 400, headers: cors });
    }

    // EARS: IF the service name is missing, empty, or longer than 200
    // characters, THEN THE SYSTEM SHALL reject it and say why.
    const service = typeof body.service === "string" ? body.service.trim() : "";
    const serviceChars = Array.from(service).length;
    if (serviceChars < 1 || serviceChars > SERVICE_MAX_CHARS) {
      return new Response("service name must be 1-200 characters", { status: 400, headers: cors });
    }

    // HW4 validation rule (FEATURES.md, EARS U-HW4): IF a submitted price is
    // not a number greater than 0, THEN THE SYSTEM SHALL reject it and say why.
    // The page already checks this in HW3, but the page is not the only client:
    // anyone with curl can POST, and a bad price would corrupt every user's total.
    const price = body.price;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return new Response("price must be a number greater than 0", { status: 400, headers: cors });
    }

    await env.DB.prepare("INSERT INTO entries (service, price) VALUES (?, ?)")
      .bind(service, price).run();
    return new Response(null, { status: 201, headers: cors });
  }

  // EARS: WHEN the user removes a subscription, THE SYSTEM SHALL delete it so
  // the total no longer includes it (HW3 Behavior step 8).
  const match = url.pathname.match(/^\/entries\/(\d+)$/);
  if (request.method === "DELETE" && match) {
    const { meta } = await env.DB.prepare("DELETE FROM entries WHERE id = ?")
      .bind(Number(match[1])).run();
    if (meta.changes === 0) {
      return new Response("no such entry", { status: 404, headers: cors });
    }
    return new Response(null, { status: 204, headers: cors });
  }

  return new Response("not found", { status: 404, headers: cors });
}
