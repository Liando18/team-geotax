import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../../lib/mongodb";

type Data = {
    message: string;
    id?: string;
    user?: any[];
    error?: string;
}

export default async (req:NextApiRequest, res:NextApiResponse) => {
    try {
        const mongoClient = await client;
        const db = mongoClient.db("md-dev-geotax");
        const collection = db.collection("user");

        if (req.method == "POST") {
            const {username, password, name} = req.body
            const result = await collection.insertOne({username, password, name})

            res.status(201).json({
                message: "User saved", 
                id: result.insertedId.toString()
            })
        } else if (req.method == "GET") {
            const data = await collection.find({}).toArray()

            res.status(200).json({
                message: "Fetched User", 
                user: data
            })
        } else {
            res.status(405).json({ message: "Method not allowed" });
        }
    } catch (error: any) {
        res.status(500).json({ message: "MongoDB error", error: error.message });
    }
}