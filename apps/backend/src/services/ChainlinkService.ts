// src/services/ChainlinkService.ts
import { Contract } from 'ethers';
import ChainlinkAutomationABI from '../abi/ChainlinkAutomation.json';

export class ChainlinkService {
  private automationContract: Contract;

  constructor(provider: ethers.providers.Provider) {
    this.automationContract = new Contract(
      process.env.CHAINLINK_AUTOMATION_ADDRESS!,
      ChainlinkAutomationABI,
      provider
    );
  }

  async registerUpkeep(
    name: string,
    encryptedEmail: string,
    upkeepContract: string,
    gasLimit: number,
    adminAddress: string,
    checkData: string,
    amount: ethers.BigNumber,
    source: number
  ) {
    try {
      const tx = await this.automationContract.registerUpkeep(
        name,
        encryptedEmail,
        upkeepContract,
        gasLimit,
        adminAddress,
        checkData,
        amount,
        source
      );
      return await tx.wait();
    } catch (error) {
      console.error('Chainlink automation error:', error);
      throw error;
    }
  }
}
