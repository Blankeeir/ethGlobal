
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

import '@nomiclabs/hardhat-truffle5';
import '@vechain/sdk-hardhat-plugin';

require('dotenv').config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true, // Enable IR-based code generation
        },
      },
      networks: {
        vechain_testnet: {
          url: "https://testnet.vechain.org",
          accounts: {
            mnemonic: process.env.MNEMONIC ?? '',
            count: 1,
            path: "m/44'/818'/0'/0",
        },
          gas: 21000,
        },
        vechain_mainnet: {
          url: "https://mainnet.veblocks.net",
          chainId: 39,
          accounts: {
            mnemonic: process.env.MNEMONIC ?? '',
            count: 1,
            path: "m/44'/818'/0'/0",
        },
        },
      },
};

export default config;
