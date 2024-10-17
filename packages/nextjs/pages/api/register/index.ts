import ethers from "ethers";
import { JsonRpcProvider } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { zeroAddress } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";


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

const ethRwandaRegistryAbi = deployedContracts[hardhat.id].ETHRwandaHackathonGenesisRegistry.abi;
const ethRwandaRegistryAddress = deployedContracts[hardhat.id].ETHRwandaHackathonGenesisRegistry.address;
const provider = new JsonRpcProvider("https://arbitrum-sepolia.infura.io/v3/2NmZVGBetKuKub2qzNjBD7a7Q97");
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(ethRwandaRegistryAddress, ethRwandaRegistryAbi, wallet);

function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, ethereumAddress, class: lockAddress } = req.body;

  if (!name || !email || !phone || !ethereumAddress || !lockAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const userAddress = ethereumAddress !== "" ? ethereumAddress : zeroAddress;

  if (!isValidEthereumAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  try {
    const tx = await contract.registerHacker({
      args: [userAddress, name, email, parseInt(phone), lockAddress],
    });
    const receipt = await tx.wait();

    res.status(200).json({ message: "Registration successful", transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("Error registering hacker:", error);
    res.status(500).json({ error: "Registration successful but NFT request is pending" });
  }
}