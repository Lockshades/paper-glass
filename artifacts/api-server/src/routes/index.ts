import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tutorRouter from "./tutor";
import adminRouter from "./admin";
import githubRouter from "./github";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tutorRouter);
router.use(adminRouter);
router.use(githubRouter);

export default router;
