import { AdminContext, config, dbHeaders, reply, requireAdmin } from "./_shared";
const STATUSES = new Set(["new","contacted","interview_scheduled","design_partner","rejected"]);
function safe(value: string | null, max = 200) { return value?.trim().slice(0, max) ?? ""; }
function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
export async function onRequest({ request, env }: AdminContext): Promise<Response> {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const cfg = config(env)!; const url = new URL(request.url);
  if (request.method === "PATCH") {
    const body = await request.json().catch(() => null) as { id?: string; status?: string; notes?: string } | null;
    if (!body?.id || (body.status && !STATUSES.has(body.status))) return reply({ error: "Invalid update." }, 400);
    const update: Record<string,string> = {}; if (body.status) update.status = body.status; if (typeof body.notes === "string") update.notes = body.notes.slice(0, 5000);
    const response = await fetch(`${cfg.url}/rest/v1/early_access_leads?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", headers: dbHeaders(cfg.key, { Prefer: "return=representation" }), body: JSON.stringify(update) });
    if (!response.ok) return reply({ error: "Could not update lead." }, 502); return reply({ lead: (await response.json())[0] });
  }
  if (request.method !== "GET") return reply({ error: "Method not allowed." }, 405);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1); const pageSize = 20;
  const params = new URLSearchParams({ select: "id,email,created_at,country,device,source,status,notes,utm_source,utm_medium,utm_campaign,referrer", order: "created_at.desc" });
  const email = safe(url.searchParams.get("email"), 254).replace(/[%_,()]/g, ""); if (email) params.set("normalized_email", `ilike.*${email.toLowerCase()}*`);
  const status = safe(url.searchParams.get("status")); if (STATUSES.has(status)) params.set("status", `eq.${status}`);
  const from = safe(url.searchParams.get("from"), 10); const to = safe(url.searchParams.get("to"), 10); if (/^\d{4}-\d{2}-\d{2}$/.test(from)) params.append("created_at", `gte.${from}T00:00:00Z`); if (/^\d{4}-\d{2}-\d{2}$/.test(to)) params.append("created_at", `lt.${to}T23:59:59.999Z`);
  const isExport = url.searchParams.get("export") === "csv"; const start = isExport ? 0 : (page - 1) * pageSize; const end = isExport ? 9999 : start + pageSize - 1;
  const response = await fetch(`${cfg.url}/rest/v1/early_access_leads?${params}`, { headers: dbHeaders(cfg.key, { Prefer: "count=exact", Range: `${start}-${end}` }) });
  if (!response.ok) return reply({ error: "Could not load leads." }, 502); const leads = await response.json() as Record<string,unknown>[];
  if (isExport) { const columns = ["email","created_at","country","device","source","status","utm_source","utm_medium","utm_campaign","referrer","notes"]; const csv = [columns.join(","), ...leads.map(row => columns.map(c => csvCell(row[c])).join(","))].join("\r\n"); return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="mira-leads-${new Date().toISOString().slice(0,10)}.csv"`, "Cache-Control": "no-store" } }); }
  const range = response.headers.get("Content-Range"); const total = Number(range?.split("/")[1]) || leads.length;
  return reply({ leads, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) });
}
