/* 4th Quarter Ready: small Cloudflare Worker (the free plan is enough).

   Why: a web page may only read a file from another server if that server allows it (CORS).
   The federation's calendar server does not, so the app cannot load a referee calendar directly.
   This worker fetches the calendar file and passes it on with the CORS header added.

   It only fetches .ics files from the hosts in ALLOWED_HOSTS, only answers pages from
   ALLOWED_ORIGINS, and stores or logs nothing.

   Use: GET https://<worker-address>/?url=<https link to the .ics file>
   Setup: see README.md ("Game calendar proxy"). */

const ALLOWED_HOSTS = ["www.luxembourg.basketball", "luxembourg.basketball"];
const ALLOWED_ORIGINS = ["https://dankerschen.github.io"];

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Vary": "Origin",
    };
    const reply = (status, text) => new Response(text, { status, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" } });
    if (request.method !== "GET") return reply(405, "Only GET is supported.");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return reply(403, "This origin is not allowed.");

    let target;
    try { target = new URL(new URL(request.url).searchParams.get("url")); } catch (e) { return reply(400, "Add ?url=<link to the .ics file>."); }
    if (target.protocol !== "https:" || !ALLOWED_HOSTS.includes(target.hostname) || !target.pathname.toLowerCase().endsWith(".ics"))
      return reply(403, "Only .ics calendar files from the allowed hosts can be fetched.");

    let upstream;
    try { upstream = await fetch(target.toString(), { headers: { "User-Agent": "4q-ready-calendar" }, redirect: "manual" }); }
    catch (e) { return reply(502, "The calendar server could not be reached (" + (e && e.message || "error") + ")."); }
    if (upstream.status >= 300 && upstream.status < 400) return reply(502, "The calendar server sent a redirect, which is not followed.");
    if (!upstream.ok) return reply(upstream.status === 404 ? 404 : 502, "The calendar server answered " + upstream.status + ".");

    return new Response(upstream.body, { status: 200, headers: { ...cors, "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
  },
};
