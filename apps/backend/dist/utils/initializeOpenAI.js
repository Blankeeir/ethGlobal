"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "initializeOpenAI", {
    enumerable: true,
    get: function() {
        return initializeOpenAI;
    }
});
const _helpers = require("../services/helpers");
const initializeOpenAI = ()=>{
    return new _helpers.OpenAIHelper();
};

//# sourceMappingURL=initializeOpenAI.js.map