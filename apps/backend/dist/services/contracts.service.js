"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ContractsService", {
    enumerable: true,
    get: function() {
        return ContractsService;
    }
});
const _HttpException = require("../exceptions/HttpException");
const _thor = require("../utils/thor");
const _typedi = require("typedi");
const _nodeconsole = _interop_require_wildcard(require("node:console"));
const _sdkcore = require("@vechain/sdk-core");
const _config = require("../config");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ContractsService = class ContractsService {
    async registerSubmission(submission) {
        let isSuccess = false;
        try {
            const result = await (await _thor.servareContract.transact.registerValidSubmission(submission.address, _sdkcore.unitsUtils.parseUnits(_config.REWARD_AMOUNT, 'ether'))).wait();
            isSuccess = !result.reverted;
        } catch (error) {
            _nodeconsole.log('Error', error);
        }
        return isSuccess;
    }
    async validateSubmission(submission) {
        const isMaxSubmissionsReached = (await _thor.servareContract.read.isUserMaxSubmissionsReached(submission.address))[0];
        if (Boolean(isMaxSubmissionsReached) === true) throw new _HttpException.HttpException(409, `EcoEarn: Max submissions reached for this cycle`);
    }
};
ContractsService = _ts_decorate([
    (0, _typedi.Service)()
], ContractsService);

//# sourceMappingURL=contracts.service.js.map