import { Router, type Request, type Response } from "express";
import { authenticateUser, getUserFromRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/auth/user - Get current user info
router.get("/user", authenticateUser, (req: Request, res: Response): void => {
  try {
    const user = getUserFromRequest(req);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
