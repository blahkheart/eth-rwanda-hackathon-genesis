const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

async function fetchHackersData() {
  try {
    const response = await fetch("https://hackathon.ethrwanda.rw/api/hackers");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const hackers = await response.json();

    const extractedData = hackers.map(hacker => ({
      hackerAddress: hacker.ethereumAddress,
      name: hacker.name,
      email: hacker.email,
      phone: hacker.phone,
      lockAddress: hacker.nftAddress,
    }));

    const filePath = path.join(__dirname, "hackersData.json");
    fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2), "utf8");
    console.log("Hacker data successfully saved to hackersData.json");
  } catch (error) {
    console.error("Error fetching or saving hacker data:", error);
  }
}

fetchHackersData();
