// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MentalHealthIdentity
  const MentalHealthIdentity = await ethers.getContractFactory("MentalHealthIdentity");
  const identity = await MentalHealthIdentity.deploy(
    process.env.WORLD_ID_ADDRESS!,       // WorldID contract address
    process.env.HYPERLANE_MAILBOX!,      // Hyperlane mailbox address
    process.env.ENS_REGISTRY!            // ENS registry address
  );

  await identity.deployed();

  console.log("MentalHealthIdentity deployed to:", identity.address);

  // Verify contract
  if (process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: identity.address,
      constructorArguments: [
        process.env.WORLD_ID_ADDRESS,
        process.env.HYPERLANE_MAILBOX,
        process.env.ENS_REGISTRY
      ],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });