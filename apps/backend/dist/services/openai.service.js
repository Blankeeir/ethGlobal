"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OpenaiService", {
    enumerable: true,
    get: function() {
        return OpenaiService;
    }
});
const _HttpException = require("../exceptions/HttpException");
const _server = require("../server");
const _data = require("../utils/data");
const _typedi = require("typedi");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let OpenaiService = class OpenaiService {
    async validateImage(image) {
        if (!(0, _data.isBase64Image)(image)) throw new _HttpException.HttpException(400, 'Invalid image format');
        const prompt = `
                    Analyze the image provided. The image MUST satisfy all of the following criteria:
                        1. It must have as subject a receipt of purchase of at least one product.
                        2. It must not be a screenshot.
                        3. It must include the date of the purchase.
                        4. It must include the name of the store where the purchase was made.
                    Please respond always and uniquely with the following JSON object as you are REST API that returns the following object:
                    {
                    "validityFactor": {validityFactorNumber}, // 0-1, 1 if it satisfies all the criteria, 0 otherwise
                    "descriptionOfAnalysis": "{analysis}", // indicate your analysis of the image and why it satisfies or not the criteria. The analysis will be shown to the user so make him understand why the image doesn't satisfy the criteria if it doesn't without going into detail on exact criteria. Remember we are rewarding users that drink coffee in a sustainable way.
                    }
                    `;
        const gptResponse = await _server.openAIHelper.askChatGPTAboutImage({
            base64Image: image,
            prompt
        });
        const responseJSONStr = _server.openAIHelper.getResponseJSONString(gptResponse);
        return _server.openAIHelper.parseChatGPTJSONString(responseJSONStr);
    }
};
OpenaiService = _ts_decorate([
    (0, _typedi.Service)()
], OpenaiService);

//# sourceMappingURL=openai.service.js.map