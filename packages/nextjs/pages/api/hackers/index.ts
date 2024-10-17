import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "~~/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("eth-rwanda-hackathon");
      const collection = db.collection("registrations");

      const hackers = await collection.find({}).toArray();
      return res.status(200).json(hackers);
    } catch (error) {
      console.error("Error fetching hackers:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
