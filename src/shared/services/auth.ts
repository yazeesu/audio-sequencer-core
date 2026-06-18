import NextAuth from "next-auth";
import CredentaislProvider from "next-auth/providers/credentials";
import { tryCatch } from "../utils";
import { authCaller, authContract } from "./http/api/auth/requests";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentaislProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Authorize the user with the credentials.
       * Sends HTTP request to Laravel API to login the user.
       *
       * @param credentials - The credentials provided by the user (E-mail & Password).
       * @returns - The response from Laravel if results in success, otherwise null.
       */
      async authorize(credentials) {
        const [result, error] = await tryCatch(
          authCaller.call(
            authContract.login(
              credentials!.email as string,
              credentials!.password as string,
            ),
          ),
        );

        if (error) {
          return null;
        }

        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          accessToken: result.token,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * Set the access token and id in the JWT token.
     *
     * @param token - The JWT token.
     * @param user - The user object.
     * @returns - The JWT token with the access token and id.
     */
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },

    /**
     * Set the id and access token in the session.
     * Session data can be accessed from client via `useSession` hook.
     *
     * @param session - The session object.
     * @param token - The JWT token.
     * @returns - The session object with the id and access token.
     */
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
});
