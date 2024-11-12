// scripts/verify.ts
import { run } from "hardhat";
const deploymentInfo = require("../deployment.mainnet.json");

async function main() {
  await run("verify:verify", {
    address: deploymentInfo.nft,
    constructorArguments: []
  });

  await run("verify:verify", {
    address: deploymentInfo.marketplace,
    constructorArguments: [
      deploymentInfo.nft,
      process.env.VET_TOKEN_ADDRESS,
      process.env.FEE_COLLECTOR_ADDRESS
    ]
  });

  await run("verify:verify", {
    address: deploymentInfo.tracking,
    constructorArguments: [deploymentInfo.nft]
  });
}

main().catch(console.error);