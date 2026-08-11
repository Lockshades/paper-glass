import { Request, Response, NextFunction } from "express";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "exampilot-ops-2026";

/**
 * Simple bearer-token admin auth.
 * Token IS the password — no JWT signing needed for an MVP dashboard.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

/** POST /api/admin/auth — exchange password for token (the password itself) */
export function handleAdminAuth(req: Request, res: Response) {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ token: ADMIN_PASSWORD, ok: true });
}
