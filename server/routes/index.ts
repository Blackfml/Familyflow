import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { authController } from "../controllers/auth.controller";
import { taskController } from "../controllers/task.controller";
import { goalController } from "../controllers/goal.controller";
import { habitController } from "../controllers/habit.controller";
import { chatController } from "../controllers/chat.controller";
import { notificationController } from "../controllers/notification.controller";
import { notificationChannelsController } from "../controllers/notification-channels.controller";
import { shoppingController } from "../controllers/shopping.controller";
import { stateController } from "../controllers/state.controller";
import { eventController } from "../controllers/event.controller";
import { gamificationController } from "../controllers/gamification.controller";
import { validate } from "../middleware/validate";

const router = Router();

const requiredString = (field: string) => [{ field, type: "string" as const, required: true }];
const optionalString = (field: string) => [{ field, type: "string" as const, required: false }];

// Public routes (no auth)
router.get("/state", stateController.get);
router.post("/auth/register", validate([...requiredString("name"), ...optionalString("email")]), authController.register);
router.post("/auth/login", validate(requiredString("email")), authController.login);
router.post("/auth/firebase", validate(requiredString("idToken")), authController.firebaseAuth);

// Protected routes (auth required)
router.use(authMiddleware);

router.post("/state/reset", stateController.reset);
router.delete("/auth/profile/:name", authController.deleteProfile);

// Tasks
router.get("/tasks", taskController.list);
router.post("/task", validate([...requiredString("title"), ...requiredString("responsible")]), taskController.create);
router.delete("/task/:id", taskController.remove);

// Goals
router.post("/goal", validate(requiredString("title")), goalController.create);

// Habits
router.post("/habit/toggle", validate([...requiredString("id"), ...requiredString("dateStr")]), habitController.toggle);
router.delete("/habit/:id", habitController.remove);

// Shopping
router.post("/shopping", validate(requiredString("name")), shoppingController.upsert);
router.delete("/shopping/:id", shoppingController.remove);

// Calendar
router.post("/calendar", validate([...requiredString("title"), ...requiredString("date"), ...requiredString("startTime")]), eventController.create);

// Notifications
router.post("/notifications/read", notificationController.markRead);

// Chat
router.post("/chat/group", chatController.sendGroupMessage);

// Gamification
router.get("/gamification/achievements/:userId", gamificationController.getAchievements);
router.get("/gamification/badges/:userId", gamificationController.getBadges);
router.get("/gamification/leaderboard", gamificationController.getLeaderboard);
router.post("/gamification/award", gamificationController.award);

// Notification Channels
router.get("/notification-channels/:userId", notificationChannelsController.getChannels);
router.post("/notification-channels/set", notificationChannelsController.setChannel);
router.post("/notification-channels/quiet-hours", notificationChannelsController.setQuietHours);

export default router;
