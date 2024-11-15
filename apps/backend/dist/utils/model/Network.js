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
    Network: function() {
        return Network;
    },
    toNetwork: function() {
        return toNetwork;
    }
});
var Network;
(function(Network) {
    Network["solo"] = "solo";
    Network["testnet"] = "testnet";
    Network["mainnet"] = "mainnet";
})(Network || (Network = {}));
const toNetwork = (network)=>{
    switch(network){
        case 'solo':
            return "solo";
        case 'testnet':
            return "testnet";
        case 'mainnet':
            return "mainnet";
        default:
            throw new Error(`Unknown network: ${network}`);
    }
};

//# sourceMappingURL=Network.js.map