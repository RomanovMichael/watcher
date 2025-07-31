import axios from "axios";
import crypto from "crypto";

interface VkTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface VkUser {
  id: number;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
}

export const vkService = {
  // Обмен кода авторизации на токены
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    deviceId: string
  ): Promise<VkTokens> {
    console.log("Обмен кода на токены:", { code, codeVerifier });
    console.log("Параметры запроса:", {
      client_id: process.env.VK_APP_ID,
      client_secret: process.env.VK_CLIENT_SECRET?.substring(0, 10) + "...",
      redirect_uri: process.env.VK_REDIRECT_URI,
    });

    const params = new URLSearchParams({
      client_id: process.env.VK_APP_ID!,
      client_secret: process.env.VK_CLIENT_SECRET!,
      redirect_uri: process.env.VK_REDIRECT_URI!,
      code,
      code_verifier: codeVerifier,
      device_id: deviceId,
      grant_type: "authorization_code",
    });

    const response = await axios.post("https://id.vk.com/oauth2/auth", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Ответ от VK OAuth:", response.data);
    return response.data;
  },

  // Получение информации о пользователе
  async getUserInfo(accessToken: string): Promise<VkUser> {
    console.log("Запрос к VK API с токеном:", accessToken);

    const response = await axios.get("https://api.vk.com/method/users.get", {
      params: {
        access_token: accessToken,
        v: "5.131",
        fields: "email,phone",
      },
    });

    console.log("Ответ от VK API:", response.data);

    if (!response.data.response || !response.data.response[0]) {
      throw new Error(`VK API вернул ошибку: ${JSON.stringify(response.data)}`);
    }

    const user = response.data.response[0];

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  },

  // Генерация code_challenge для PKCE
  generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(codeVerifier);
    return hash
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  },

  // Обновление VK токенов
  async refreshVkTokens(refreshToken: string): Promise<VkTokens> {
    const params = new URLSearchParams({
      client_id: process.env.VK_APP_ID!,
      client_secret: process.env.VK_CLIENT_SECRET!,
      refresh_token: refreshToken,
    });

    const response = await axios.post(
      "https://api.vk.com/oauth/access_token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  },

  // Проверка валидности VK токена
  async validateVkToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch {
      return false;
    }
  },
};
