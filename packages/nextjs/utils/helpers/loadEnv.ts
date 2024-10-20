const loadEnv = () => {
  const privateKey = process.env.PRIVATE_KEY;
  const infuraApiKey = process.env.INFURA_API_KEY;
  const arbitrumSepoliaRpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const baseRpcUrl = process.env.BASE_RPC_URL;
  const deployedChainId = process.env.DEPLOYED_CHAIN_ID;

  if (!privateKey) throw new Error("Missing environment variable PRIVATE_KEY");
  if (!infuraApiKey) throw new Error("Missing environment variable INFURA_API_KEY");
  if (!arbitrumSepoliaRpcUrl) throw new Error("Missing environment variable ARBITRUM_SEPOLIA_RPC_URL");
  if (!baseRpcUrl) throw new Error("Missing environment variable BASE_RPC_URL");
  if (!deployedChainId) throw new Error("Missing environment variable DEPLOYED_CHAIN_ID");

  return { privateKey, infuraApiKey, arbitrumSepoliaRpcUrl, deployedChainId, baseRpcUrl };
};

export default loadEnv;
