import { Request, Response } from "express";
import { gamificationService } from "../services/gamification.service";
import { stateService } from "../services/state.service";

export const gamificationController = {
  async getAchievements(req: Request, res: Response) {
    const { userId } = req.params;
    const achievements = await gamificationService.getUserAchievements(userId);
    res.json(achievements);
  },

  async getBadges(req: Request, res: Response) {
    const { userId } = req.params;
    const achievements = await gamificationService.getUserAchievements(userId);
    res.json(achievements.badges);
  },

  async getLeaderboard(req: Request, res: Response) {
    const leaderboard = gamificationService.getLeaderboard();
    res.json(leaderboard);
  },

  async award(req: Request, res: Response) {
    const { userId, points, reason } = req.body;
    if (!userId || !points) {
      res.status(400).json({ error: "userId e points são obrigatórios" });
      return;
    }
    await gamificationService.awardPointsWithReason(userId, points, reason || "admin");
    await gamificationService.checkAndAwardBadges(userId);
    res.json({ message: "Pontos atribuídos", state: stateService.get() });
  },
};
