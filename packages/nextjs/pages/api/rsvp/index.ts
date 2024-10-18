// import { NextApiRequest, NextApiResponse } from "next";
// import { createWalletClient, http, isAddress, zeroAddress } from "viem";
// import { privateKeyToAccount } from "viem/accounts";
// import { mainnet } from "viem/chains";
// import deployedContracts from "~~/contracts/deployedContracts";
// const privateKey = process.env.PRIVATE_KEY;
// const infuraApiKey = process.env.INFURA_API_KEY;
// const deployedChain = 8453;
// if (!privateKey) {
//   throw new Error("Missing environment variable PRIVATE_KEY");
// }
// if (!infuraApiKey) {
//   throw new Error("Missing environment variable INFURA_API_KEY");
// }
// if (!deployedChain) {
//   throw new Error("Missing environment variable DEPLOYED_CHAIN_ID");
// }
// const ethRwandaRegistryAbi = deployedContracts[deployedChain].ETHRwandaHackathonGenesisRegistry.abi;
// const ethRwandaRegistryAddress = deployedContracts[deployedChain].ETHRwandaHackathonGenesisRegistry.address;
// const account = privateKeyToAccount(privateKey);
// const client = createWalletClient({
//   account,
//   chain: mainnet,
//   transport: http(`https://base-mainnet.infura.io/v3/${infuraApiKey}`),
// });
// function isValidEthereumAddress(address: string): boolean {
//   return isAddress(address);
// }
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }
//   const { name, email, phone, ethereumAddress, classNftAddress: hackerClass } = req.body;
//   if (!name || !email || !phone || !hackerClass) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }
//   const userAddress = ethereumAddress !== "" ? ethereumAddress : zeroAddress;
//   if (!isValidEthereumAddress(userAddress)) {
//     return res.status(400).json({ error: "Invalid Ethereum address" });
//   }
//   try {
//     const tx = await client.writeContract({
//       address: ethRwandaRegistryAddress,
//       abi: ethRwandaRegistryAbi, // Make sure to load the ABI
//       functionName: "registerHacker",
//       args: [userAddress, name, email, BigInt(phone), hackerClass],
//     });
//     res.status(200).json({ message: "Registration successful", transactionHash: tx });
//   } catch (error) {
//     console.error("Error registering hacker:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }
import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import deployedContracts from "~~/contracts/deployedContracts";
import { appendHackerDataToFile } from "~~/utils/scaffold-eth/appendHackerDataToFile";

// Load environment variables
const privateKey = process.env.PRIVATE_KEY;
const infuraApiKey = process.env.INFURA_API_KEY;
const deployedChain = 8453;

if (!privateKey) {
  throw new Error("Missing environment variable PRIVATE_KEY");
}
if (!infuraApiKey) {
  throw new Error("Missing environment variable INFURA_API_KEY");
}
if (!deployedChain) {
  throw new Error("Missing environment variable DEPLOYED_CHAIN_ID");
}

// Load the deployed contract's ABI and address
const ethRwandaRegistryAbi = deployedContracts[deployedChain].ETHRwandaHackathonGenesisRegistry.abi;
const ethRwandaRegistryAddress = deployedContracts[deployedChain].ETHRwandaHackathonGenesisRegistry.address;

// Create a provider and wallet
const provider = new ethers.JsonRpcProvider(`https://base-mainnet.infura.io/v3/${infuraApiKey}`);
const wallet = new ethers.Wallet(privateKey, provider);

// Utility function to validate Ethereum addresses
function isValidEthereumAddress(address: string): boolean {
  try {
    ethers.getAddress(address); // Automatically throws if the address is invalid
    return true;
  } catch (error) {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, ethereumAddress, classNftAddress: hackerClass } = req.body;

  if (!name || !email || !phone || !hackerClass) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Default to the zero address if ethereumAddress is empty
  const userAddress = ethereumAddress !== "" ? ethereumAddress : ethers.ZeroAddress;

  // Validate the provided Ethereum address
  if (!isValidEthereumAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  const hackerData = {
    name,
    email,
    phone,
    ethereumAddress: userAddress,
    class: hackerClass,
    nftAddress: hackerClass,
    isNftMinted: false,
  };
  try {
    // Create a contract instance with the ABI, address, and wallet
    const ethRwandaRegistry = new ethers.Contract(ethRwandaRegistryAddress, ethRwandaRegistryAbi, wallet);

    // Convert phone number to BigInt
    const phoneBigInt = BigInt(phone);

    // Send the transaction
    const txResponse = await ethRwandaRegistry.registerHacker(userAddress, name, email, phoneBigInt, hackerClass);

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();
    appendHackerDataToFile(hackerData);
    // Respond with the transaction hash
    res.status(200).json({ message: "Registration successful", transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("Error registering hacker:", error);
    const isSuccess = appendHackerDataToFile(hackerData);
    if (!isSuccess) {
      res
        .status(201)
        .json({ message: "Registration successful. But failed to mint NFT, please contact the organizers" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
