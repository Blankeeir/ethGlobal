// scripts/deploy.ts
import { ethers, network } from 'hardhat';
import { Contract, ContractTransactionResponse } from 'ethers';
import { join } from 'path';
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function waitForConfirmation(contract: Contract) {
    // For VeChain, we wait for 12 blocks for confirmation
    await contract.deployed();
    console.log(`Contract deployed at: ${contract.address}`);
}

async function verifyRoles(
    nft: Contract,
    tracking: Contract,
    deployerAddress: string
) {
    console.log("\nVerifying roles...");
    
    try {
        // Verify NFT roles
        const producerRole = await nft.PRODUCER_ROLE();
        const verifierRole = await nft.VERIFIER_ROLE();
        const hasProducerRole = await nft.hasRole(producerRole, process.env.INITIAL_PRODUCER);
        const hasVerifierRole = await nft.hasRole(verifierRole, process.env.INITIAL_VERIFIER);

        // Verify tracking roles
        const trackerRole = await tracking.TRACKER_ROLE();
        const hasTrackerRole = await tracking.hasRole(trackerRole, process.env.INITIAL_TRACKER);

        console.log({
            producerRoleAssigned: hasProducerRole,
            verifierRoleAssigned: hasVerifierRole,
            trackerRoleAssigned: hasTrackerRole
        });

        return hasProducerRole && hasVerifierRole && hasTrackerRole;
    } catch (error) {
        console.error("Error verifying roles:", error);
        return false;
    }
}

async function deploy() {
    try {
        const [deployer] = await ethers.getSigners();
        console.log("\nDeploying contracts with account:", deployer.address);
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("Account balance:", balance.toString());

        // Deploy ServareNFT
        console.log("\nDeploying ServareNFT...");
        const ServareNFT = await ethers.getContractFactory("SurfoodNFT");
        const servareNFTDeployment = await ServareNFT.deploy();
        // await waitForConfirmation(servareNFTDeployment as Contract);
        const servareNFTAddress = (await servareNFTDeployment.deploymentTransaction()).contractAddress;
        console.log("ServareNFT deployed to:", servareNFTAddress);

        // Verify VET token address
        if (!process.env.VET_TOKEN_ADDRESS) {
            throw new Error("VET_TOKEN_ADDRESS not set in environment");
        }

        // Verify fee collector address
        const feeCollector = process.env.FEE_COLLECTOR_ADDRESS || deployer.address;

        // Deploy ServareMarketplace
        console.log("\nDeploying ServareMarketplace...");
        const ServareMarketplace = await ethers.getContractFactory("ServareMarketplace");
            servareNFTAddress,
            servareNFT.address,
            process.env.VET_TOKEN_ADDRESS,
            feeCollector
        );
        await waitForConfirmation(marketplace as Contract);
        console.log("ServareMarketplace deployed to:", marketplace.address);

        // Deploy SupplyChainTracking
        console.log("\nDeploying SupplyChainTracking...");
        const tracking = await SupplyChainTracking.deploy(servareNFTAddress);
        const tracking = await SupplyChainTracking.deploy(servareNFT.address);
        await waitForConfirmation(tracking as Contract);
        console.log("SupplyChainTracking deployed to:", tracking.address);

        // Set up roles if addresses are provided
        if (process.env.INITIAL_PRODUCER) {
            console.log("\nGranting producer role...");
            const producerRole = await servareNFT.PRODUCER_ROLE();
            await servareNFT.grantRole(producerRole, process.env.INITIAL_PRODUCER);
        }

        if (process.env.INITIAL_VERIFIER) {
            console.log("Granting verifier role...");
            const verifierRole = await servareNFT.VERIFIER_ROLE();
            await servareNFT.grantRole(verifierRole, process.env.INITIAL_VERIFIER);
        }

        if (process.env.INITIAL_TRACKER) {
            console.log("Granting tracker role...");
            const trackerRole = await tracking.TRACKER_ROLE();
            await tracking.grantRole(trackerRole, process.env.INITIAL_TRACKER);
        }

        // Verify role assignments
        const rolesVerified = await verifyRoles(servareNFT, tracking, deployer.address);
        if (!rolesVerified) {
            console.warn("Warning: Role verification failed");
        }

        // Write deployment information
        const deployment = {
            network: network.name,
            chainId: network.config.chainId,
            contracts: {
                ServareNFT: servareNFT.address,
                ServareMarketplace: marketplace.address,
                SupplyChainTracking: tracking.address
            },
            roles: {
                producer: process.env.INITIAL_PRODUCER,
                verifier: process.env.INITIAL_VERIFIER,
                tracker: process.env.INITIAL_TRACKER
            },
            timestamp: new Date().toISOString(),
            deployer: deployer.address
        };

        const deploymentPath = join(__dirname, `../deployments/${network.name}.json`);
        writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
        console.log(`\nDeployment info written to: ${deploymentPath}`);

        return { servareNFT, marketplace, tracking };
    } catch (error) {
        console.error("Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    deploy()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export default deploy;