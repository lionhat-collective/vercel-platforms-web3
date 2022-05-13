import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { SiweMessage } from "siwe";
import { getDefaultProvider } from 'ethers'
import { getCsrfToken } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { findOrCreateUser } from "@/lib/api/user";
import prisma from '@/lib/prisma'
import { PrismaAdapter } from "@next-auth/prisma-adapter";

if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is not set");
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        }
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!)
          if (siwe.domain !== nextAuthUrl.host) {
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }

          await siwe.validate(credentials?.signature || "")
          const ensAddress = await getDefaultProvider().lookupAddress(siwe.address)
          const avatar = await getDefaultProvider().getAvatar(ensAddress || siwe.address)
          const user = await findOrCreateUser(siwe.address, avatar, ensAddress)
          return {
            id: user.id,
            image: user.image,
            ensAddress: user.ensAddress,
          }
        } catch (e) {
          console.error(e)
          return null
        }
      },
    }),
  ]

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin")

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, {
    providers,
    secret: process.env.SECRET,
    session: {
      strategy: 'jwt',
    },
    adapter: PrismaAdapter(prisma),
    pages: {
      signIn: `/login`,
      verifyRequest: `/login`,
      error: "/login", // Error code passed in query string as ?error=
    },
    callbacks: {
      session: ({ session, token, user }) => {
        session.user.id = token.sub
        session.user.ensAddress = token.ensAddress ?? token.sub
        session.user.image = token.picture
        return session
      },
      jwt: ({ token, user }) => {
        if (user) {
          return {
            ...token,
            id: user.id,
            ensAddress: user.ensAddress,
            picture: user.image,
          }
        }
        return token
      }
    },
  })
}
