import { promises as fs } from "fs";
// import path from "path";
import { HackerData } from "~~/services/store/store";

const dataFilePath = "./services/store/saved/hackersData.json";

async function loadHackersFromFile(): Promise<HackerData[] | null> {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load hackers from file:", error);
    return null;
  }
}

export default loadHackersFromFile;
