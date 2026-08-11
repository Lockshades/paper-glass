import { Router } from "express";
import { metricsStore } from "../metrics/store";
import { requireAdmin, handleAdminAuth } from "../middlewares/adminAuth";

const router = Router();

/** POST /api/admin/auth — get a token */
router.post("/admin/auth", handleAdminAuth);

/** GET /api/admin/metrics — full metrics payload */
router.get("/admin/metrics", requireAdmin, (_req, res) => {
  const ai = metricsStore.getAiSummary();
  const server = metricsStore.getServerInfo();
  const flags = metricsStore.getFlags();

  res.json({
    ai,
    server,
    flags: {
      total: flags.length,
      pending: flags.filter(f => !f.resolved).length,
      resolved: flags.filter(f => f.resolved).length,
    },
  });
});

/** GET /api/admin/flags — list all flagged questions */
router.get("/admin/flags", requireAdmin, (_req, res) => {
  res.json(metricsStore.getFlags());
});

/** POST /api/admin/flag — flag a question (no auth, from student app) */
router.post("/admin/flag", (req, res) => {
  const { questionId, reason, subject, questionText } = req.body as {
    questionId?: number;
    reason?: string;
    subject?: string;
    questionText?: string;
  };
  if (!questionId || !reason) {
    res.status(400).json({ error: "questionId and reason are required" });
    return;
  }
  const flag = metricsStore.addFlag({
    questionId,
    reason,
    subject: subject || "Unknown",
    questionText: questionText || "",
  });
  res.status(201).json(flag);
});

/** POST /api/admin/flags/:id/resolve — mark a flag resolved */
router.post("/admin/flags/:id/resolve", requireAdmin, (req, res) => {
  const ok = metricsStore.resolveFlag(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "Flag not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
