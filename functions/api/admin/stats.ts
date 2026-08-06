import { AdminContext, config, dbHeaders, reply, requireAdmin } from "./_shared";
export async function onRequest({ request, env }: AdminContext): Promise<Response> {
  const denied = await requireAdmin(request, env); if (denied) return denied; if (request.method !== "GET") return reply({ error: "Method not allowed." }, 405);
  const cfg = config(env)!; const response = await fetch(`${cfg.url}/rest/v1/early_access_leads?select=created_at,utm_source,country,utm_campaign`, { headers: dbHeaders(cfg.key) });
  if (!response.ok) return reply({ error: "Could not load statistics." }, 502); const rows = await response.json() as { created_at:string; utm_source:string|null; country:string|null; utm_campaign:string|null }[];
  const now = new Date(); const today = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()); const week = today - 6*86400000; const month = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1);
  const rank = (key: "utm_source"|"country"|"utm_campaign") => Object.entries(rows.reduce((a,r) => { const v=r[key]||"Unknown"; a[v]=(a[v]||0)+1; return a; }, {} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,value])=>({label,value}));
  return reply({ total: rows.length, today: rows.filter(r=>Date.parse(r.created_at)>=today).length, week: rows.filter(r=>Date.parse(r.created_at)>=week).length, month: rows.filter(r=>Date.parse(r.created_at)>=month).length, sources: rank("utm_source"), countries: rank("country"), campaigns: rank("utm_campaign") });
}
