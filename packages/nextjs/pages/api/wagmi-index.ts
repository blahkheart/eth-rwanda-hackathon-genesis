import { NextApiRequest, NextApiResponse } from "next";
import { createWalletClient, http, isAddress, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

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
const ethRwandaRegistryAbi = (deployedContracts as any)[deployedChain].ETHRwandaHackathonGenesisRegistry.abi;
const ethRwandaRegistryAddress = (deployedContracts as any)[deployedChain].ETHRwandaHackathonGenesisRegistry.address;
const account = privateKeyToAccount(privateKey as `0x${string}`);
const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(`https://base-mainnet.infura.io/v3/${infuraApiKey}`),
});
function isValidEthereumAddress(address: string): boolean {
  return isAddress(address);
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { name, email, phone, ethereumAddress, classNftAddress: hackerClass } = req.body;
  if (!name || !email || !phone || !hackerClass) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const userAddress = ethereumAddress !== "" ? ethereumAddress : zeroAddress;
  if (!isValidEthereumAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  try {
    const tx = await client.writeContract({
      address: ethRwandaRegistryAddress,
      abi: ethRwandaRegistryAbi, // Make sure to load the ABI
      functionName: "registerHacker",
      args: [userAddress, name, email, BigInt(phone), hackerClass],
    });
    res.status(200).json({ message: "Registration successful", transactionHash: tx });
  } catch (error) {
    console.error("Error registering hacker:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
