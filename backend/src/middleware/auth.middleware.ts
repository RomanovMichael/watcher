import { Request, Response, NextFunction } from "express";
import { jwtService } from "../services/jwt.service.js";
import { vkService } from "../services/vk.service.js";

// Расширяем типы Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        vkAccessToken: string;
        vkRefreshToken: string;
      };
    }
  }
}

export const authMiddleware = {
  // Проверка и обновление токенов
  async checkAndRefreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ error: "Токен не предоставлен" });
      }

      // Проверяем валидность JWT токена
      if (!jwtService.isValidToken(token)) {
        return res.status(401).json({ error: "Недействительный токен" });
      }

      const payload = jwtService.verifyToken(token);

      // Проверяем, не истек ли VK токен
      if (jwtService.isVkTokenExpired(token)) {
        try {
          // Обновляем VK токены
          const newVkTokens = await vkService.refreshVkTokens(
            payload.vkRefreshToken
          );

          // Создаем новый JWT с обновленными VK токенами
          const newTokens = jwtService.generateTokens(
            payload.userId,
            newVkTokens.access_token,
            newVkTokens.refresh_token,
            Date.now() + newVkTokens.expires_in * 1000
          );

          // Добавляем новый токен в заголовки ответа
          res.setHeader("New-Access-Token", newTokens.accessToken);
          res.setHeader("New-Refresh-Token", newTokens.refreshToken);
          res.setHeader("Token-Expires-In", newTokens.expiresIn.toString());

          // Добавляем обновленные данные в request
          req.user = {
            id: payload.userId,
            vkAccessToken: newVkTokens.access_token,
            vkRefreshToken: newVkTokens.refresh_token,
          };
        } catch (refreshError) {
          console.error("Ошибка обновления VK токенов:", refreshError);
          return res.status(401).json({ error: "Не удалось обновить токены" });
        }
      } else {
        // Токены валидны, добавляем данные в request
        req.user = {
          id: payload.userId,
          vkAccessToken: payload.vkAccessToken,
          vkRefreshToken: payload.vkRefreshToken,
        };
      }

      next();
    } catch (error) {
      console.error("Ошибка middleware авторизации:", error);
      res.status(401).json({ error: "Ошибка авторизации" });
    }
  },

  // Простая проверка токена без обновления
  checkToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !jwtService.isValidToken(token)) {
      return res.status(401).json({ error: "Недействительный токен" });
    }

    next();
  },
};
