import { AdminContext, config, reply } from "./_shared";
export async function onRequest({ request, env }: AdminContext): Promise<Response> {
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const cfg = config(env); if (!cfg) return reply({ error: "Server is not configured." }, 503);
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) return reply({ error: "Email and password are required." }, 400);
  const response = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: cfg.key, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) return reply({ error: "Invalid email or password." }, 401);
  const allowed = (env.ADMIN_EMAILS ?? "").split(",").map(x => x.trim().toLowerCase());
  const user = data.user as { email?: string } | undefined;
  if (!user?.email || !allowed.includes(user.email.toLowerCase())) return reply({ error: "Access denied." }, 403);
  return reply({ access_token: data.access_token, expires_in: data.expires_in, email: user.email });
}
