"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "openAIHelper", {
    enumerable: true,
    get: function() {
        return openAIHelper;
    }
});
const _app = require("./app");
const _initializeOpenAI = require("./utils/initializeOpenAI");
const _submissionroute = require("./routes/submission.route");
const openAIHelper = (0, _initializeOpenAI.initializeOpenAI)();
const app = new _app.App([
    new _submissionroute.SubmissionRoute()
]);
app.listen();

//# sourceMappingURL=server.js.map