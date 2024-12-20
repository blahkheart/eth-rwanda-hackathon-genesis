import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const dev = "0xd443188B33a13A24F63AC3A49d54DB97cf64349A";
  const salt = process.env.SALT;

  if (!salt) {
    throw new Error("Missing SALT in .env");
  }

  await deploy("ETHRwandaHackathonOnboard", {
    from: deployer,
    // Contract constructor arguments
    args: [salt],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const ethRwandaHackathonGenesisRegistry = await hre.ethers.getContract<Contract>(
    "ETHRwandaHackathonOnboard",
    deployer,
  );
  const tx = await ethRwandaHackathonGenesisRegistry.transferOwnership(dev);
  console.log("👋 Transferred ETH Rwanda Registry Ownership:", tx.hash);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["ETHRwandaHackathonOnboard"];
