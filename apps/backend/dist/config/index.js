"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ADMIN_ADDRESS: function() {
        return ADMIN_ADDRESS;
    },
    ADMIN_MNEMONIC: function() {
        return ADMIN_MNEMONIC;
    },
    CREDENTIALS: function() {
        return CREDENTIALS;
    },
    LOG_DIR: function() {
        return LOG_DIR;
    },
    LOG_FORMAT: function() {
        return LOG_FORMAT;
    },
    MAX_FILE_SIZE: function() {
        return MAX_FILE_SIZE;
    },
    NETWORK_TYPE: function() {
        return NETWORK_TYPE;
    },
    NETWORK_URL: function() {
        return NETWORK_URL;
    },
    NODE_ENV: function() {
        return NODE_ENV;
    },
    OPENAI_API_KEY: function() {
        return OPENAI_API_KEY;
    },
    ORIGIN: function() {
        return ORIGIN;
    },
    PORT: function() {
        return PORT;
    },
    REWARD_AMOUNT: function() {
        return REWARD_AMOUNT;
    },
    config: function() {
        return config;
    }
});
const _dotenv = require("dotenv");
const _validateEnv = require("../utils/validateEnv");
(0, _dotenv.config)({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`
});
const validatedEnv = (0, _validateEnv.ValidateEnv)();
const CREDENTIALS = process.env.CREDENTIALS === 'true';
const { NODE_ENV, PORT, LOG_FORMAT, LOG_DIR, ORIGIN } = validatedEnv;
const { OPENAI_API_KEY } = validatedEnv;
const { MAX_FILE_SIZE } = validatedEnv;
const { ADMIN_MNEMONIC, ADMIN_ADDRESS } = validatedEnv;
const { NETWORK_URL, NETWORK_TYPE } = validatedEnv;
const { REWARD_AMOUNT } = validatedEnv;
const config = {
    vechain: {
        nodeUrl: NETWORK_URL
    },
    contracts: {
        nft: process.env.NFT_CONTRACT_ADDRESS,
        marketplace: process.env.MARKETPLACE_CONTRACT_ADDRESS,
        supplyChain: process.env.SUPPLYCHAIN_CONTRACT_ADDRESS
    }
};

//# sourceMappingURL=index.js.map