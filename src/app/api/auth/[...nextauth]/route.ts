import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import { findUserByEmail } from "@/lib/userStore";

// --------- Lógica de bloqueo por intentos fallidos ---------
const MAX_ATTEMPTS = 5;          // número máximo de intentos
const BLOCK_MINUTES = 5;         // minutos de bloqueo

type LoginInfo = {
  attempts: number;
  blockedUntil: number | null;
};

const loginAttempts = new Map<string, LoginInfo>();

function getLoginInfo(email: string): LoginInfo {
  const current = loginAttempts.get(email);
  if (!current) {
    const init: LoginInfo = { attempts: 0, blockedUntil: null };
    loginAttempts.set(email, init);
    return init;
  }
  return current;
}
// -----------------------------------------------------------

export const authOptions: AuthOptions = {
  // Cuando NextAuth necesite página de login, usará esta ruta
  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    // Login con credenciales (email / password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son obligatorios");
        }

        const email = credentials.email;
        const password = credentials.password;

        const info = getLoginInfo(email);

        // 1. Verificar si está bloqueado
        if (info.blockedUntil && info.blockedUntil > Date.now()) {
          throw new Error(
            "Cuenta bloqueada por varios intentos fallidos. Intenta de nuevo en unos minutos."
          );
        }

        // 2. Buscar usuario
        const user = findUserByEmail(email);
        if (!user) {
          info.attempts += 1;
          if (info.attempts >= MAX_ATTEMPTS) {
            info.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000;
          }
          throw new Error("Email o contraseña incorrectos");
        }

        // 3. Comparar contraseña con bcrypt
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          info.attempts += 1;
          if (info.attempts >= MAX_ATTEMPTS) {
            info.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000;
          }
          throw new Error("Email o contraseña incorrectos");
        }

        // 4. Login correcto → reiniciar contador
        info.attempts = 0;
        info.blockedUntil = null;

        // 5. Devolver el usuario (mínimo id, name, email)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    // Guardar el id en el token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },

    // Mandar el id al cliente
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
