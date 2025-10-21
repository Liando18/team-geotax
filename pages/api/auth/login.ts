import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import client from "../../../lib/mongodb";

type Data = {
  message: string;
  token?: string;
  user?: any;
  error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const mongoClient = await client;
    const db = mongoClient.db("md-dev-geotax");
    const collection = db.collection("user");

    if (req.method === "POST") {
      const { username, password, rememberDevice } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username dan password diperlukan",
          error: "Invalid input",
        });
      }

      const user = await collection.findOne({ username, password });

      if (!user) {
        return res.status(401).json({
          message: "Username atau password salah",
          error: "Unauthorized",
        });
      }

      const token = jwt.sign(
        { id: user._id.toString(), username: user.username },
        process.env.JWT_SECRET || "secret-key",
        { expiresIn: rememberDevice ? "30d" : "1d" }
      );

      res.status(200).json({
        message: "Login berhasil",
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
        },
      });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
