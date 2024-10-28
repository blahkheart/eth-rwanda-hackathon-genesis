const fs = require("fs");
const { ethers } = require("ethers");
const loadEnv = require("./loadEnv");
const deployedContracts = require("../../contracts/deployedContracts");
// Load the JSON data
const data = JSON.parse(fs.readFileSync("./unregisteredHackers.json", "utf8"));
const zeroAddress = "0x0000000000000000000000000000000000000000";
const { privateKey, baseRpcUrl, deployedChainId } = loadEnv();

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(baseRpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Load the contract
const contractAddress = deployedContracts[deployedChainId].ETHRwandaHackathonOnboard.address;
const contractAbi = deployedContracts[deployedChainId].ETHRwandaHackathonOnboard.abi;
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

// Function to batch register hackers
async function batchRegisterHackers() {
  const newHackerAddresses = [];
  const newNames = [];
  const newEmails = [];
  const newNumbers = [];
  const newLockAddresses = [];

  for (let i = 0; i < data.length; i++) {
    const hacker = data[i];
    const isRegistered = await contract.getIsNumberRegistered(hacker.phone);

    if (!isRegistered) {
      newHackerAddresses.push(zeroAddress);
      newNames.push(hacker.name);
      newEmails.push(hacker.email);
      newNumbers.push(BigInt(hacker.phone));
      newLockAddresses.push(hacker.lockAddress !== zeroAddress ? hacker.lockAddress : zeroAddress);
    }
  }

  if (newHackerAddresses.length > 0) {
    try {
      const tx = await contract.batchRegisterHackers(
        newHackerAddresses,
        newNames,
        newEmails,
        newNumbers,
        newLockAddresses,
      );
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
    } catch (error) {
      console.error("Error registering hackers:", error);
    }
  } else {
    console.log("No new registrations to process.");
  }
}

// Execute the function
batchRegisterHackers();
