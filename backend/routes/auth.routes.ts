import { Router } from "express";
import { customerLogin, login, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/customer/login", customerLogin);
router.get("/me", authenticate, me);

export default router;
