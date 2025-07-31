import { Request, Response } from "express";
import { vkService } from "../services/vk.service";
import { jwtService } from "../services/jwt.service";

interface VkCallbackRequest {
  code: string;
  device_id: string;
  codeVerifier: string;
}

export const vkAuthController = {
  // Обработка callback от VK ID
  async handleVkCallback(req: Request, res: Response) {
    try {
      const { code, device_id, codeVerifier }: VkCallbackRequest = req.body;

      // Валидация входных данных
      if (!code || !device_id || !codeVerifier) {
        return res.status(400).json({
          error: "Отсутствуют обязательные параметры",
        });
      }

      // Обмениваем код на токены VK
      const vkTokens = await vkService.exchangeCodeForTokens(
        code,
        codeVerifier,
        device_id
      );

      // Получаем данные пользователя
      const userData = await vkService.getUserInfo(vkTokens.access_token);

      // Создаем JWT токены
      const tokens = jwtService.generateTokens(userData.id);

      res.json({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user: {
          id: userData.id,
          email: userData.email,
          phone: userData.phone,
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      });
    } catch (error) {
      console.error("Ошибка обработки VK callback:", error);
      res.status(500).json({
        error: "Ошибка авторизации",
      });
    }
  },

  // Получение данных текущего пользователя
  async getCurrentUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ error: "Токен не предоставлен" });
      }

      const payload = jwtService.verifyToken(token);
      const userData = await vkService.getUserInfo(payload.vkAccessToken);

      res.json({
        id: userData.id,
        email: userData.email,
        phone: userData.phone,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
    } catch (error) {
      console.error("Ошибка получения данных пользователя:", error);
      res.status(401).json({ error: "Недействительный токен" });
    }
  },

  // Обновление токена
  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ error: "Refresh токен не предоставлен" });
      }

      const payload = jwtService.verifyRefreshToken(refresh_token);
      const tokens = jwtService.generateTokens(payload.userId);

      res.json({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
      res.status(401).json({ error: "Недействительный refresh токен" });
    }
  },

  // Выход из системы
  async logout(req: Request, res: Response) {
    // В реальном приложении здесь можно добавить токен в черный список
    res.json({ message: "Успешный выход" });
  },
};
