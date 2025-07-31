import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: number;
  vkAccessToken: string;
  vkRefreshToken: string;
  vkTokenExpiresAt: number;
}

interface RefreshTokenPayload {
  userId: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const jwtService = {
  // Генерация токенов с VK токенами
  generateTokens(
    userId: number,
    vkAccessToken?: string,
    vkRefreshToken?: string,
    vkTokenExpiresAt?: number
  ): TokenResponse {
    const accessToken = jwt.sign(
      {
        userId,
        vkAccessToken,
        vkRefreshToken,
        vkTokenExpiresAt: vkTokenExpiresAt || Date.now() + 24 * 60 * 60 * 1000,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 минут в секундах
    };
  },

  // Проверка access токена
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  },

  // Проверка refresh токена
  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload;
  },

  // Проверка срока действия VK токена
  isVkTokenExpired(token: string): boolean {
    try {
      const payload = jwt.decode(token) as TokenPayload;
      return payload.vkTokenExpiresAt < Date.now();
    } catch {
      return true;
    }
  },

  // Проверка срока действия JWT токена
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Проверка валидности токена без выброса ошибки
  isValidToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return true;
    } catch {
      return false;
    }
  },

  // Проверка валидности refresh токена без выброса ошибки
  isValidRefreshToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      return true;
    } catch {
      return false;
    }
  },

  // Извлечение payload без проверки подписи
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  },
};
