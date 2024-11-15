"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ValidateEnv", {
    enumerable: true,
    get: function() {
        return ValidateEnv;
    }
});
const _envalid = require("envalid");
const openApiKey = (0, _envalid.makeValidator)((apiKey)=>{
    if (/^sk-proj-.{100,}$/.test(apiKey)) {
        return apiKey;
    } else {
        throw new Error('Please obtain a valid OpenAPI-Key from https://platform.openai.com/api-keys');
    }
});
const ValidateEnv = ()=>{
    return (0, _envalid.cleanEnv)(process.env, {
        NODE_ENV: (0, _envalid.str)(),
        PORT: (0, _envalid.port)({
            devDefault: 3000
        }),
        ORIGIN: (0, _envalid.str)({
            devDefault: '*'
        }),
        LOG_FORMAT: (0, _envalid.str)({
            devDefault: 'prod'
        }),
        LOG_DIR: (0, _envalid.str)({
            devDefault: '../logs'
        }),
        REWARD_AMOUNT: (0, _envalid.str)({
            devDefault: '1'
        }),
        ADMIN_MNEMONIC: (0, _envalid.str)(),
        NETWORK_URL: (0, _envalid.str)({
            devDefault: 'http://localhost:8669'
        }),
        NETWORK_TYPE: (0, _envalid.str)({
            devDefault: 'solo'
        }),
        OPENAI_API_KEY: openApiKey(),
        MAX_FILE_SIZE: (0, _envalid.str)({
            devDefault: '10mb'
        }),
        ADMIN_ADDRESS: (0, _envalid.str)({
            default: ''
        })
    });
};

//# sourceMappingURL=validateEnv.js.map