"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubmissionController", {
    enumerable: true,
    get: function() {
        return SubmissionController;
    }
});
const _typedi = require("typedi");
const _openaiserviceDeprecated = require("../services/openai.service(Deprecated)");
const _HttpException = require("../exceptions/HttpException");
const _contractsservice = require("../services/contracts.service");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
let SubmissionController = class SubmissionController {
    constructor(){
        _define_property(this, "openai", _typedi.Container.get(_openaiserviceDeprecated.OpenaiService));
        _define_property(this, "contracts", _typedi.Container.get(_contractsservice.ContractsService));
        _define_property(this, "submitReceipt", async (req, res, next)=>{
            try {
                const body = req.body;
                const submissionRequest = _object_spread_props(_object_spread({}, body), {
                    timestamp: Date.now()
                });
                await this.contracts.validateSubmission(submissionRequest);
                const validationResult = await this.openai.validateImage(body.image);
                if (validationResult == undefined || !('validityFactor' in validationResult)) {
                    throw new _HttpException.HttpException(500, 'Error validating image');
                }
                const validityFactor = validationResult['validityFactor'];
                if (validityFactor > 0.5) {
                    if (!await this.contracts.registerSubmission(submissionRequest)) {
                        throw new _HttpException.HttpException(500, 'Error registering submission and sending rewards');
                    }
                }
                res.status(200).json({
                    validation: validationResult
                });
            } catch (error) {
                next(error);
                return;
            }
        });
    }
};

//# sourceMappingURL=submission.controller.js.map