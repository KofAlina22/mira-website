interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  EARLY_ACCESS_ALLOWED_ORIGIN?: string;
  RESEND_API_KEY?: string;
  LEAD_NOTIFICATION_EMAIL?: string;
  LEAD_NOTIFICATION_FROM?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

type RequestBody = {
  email?: unknown;
  early_access_consent?: unknown;
  source?: unknown;
  created_at?: unknown;
  locale?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  referrer?: unknown;
  company_website?: unknown;
};

type LeadRecord = {
  id: string; email: string; created_at: string; country: string | null;
  device: string; utm_source: string | null; utm_medium: string | null;
  utm_campaign: string | null; referrer: string | null;
};

const MAX_BODY_BYTES = 8192;
const PRODUCTION_ORIGIN = "https://ai-mira.tech";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCES = new Set([
  "header",
  "mobile_header",
  "hero",
  "report_copy",
  "report_preview",
  "comparison",
  "final_cta",
  "mobile_sticky",
  "unknown",
]);

function json(body: Record<string, unknown>, status = 200, origin?: string): Response {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result ? result.slice(0, max) : null;
}

function isLocalOrigin(origin?: string): boolean {
  if (!origin) return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function getAttribution(body: RequestBody, request: Request) {
  const referrer = clean(body.referrer, 1024) ?? clean(request.headers.get("Referer"), 1024);
  let referrerUrl: URL | null = null;
  try { if (referrer) referrerUrl = new URL(referrer); } catch { referrerUrl = null; }
  return {
    locale: clean(body.locale, 35) ?? clean(request.headers.get("Accept-Language")?.split(",")[0], 35),
    utm_source: clean(body.utm_source, 120) ?? clean(referrerUrl?.searchParams.get("utm_source"), 120),
    utm_medium: clean(body.utm_medium, 120) ?? clean(referrerUrl?.searchParams.get("utm_medium"), 120),
    utm_campaign: clean(body.utm_campaign, 160) ?? clean(referrerUrl?.searchParams.get("utm_campaign"), 160),
    referrer,
    user_agent: clean(request.headers.get("User-Agent"), 512),
  };
}

function deviceFromUserAgent(value: string | null): string {
  if (!value) return "Unknown";
  if (/ipad|tablet|playbook|silk/i.test(value)) return "Tablet";
  if (/mobile|iphone|ipod|android/i.test(value)) return "Mobile";
  return "Desktop";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

async function sendNotifications(env: Env, lead: LeadRecord): Promise<void> {
  const fields = [
    ["Email", lead.email], ["Time", `${lead.created_at.replace("T", " ").replace(/:\d\d\.\d+Z$/, "")} UTC`],
    ["Country", lead.country ?? "Unknown"], ["Device", lead.device], ["Source", lead.utm_source ?? "Direct"],
    ["Medium", lead.utm_medium ?? "—"], ["Campaign", lead.utm_campaign ?? "—"], ["Referrer", lead.referrer ?? "Direct"],
  ];
  const jobs: Promise<unknown>[] = [];
  if (env.RESEND_API_KEY && env.LEAD_NOTIFICATION_EMAIL) {
    const rows = fields.map(([label, value]) => `<tr><td style="padding:7px 18px 7px 0;color:#777">${label}</td><td style="padding:7px 0;color:#111">${escapeHtml(value)}</td></tr>`).join("");
    jobs.push(fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: env.LEAD_NOTIFICATION_FROM ?? "MIRA Leads <leads@ai-mira.tech>", to: [env.LEAD_NOTIFICATION_EMAIL], subject: `New Design Partner Lead — ${lead.email}`, html: `<div style="font-family:Inter,Arial,sans-serif;max-width:640px;padding:28px"><h1 style="font-size:22px">New Design Partner Lead</h1><table>${rows}</table></div>` }) }).then(async (response) => { if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`); }));
  }
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const text = ["<b>New Design Partner Lead</b>", ...fields.map(([label, value]) => `\n<b>${escapeHtml(label)}:</b>\n${escapeHtml(value)}`)].join("\n");
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }) }).then(async (response) => { if (!response.ok) throw new Error(`Telegram ${response.status}: ${await response.text()}`); }));
  }
  const results = await Promise.allSettled(jobs);
  results.forEach((result) => { if (result.status === "rejected") console.error("[MIRA] Lead notification failed.", result.reason); });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const configuredOrigin = env.EARLY_ACCESS_ALLOWED_ORIGIN?.replace(/\/$/, "");
  const requestOrigin = request.headers.get("Origin")?.replace(/\/$/, "");
  const allowedOrigins = new Set([PRODUCTION_ORIGIN, configuredOrigin].filter((origin): origin is string => Boolean(origin)));
  const allowedOrigin = requestOrigin && allowedOrigins.has(requestOrigin) ? requestOrigin : configuredOrigin ?? PRODUCTION_ORIGIN;
  const development = isLocalOrigin(requestOrigin) && isLocalOrigin(configuredOrigin);

  if (request.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." }, 405, allowedOrigin);
  }
  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return json({ ok: false, code: "ORIGIN_NOT_ALLOWED", message: "Request origin is not allowed." }, 403, allowedOrigin);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, code: "INVALID_CONTENT_TYPE", message: "Content-Type must be application/json." }, 415, allowedOrigin);
  }

  const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." }, 413, allowedOrigin);
  }

  let raw = "";
  let body: RequestBody;
  try {
    raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." }, 413, allowedOrigin);
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ ok: false, code: "INVALID_JSON", message: "Request body must be a JSON object." }, 400, allowedOrigin);
    }
    body = parsed as RequestBody;
  } catch {
    return json({ ok: false, code: "INVALID_JSON", message: "Request body must be valid JSON." }, 400, allowedOrigin);
  }

  // Reserved honeypot seam for basic automated-abuse filtering and future Turnstile integration.
  if (clean(body.company_website, 200)) {
    return json({ ok: true }, 200, allowedOrigin);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const normalizedEmail = email.toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return json({ ok: false, code: "INVALID_EMAIL", message: "Please enter a valid work email." }, 400, allowedOrigin);
  }
  if (body.early_access_consent !== true) {
    return json({ ok: false, code: "CONSENT_REQUIRED", message: "Early-access consent is required." }, 400, allowedOrigin);
  }

  const supabaseUrl = env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [!supabaseUrl && "SUPABASE_URL", !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean);
    console.error("[MIRA] Early-access storage is not configured.", development ? { missingEnvironmentVariables: missing } : undefined);
    return json({ ok: false, code: "STORAGE_ERROR", message: "We couldn’t save your request. Please try again.", ...(development ? { debug: { reason: "MISSING_ENVIRONMENT_VARIABLES", missing } } : {}) }, 503, allowedOrigin);
  }

  const requestedSource = clean(body.source, 80)?.replace(/-/g, "_") ?? "unknown";
  const source = SOURCES.has(requestedSource) ? requestedSource : "unknown";
  const attribution = getAttribution(body, request);
  const country = clean(request.headers.get("CF-IPCountry"), 2);
  const device = deviceFromUserAgent(attribution.user_agent);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/early_access_leads?on_conflict=normalized_email`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        email,
        normalized_email: normalizedEmail,
        early_access_consent: true,
        source,
        country,
        device,
        ...attribution,
      }),
    });

    if (!response.ok) {
      const supabaseBody = await response.text();
      console.error("[MIRA] Early-access storage request failed.", development ? { supabaseStatus: response.status, supabaseResponseBody: supabaseBody } : { status: response.status });
      return json({ ok: false, code: "STORAGE_ERROR", message: "We couldn’t save your request. Please try again.", ...(development ? { debug: { reason: "SUPABASE_ERROR", status: response.status, responseBody: supabaseBody } } : {}) }, 502, allowedOrigin);
    }
    const records = await response.json() as LeadRecord[];
    const lead = records[0];
    if (lead) await sendNotifications(env, lead);
    return json({ ok: true }, 200, allowedOrigin);
  } catch (error) {
    const detail = error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) };
    console.error("[MIRA] Early-access storage request could not be completed.", development ? detail : undefined);
    return json({ ok: false, code: "STORAGE_ERROR", message: "We couldn’t save your request. Please try again.", ...(development ? { debug: { reason: "SUPABASE_NETWORK_ERROR", ...detail } } : {}) }, 502, allowedOrigin);
  }
}
