import fs from "fs";
import path from "path";

const dataFilePath = "./services/store/saved/hackersData.json/";

// const dataFilePath = path.join(process.cwd(), "packages", "nextjs", "services", "store", "saved", "hackersData.json");

export const appendHackerDataToFile = (hackerData: any) => {
  let isSuccess = false;

  // Ensure the directory exists
  const directory = path.dirname(dataFilePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Read the existing data
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    let jsonData = [];

    if (err) {
      // If the error is not a file not found error, log it
      if (err.code !== "ENOENT") {
        console.error("Error reading file:", err);
        return;
      }
    } else {
      // Parse the JSON if data exists
      if (data) {
        try {
          jsonData = JSON.parse(data);
        } catch (parseErr) {
          console.error("Error parsing JSON:", parseErr);
        }
      }
    }

    // Append the new hacker data
    jsonData.push(hackerData);

    // Write the updated data back to the file
    // fs.writeFileSync(dataFilePath, JSON.stringify(jsonData), "utf8");
    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), "utf8", writeErr => {
      if (writeErr) {
        console.error("Error writing file:", writeErr);
        isSuccess = false;
      } else {
        isSuccess = true;
        console.log("Hacker data successfully appended to file.");
      }
    });
  });

  return isSuccess;
};
