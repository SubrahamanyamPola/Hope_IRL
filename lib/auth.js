import NextAuthImport from "next-auth";
import GoogleImport from "next-auth/providers/google";
import CredentialsImport from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Normalize ESM/CommonJS default exports (prevents "is not a function")
const NextAuth = NextAuthImport?.default ?? NextAuthImport;
const Google = GoogleImport?.default ?? GoogleImport;
const CredentialsProvider = CredentialsImport?.default ?? CredentialsImport;

const hasGoogle =
  typeof process.env.GOOGLE_CLIENT_ID === "string" &&
  typeof process.env.GOOGLE_CLIENT_SECRET === "string" &&
  process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
  process.env.GOOGLE_CLIENT_SECRET.trim().length > 0;

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    ...(hasGoogle
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;

      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user?.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: user.email.toLowerCase() },
        });
      }
    },
  },
};

// Use normalized NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
