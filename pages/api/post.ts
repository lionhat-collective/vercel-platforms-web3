import { createPost, deletePost, getPost, updatePost } from "@/lib/api";
import { getSession } from "next-auth/react";

import { HttpMethod } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      return getPost(req, res, session);
    case HttpMethod.POST:
      return createPost(req, res);
    case HttpMethod.DELETE:
      return deletePost(req, res);
    case HttpMethod.PUT:
      return updatePost(req, res);
    default:
      res.setHeader("Allow", [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.DELETE,
        HttpMethod.PUT,
      ]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
