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
    servareContract: function() {
        return servareContract;
    },
    thor: function() {
        return thor;
    }
});
const _config = require("../config");
const _sdknetwork = require("@vechain/sdk-network");
const _configcontract = require("@repo/config-contract");
const thor = new _sdknetwork.ThorClient(new _sdknetwork.HttpClient(_config.NETWORK_URL), {
    isPollingEnabled: false
});
const servareContract = thor.contracts.load(_configcontract.config.CONTRACT_ADDRESS, _configcontract.SERVARE_SOL_ABI, new _sdknetwork.VeChainPrivateKeySigner(Buffer.from(_config.ADMIN_PRIVATE_KEY), new _sdknetwork.VeChainProvider(thor)));

//# sourceMappingURL=thor.js.map