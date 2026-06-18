import { createAPIRequests } from "../factory";

export const authAPI = createAPIRequests({
  namespace: "auth",
  requests: {
    login: (email: string, password: string) => ({
      keys: ["auth:login"],
      method: "POST",
      endpoint: "/auth/login",
      payload: {
        email,
        password,
      },
    }),

    register: (name: string, email: string, password: string) => ({
      keys: ["auth:register"],
      method: "POST",
      endpoint: "/auth/register",
      payload: {
        name,
        email,
        password,
      },
    }),

    me: () => ({
      keys: ["auth:me"],
      method: "GET",
      endpoint: "/auth/me",
    }),

    logout: () => ({
      keys: ["auth:logout"],
      method: "POST",
      endpoint: "/auth/logout",
    }),
  },
});

authAPI.login("test@test.com", "password");
