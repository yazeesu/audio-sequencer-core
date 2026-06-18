import { axiosInstance } from "../../base";
import { defineAPIContract, defineRequest } from "../../lib";
import { loginResponseSchema, userResponseSchema } from "./schemas";

export const [authContract, authCaller] = defineAPIContract(
  "auth",
  {
    login: (email: string, password: string) =>
      defineRequest(
        "/auth/login",
        {
          key: ["auth:login"],
          responseSchema: loginResponseSchema,
        },
        async ({ axios, path, config }) =>
          axios.post(path, { email, password }, config),
      ),

    register: (
      name: string,
      email: string,
      password: string,
      password_confirmation: string,
    ) =>
      defineRequest(
        "/auth/register",
        {
          key: ["auth:register"],
          responseSchema: loginResponseSchema,
        },
        async ({ axios, path, config }) =>
          axios.post(
            path,
            { name, email, password, password_confirmation },
            config,
          ),
      ),

    me: () =>
      defineRequest(
        "/auth/me",
        {
          key: ["auth:me"],
          responseSchema: userResponseSchema,
        },
        async ({ axios, path, config }) => axios.get(path, config),
      ),
  },
  {
    axiosInstance,
    strictMode: true,
  },
);
