import NextAuth from "next-auth";
import { JWT } from 'next-auth/jwt'

declare module "next-auth" {
  interface Session {
    user: {

      /**
       * The user's unique id number
       */
      id?: string | null;

      /**
       * The users preferred avatar.
       * Usually provided by the user's OAuth provider of choice
       */
      image?: string | null;

      /**
       * The user's custom & public username viewable to others
       */
      ensAddress?: string | null;
    };
  }

  interface User {
    /**
     * The user's unique id number
     */
    id: string;

    /**
     * The users preferred avatar.
     * Usually provided by the user's OAuth provider of choice
     */
    image?: string | null;

    ensAddress?: string | null;
  }
}

declare module "next-auth/jwt" {

  interface JWT {
    /**
     * The user's unique id number
     */
    id?: string | null;

    /**
    * The users preferred avatar.
    * Usually provided by the user's OAuth provider of choice
    */
    image?: string | null;

    /**
    * The user's custom & public username viewable to others
    */
    ensAddress?: string | null;
  }
}