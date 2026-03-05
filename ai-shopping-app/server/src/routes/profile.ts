import { Router, Request, Response } from "express";
import { getOrCreateUser } from "../services/profile";

const router = Router();

router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await getOrCreateUser(userId);
    res.json(profile);
  } catch (e) {
    console.error("GET /profile error", e);
    res.status(500).json({ error: "獲取畫像失敗" });
  }
});

export default router;
