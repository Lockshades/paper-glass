/**
 * GitHub proxy route — allows the admin dashboard to query GitHub Issues
 * for the ExamPilot repo without exposing tokens to the browser.
 *
 * Uses the @replit/connectors-sdk which injects the OAuth token automatically.
 *
 * All routes require the admin Bearer token.
 */
import { Router, type Request, type Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();
const connectors = new ReplitConnectors();

// Cache repo owner/name between requests to avoid repeated lookups
let cachedOwner: string | null = null;
let cachedRepo: string | null = null;

async function getRepoCoords(): Promise<{ owner: string; repo: string } | null> {
  if (cachedOwner && cachedRepo) {
    return { owner: cachedOwner, repo: cachedRepo };
  }
  try {
    const res = await connectors.proxy("github", "/user");
    if (!res.ok) return null;
    const user = await res.json() as { login: string };
    // Default to "paper-glass"; override via env var if the repo has a different name
    cachedOwner = user.login;
    cachedRepo  = process.env.GITHUB_REPO_NAME || "paper-glass";
    return { owner: cachedOwner, repo: cachedRepo };
  } catch {
    return null;
  }
}

/** GET /api/admin/github/issues?state=open|closed|all */
router.get("/admin/github/issues", requireAdmin, async (req: Request, res: Response) => {
  const state = (req.query.state as string) || "open";
  const page  = (req.query.page  as string) || "1";

  const coords = await getRepoCoords();
  if (!coords) {
    res.status(503).json({ error: "GitHub connector not available or user lookup failed" });
    return;
  }

  try {
    const r = await connectors.proxy(
      "github",
      `/repos/${coords.owner}/${coords.repo}/issues?state=${state}&per_page=50&page=${page}&sort=created&direction=desc`,
    );
    if (!r.ok) {
      const text = await r.text();
      res.status(r.status).json({ error: text });
      return;
    }
    const issues = await r.json();
    res.json({ issues, owner: coords.owner, repo: coords.repo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

/** GET /api/admin/github/info — repo owner + name + basic stats */
router.get("/admin/github/info", requireAdmin, async (_req: Request, res: Response) => {
  const coords = await getRepoCoords();
  if (!coords) {
    res.status(503).json({ error: "GitHub connector not available" });
    return;
  }
  try {
    const r = await connectors.proxy("github", `/repos/${coords.owner}/${coords.repo}`);
    if (r.status === 404) {
      // Repo doesn't exist yet
      res.json({ exists: false, owner: coords.owner, repo: coords.repo });
      return;
    }
    if (!r.ok) {
      res.status(r.status).json({ error: await r.text() });
      return;
    }
    const data = await r.json() as Record<string, unknown>;
    res.json({
      exists: true,
      owner: coords.owner,
      repo: coords.repo,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      openIssues: data.open_issues_count,
      stars: data.stargazers_count,
      private: data.private,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

/** POST /api/admin/github/issues — create a new issue */
router.post("/admin/github/issues", requireAdmin, async (req: Request, res: Response) => {
  const { title, body, labels } = req.body as { title?: string; body?: string; labels?: string[] };
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const coords = await getRepoCoords();
  if (!coords) {
    res.status(503).json({ error: "GitHub connector not available" });
    return;
  }

  try {
    const r = await connectors.proxy(
      "github",
      `/repos/${coords.owner}/${coords.repo}/issues`,
      {
        method: "POST",
        body: JSON.stringify({ title, body: body || "", labels: labels || [] }),
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!r.ok) {
      res.status(r.status).json({ error: await r.text() });
      return;
    }
    res.status(201).json(await r.json());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
