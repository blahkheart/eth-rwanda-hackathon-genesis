import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "~~/utils/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("eth-rwanda-hackathon");
    const collection = db.collection("hackers-checkin");

    await collection.insertOne({
      email,
      inperson: false,
      checkedInAt: new Date(),
    });
    console.log("Checked in online successfully");
    res.status(200).json({ message: "Checked in online successfully" });
  } catch (error) {
    console.error("Error during online check-in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
