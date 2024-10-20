import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import deployedContracts from "~~/contracts/deployedContracts";
import { isValidEmail, isValidEthereumAddress, isValidPhoneNumber } from "~~/utils/helpers";
import loadEnv from "~~/utils/helpers/loadEnv";
import clientPromise from "~~/utils/mongodb";

// Load the deployed contract's ABI and address
const { privateKey, baseRpcUrl, deployedChainId } = loadEnv();
const ethRwandaRegistryAbi = (deployedContracts as any)[deployedChainId].ETHRwandaHackathonOnboard.abi;
const ethRwandaRegistryAddress = (deployedContracts as any)[deployedChainId].ETHRwandaHackathonOnboard.address;

const provider = new ethers.JsonRpcProvider(baseRpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, ethereumAddress, class: hackerClassName, classNftAddress: hackerClass } = req.body;

  if (!name || !email || !phone || !hackerClass) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Default to the zero address if ethereumAddress is empty
  const userAddress = ethereumAddress !== "" ? ethereumAddress : ethers.ZeroAddress;

  // Validate the provided Ethereum address
  if (!isValidEthereumAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const hackerData = {
    name,
    email,
    phone,
    ethereumAddress: userAddress,
    class: hackerClassName,
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
    console.log("receipt", receipt);
    // Respond with the transaction hash and the id
    res.status(200).json({
      message: `Registration successful with transaction hash: ${receipt.hash}`,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.log("ERR::REGISTERING HACKER ONCHAIN::", error);
    try {
      // save to mongodb
      const client = await clientPromise;
      const db = client.db("eth-rwanda-hackathon");
      const collection = db.collection("registrations");

      const result = await collection.insertOne({
        ...hackerData,
        createdAt: new Date(),
      });

      // Respond with the id
      res.status(201).json({
        message: `Onchain profile pending, registration saved successfully with id: ${result.insertedId}`,
        id: result.insertedId,
      });
    } catch (dbError) {
      // Respond with a database error
      res.status(500).json({ error: `Database Error: ${(dbError as Error).message}` });
    }
  }
}
