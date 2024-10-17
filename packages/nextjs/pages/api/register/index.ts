import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { zeroAddress } from "viem";
import clientPromise from "~~/utils/mongodb";
import { appendHackerDataToFile } from "~~/utils/scaffold-eth/appendHackerDataToFile";

// import { JsonRpcProvider } from "ethers";
// import { hardhat } from "viem/chains";
// import deployedContracts from "~~/contracts/deployedContracts";

const privateKey = process.env.PRIVATE_KEY;
const infuraApiKey = process.env.INFURA_API_KEY;
const deployedChain = process.env.DEPLOYED_CHAIN_ID;

if (!privateKey) {
  throw new Error("Missing environment variable PRIVATE_KEY");
}
if (!infuraApiKey) {
  throw new Error("Missing environment variable INFURA_API_KEY");
}
if (!deployedChain) {
  throw new Error("Missing environment variable DEPLOYED_CHAIN_ID");
}

// const ethRwandaRegistryAbi = deployedContracts[hardhat.id].ETHRwandaHackathonGenesisRegistry.abi;
// const ethRwandaRegistryAddress = deployedContracts[hardhat.id].ETHRwandaHackathonGenesisRegistry.address;
// const provider = new JsonRpcProvider("https://arbitrum-sepolia.infura.io/v3/2NmZVGBetKuKub2qzNjBD7a7Q97");
// const wallet = new ethers.Wallet(privateKey, provider);
// const contract = new ethers.Contract(ethRwandaRegistryAddress, ethRwandaRegistryAbi, wallet);

function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, ethereumAddress, class: hackerClass, classNftAddress } = req.body;

  if (!name || !email || !phone || !hackerClass) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const userAddress = ethereumAddress !== "" ? ethereumAddress : zeroAddress;

  if (!isValidEthereumAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  const hackerData = {
    name,
    email,
    phone,
    ethereumAddress: userAddress,
    class: hackerClass,
    nftAddress: classNftAddress,
    isNftMinted: false,
  };
  try {
    const client = await clientPromise;
    const db = client.db("eth-rwanda-hackathon");
    const collection = db.collection("registrations");

    const result = await collection.insertOne({
      ...hackerData,
      createdAt: new Date(),
    });

    appendHackerDataToFile(hackerData);
    res.status(200).json({ message: "Registration successful", id: result.insertedId });
  } catch (error) {
    console.error("Error saving registration:", error);
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
