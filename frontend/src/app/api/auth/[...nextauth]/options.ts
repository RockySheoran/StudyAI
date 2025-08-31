import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { api_Google_url, api_Github_url, api_Login_url } from "@/lib/apiEnd_Point_Call";
import { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
    profile?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    profile?: string;
  }
}

// 1. Enhanced Types
interface CustomUser extends User {
  id: string;
  token?: string;
  provider?: string;
  googleId?: string;
  initialTokenTime?: number;
}

interface CustomSession extends Session {
  token?: string;
  user: CustomUser;
}

interface CustomJWT extends JWT {
  user?: CustomUser;
  initialTokenTime?: number;
  accessToken?: string;
}

// 2. Environment Variables
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

// 3. Session Duration (5 days in seconds)
const SESSION_DURATION = 5 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            throw new Error("Credentials not found");
          }

          const response = await axios.post(api_Login_url, credentials);
          console.log(response.data)

          if (response.status != 200) throw new Error(response?.data?.message);

          const data = await response.data.userData;
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            accessToken: data.accessToken,
            profile: data.profile || null
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    }),

    // Google Provider
    GoogleProvider({
      clientId: getEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: getEnvVar("GITHUB_CLIENT_ID"),
      clientSecret: getEnvVar("GITHUB_CLIENT_SECRET"),
    }),

  ],

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in - store user data in token
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.profile = user.profile;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + SESSION_DURATION;
      }

      // Validate token on each request
      if (token.iat && typeof token.iat === 'number') {
        const now = Math.floor(Date.now() / 1000);
        if (now - token.iat < SESSION_DURATION) {
          return token;
        }
      }

      // Token expired
      return { ...token, expired: true };
    },

    async session({ session, token, trigger }) {

      // Validate token exists and has required properties
      if (!token || !token.accessToken || !token.id || !token.email) {
        // Invalid token, return null session to force logout
        throw new Error("Invalid session");
      }

      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.profile = token.profile as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;

      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const response = await axios.post(api_Google_url, {
            name: user.name,
            email: user.email,
            authId: user.id,
            profile: user.image
          });
         

          if (response.data?.userData) {
            // Update user object with backend response data
            user.accessToken = response.data.userData.accessToken;
            user.id = response.data.userData.id;
            user.name = response.data.userData.name;
            user.email = response.data.userData.email;
            user.profile = response.data.userData.profile;
            return true;
          }
          return false;
        } catch (error) {
          console.error("SignIn callback error:", error);
          return `/login?error=${encodeURIComponent(
            axios.isAxiosError(error)
              ? error.response?.data?.message || error.message
              : error instanceof Error
                ? error.message
                : "Authentication failed"
          )}`;
        }
      }

      if (account?.provider === "github") {
        try {
          const response = await axios.post(api_Github_url, {
            name: user.name,
            email: user.email,
            authId: user.id,
            profile: user.image
          });

          if (response.data?.userData) {
            // Update user object with backend response data
            user.accessToken = response.data.userData.accessToken;
            user.id = response.data.userData.id;
            user.name = response.data.userData.name;
            user.email = response.data.userData.email;
            user.profile = response.data.userData.profile;
            return true;
          }
          return false;
        } catch (error) {
          console.error("SignIn callback error:", error);
          return `/login?error=${encodeURIComponent(
            axios.isAxiosError(error)
              ? error.response?.data?.message || error.message
              : error instanceof Error
                ? error.message
                : "Authentication failed"
          )}`;
        }
      }

      // For credentials provider, user data is already set in authorize function
      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_DURATION,
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  jwt: {
    secret: getEnvVar("NEXTAUTH_SECRET"),
    maxAge: SESSION_DURATION,
  },

  secret: getEnvVar("NEXTAUTH_SECRET"),
}
