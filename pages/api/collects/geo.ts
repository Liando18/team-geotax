import { put, del } from "@vercel/blob";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

type Data = {
  message: string;
  id?: string;
  geo?: any[];
  error?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const mongoClient = await client;
    const db = mongoClient.db("md-dev-geotax");
    const collection = db.collection("geo");

    if (req.method === "POST") {
      const { name, filename, properties, geojsonContent } = req.body;

      if (!name || !filename || !properties || !geojsonContent) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "name, filename, properties, geojsonContent diperlukan",
        });
      }

      try {
        const blob = await put(
          filename,
          JSON.stringify(geojsonContent, null, 2),
          {
            access: "public",
          }
        );

        const result = await collection.insertOne({
          name,
          filename,
          properties,
          blobUrl: blob.url,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return res.status(201).json({
          message: "GeoJSON uploaded successfully",
          id: result.insertedId.toString(),
        });
      } catch (uploadError: any) {
        return res.status(500).json({
          message: "Failed to upload file",
          error: uploadError.message,
        });
      }
    } else if (req.method === "GET") {
      const data = await collection.find({}).toArray();
      return res.status(200).json({
        message: "Fetched GeoJSON",
        geo: data,
      });
    } else if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "ID diperlukan untuk delete",
          error: "id tidak ditemukan",
        });
      }

      const record = await collection.findOne({ _id: new ObjectId(id) });

      if (!record) {
        return res.status(404).json({
          message: "GeoJSON tidak ditemukan",
          error: "Record dengan ID ini tidak ada",
        });
      }

      if (record.blobUrl) {
        try {
          await del(record.blobUrl);
        } catch (deleteError) {
          console.error("Blob delete error:", deleteError);
        }
      }

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(500).json({
          message: "Gagal menghapus dari database",
          error: "Tidak ada record yang dihapus",
        });
      }

      return res.status(200).json({
        message: "GeoJSON deleted successfully",
        id: id,
      });
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
