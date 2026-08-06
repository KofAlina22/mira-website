export interface AdminEnv { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string; ADMIN_EMAILS?: string; }
export interface AdminContext { request: Request; env: AdminEnv; }
export function reply(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }); }
export function config(env: AdminEnv) { const url = env.SUPABASE_URL?.replace(/\/$/, ""); const key = env.SUPABASE_SERVICE_ROLE_KEY; return url && key ? { url, key } : null; }
export async function requireAdmin(request: Request, env: AdminEnv): Promise<Response | null> {
  const cfg = config(env); if (!cfg) return reply({ error: "Server is not configured." }, 503);
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, ""); if (!token) return reply({ error: "Authentication required." }, 401);
  const response = await fetch(`${cfg.url}/auth/v1/user`, { headers: { apikey: cfg.key, Authorization: `Bearer ${token}` } });
  if (!response.ok) return reply({ error: "Session expired." }, 401);
  const user = await response.json() as { email?: string };
  const allowed = (env.ADMIN_EMAILS ?? "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !allowed.includes(user.email.toLowerCase())) return reply({ error: "Access denied." }, 403);
  return null;
}
export function dbHeaders(key: string, extra: Record<string,string> = {}) { return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...extra }; }
