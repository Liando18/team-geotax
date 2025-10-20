import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../../lib/mongodb";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";

type Data = {
  message: string;
  id?: string;
  geo?: any[];
  error?: string;
};

const GEOJSON_DIR = path.join(process.cwd(), "public/data/geojson");
const BACKUP_DIR = path.join(process.cwd(), "public/data/geojson/backup");

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

const backupFile = (filename: string) => {
  ensureBackupDir();
  const sourcePath = path.join(GEOJSON_DIR, filename);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `${filename}.backup.${timestamp}`);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, backupPath);
  }
};

const deleteGeojsonFile = (filename: string) => {
  const filePath = path.join(GEOJSON_DIR, filename);
  if (fs.existsSync(filePath)) {
    backupFile(filename);
    fs.unlinkSync(filePath);
  }
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

      if (!name || !filename || !properties) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "name, filename, properties diperlukan",
        });
      }

      if (!geojsonContent) {
        return res.status(400).json({
          message: "GeoJSON content diperlukan",
          error: "geojsonContent kosong",
        });
      }

      if (!fs.existsSync(GEOJSON_DIR)) {
        fs.mkdirSync(GEOJSON_DIR, { recursive: true });
      }

      try {
        const filePath = path.join(GEOJSON_DIR, filename);
        const fileContent =
          typeof geojsonContent === "string"
            ? geojsonContent
            : JSON.stringify(geojsonContent, null, 2);

        fs.writeFileSync(filePath, fileContent);

        const result = await collection.insertOne({
          name,
          filename,
          properties,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return res.status(201).json({
          message: "GeoJSON uploaded successfully",
          id: result.insertedId.toString(),
        });
      } catch (fileError: any) {
        return res.status(500).json({
          message: "Failed to write file",
          error: fileError.message,
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

      const record = await collection.findOne({
        _id: new ObjectId(id),
      });

      if (!record) {
        return res.status(404).json({
          message: "GeoJSON tidak ditemukan",
          error: "Record dengan ID ini tidak ada",
        });
      }

      deleteGeojsonFile(record.filename);

      const result = await collection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(500).json({
          message: "Gagal menghapus dari database",
          error: "Tidak ada record yang dihapus",
        });
      }

      return res.status(200).json({
        message: "GeoJSON deleted successfully, file di-backup",
        id: id,
      });
    } else {
      return res.status(405).json({
        message: "Method not allowed",
      });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};