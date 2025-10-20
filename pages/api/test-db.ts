import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb";

type Data = {
  message: string;
  collections?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const mongoClient = await client;
    const db = mongoClient.db("md-dev-geotax");
    const collections = await db.listCollections().toArray();
    res.status(200).json({
      message: "MongoDB connected successfully!",
      collections: collections.map(c => c.name),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to connect to MongoDB",
      error: error.message,
    });
  }
}