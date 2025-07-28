import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { api_Google_url, api_Login_url } from "@/lib/apiEnd_Point_Call";
import { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    accessToken?: string;
  }
  
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
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
            if(!credentials){
                throw new Error("Credentials not found");
            }
            
            const response = await axios.post(api_Login_url, credentials);
            console.log(response.data)

            if (!response) throw new Error("Login failed");
            
            const data = await response.data.userData;
            return {
              id: data.id,
              email: data.email,
              name: data.name,
              accessToken: data.accessToken
            };
          } catch (error) {
            console.error("Authorization error:", error);
            return null;
          }
        }
      }),
      
    ],
  
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.accessToken = user.accessToken;
        }
        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken;
        return session;
      }
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
    session: {
      strategy: "jwt",
      maxAge: SESSION_DURATION,
    },
  
    jwt: {
      secret: getEnvVar("NEXTAUTH_SECRET"),
      maxAge: SESSION_DURATION,
    },
  
    secret: getEnvVar("NEXTAUTH_SECRET"),
  }
