import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prismadb from "@/lib/prismadb";

export default NextAuth({
  providers: [
    Credentials ({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },  
        passwword: {
          label: "Password",
          type: "password",
        }
      },
     async authorize(credentials) {
      if(!credentials?.email || !credentials?.passwword) {
        throw new Error("Email and password required");
      }

      const user = await prismadb.user.findUnique({
        where: {
          email: credentials.email
        }
      });

      if(!user || !user.hashedPassword) {
        throw new Error("Email does not exist");
      }

      const isCorrectPassword = await compare (
        credentials.passwword,
        user.hashedPassword
      );

      if(!isCorrectPassword) {
        throw new Error("Incorrect password");
      }

      return user;
     }
    })
  ],
  pages: {
    signIn: "/auth",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
