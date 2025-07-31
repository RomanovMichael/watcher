import { Router } from "express";
import { vkAuthController } from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/vkid - обмен кода на токены
router.post("/vkid", vkAuthController.handleVkCallback);

// GET /api/auth/me - получение данных пользователя
router.get("/me", vkAuthController.getCurrentUser);

// POST /api/auth/refresh - обновление токена
router.post("/refresh", vkAuthController.refreshToken);

// POST /api/auth/logout - выход из системы
router.post("/logout", vkAuthController.logout);

export default router;
