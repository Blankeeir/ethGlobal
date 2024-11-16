// scripts/deploy.ts
import { ethers, run, network } from "hardhat";
import { Contract } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
  console.log("Starting deployment...");
  console.log("Network:", network.name);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const initialBalance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(initialBalance));

  // Helper function for verification 
  async function verify(contract: Contract, args: any[]) {
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Verifying contract...");
      try {
        await run("verify:verify", {
          address: contract.address,
          constructorArguments: args,
        });
      } catch (err) {
        console.log("Verification error:", err);
      }
    }
  }

  try {
    // 1. Deploy MentalHealthIdentity
    console.log("\nDeploying MentalHealthIdentity...");
    const MentalHealthIdentity = await ethers.getContractFactory("MentalHealthIdentity");
    const requiredEnvVars = [
      "WORLD_ID_ADDRESS",
      "WORLD_ID_APP_ID",
      "WORLD_ID_ACTION_ID",
      "WORLD_ID_GROUP_ID",
      "ENS_REGISTRY_ADDRESS",
      "ENS_RESOLVER_ADDRESS",
      "HYPERLANE_MAILBOX_ADDRESS",
      "LAYER_ZERO_ENDPOINT",
      "HYPERLANE_IGP_ADDRESS",
      "FILECOIN_STORAGE_ADDRESS"
    ];

    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} is not defined`);
      }
    }

    const identityArgs: [string, string, string, string, string, string, string] = [
      process.env.WORLD_ID_ADDRESS!,
      process.env.WORLD_ID_APP_ID!,
      process.env.WORLD_ID_ACTION_ID!,
      process.env.WORLD_ID_GROUP_ID!,
      process.env.ENS_REGISTRY_ADDRESS!,
      process.env.ENS_RESOLVER_ADDRESS!,
      process.env.HYPERLANE_MAILBOX_ADDRESS!
    ];
    const identity = await MentalHealthIdentity.deploy(...identityArgs);
    await identity.deployed();
    console.log("MentalHealthIdentity deployed to:", identity.address);
    await verify(identity, identityArgs);

    // 2. Deploy BuddyVerification
    console.log("\nDeploying BuddyVerification...");
    const BuddyVerification = await ethers.getContractFactory("BuddyVerification");
    const buddyArgs: [string] = [process.env.ENS_RESOLVER_ADDRESS!];
    const buddy = await BuddyVerification.deploy(...buddyArgs);
    await buddy.deployed();
    console.log("BuddyVerification deployed to:", buddy.address);
    await verify(buddy, buddyArgs);

    // 3. Deploy MentalHealthEvents
    console.log("\nDeploying MentalHealthEvents...");
    const MentalHealthEvents = await ethers.getContractFactory("MentalHealthEvents");
    const eventsArgs: [string] = [identity.address];
    const events = await MentalHealthEvents.deploy(...eventsArgs);
    await events.deployed();
    console.log("MentalHealthEvents deployed to:", events.address);
    await verify(events, eventsArgs);

    // 4. Deploy CrossChainChat
    console.log("\nDeploying CrossChainChat...");
    const CrossChainChat = await ethers.getContractFactory("CrossChainChat");
    const chatArgs: [string, string, string, string] = [
      process.env.LAYER_ZERO_ENDPOINT!,
      process.env.HYPERLANE_MAILBOX_ADDRESS!,
      process.env.HYPERLANE_IGP_ADDRESS!,
      process.env.FILECOIN_STORAGE_ADDRESS!
    ];
    const chat = await CrossChainChat.deploy(...chatArgs);
    await chat.deployed();
    console.log("CrossChainChat deployed to:", chat.address);
    await verify(chat, chatArgs);

    // Log deployment addresses
    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log("MentalHealthIdentity:", identity.address);
    console.log("BuddyVerification:", buddy.address);
    console.log("MentalHealthEvents:", events.address);
    console.log("CrossChainChat:", chat.address);

    // Calculate gas used
    const finalBalance = await deployer.getBalance();
    const gasUsed = initialBalance.sub(finalBalance);
    console.log("\nTotal gas used:", ethers.utils.formatEther(gasUsed), "ETH");

    // Save deployment addresses
    const fs = require('fs');
    const deployments = {
      network: network.name,
      MentalHealthIdentity: identity.address,
      BuddyVerification: buddy.address,
      MentalHealthEvents: events.address,
      CrossChainChat: chat.address,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      `deployments/${network.name}.json`,
      JSON.stringify(deployments, null, 2)
    );

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});