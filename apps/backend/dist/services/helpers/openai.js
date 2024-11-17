"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OpenAIHelper", {
    enumerable: true,
    get: function() {
        return OpenAIHelper;
    }
});
const _config = require("../../config");
const _openai = /*#__PURE__*/ _interop_require_default(require("openai"));
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let OpenAIHelper = class OpenAIHelper {
    constructor(_openai1){
        _define_property(this, "_openai", void 0);
        _define_property(this, "openai", void 0);
        _define_property(this, "createOpenAIInstance", void 0);
        _define_property(this, "askChatGPTAboutImage", void 0);
        _define_property(this, "getResponseJSONString", void 0);
        _define_property(this, "cleanChatGPTJSONString", void 0);
        _define_property(this, "parseChatGPTJSONString", void 0);
        this._openai = _openai1;
        this.createOpenAIInstance = ()=>new _openai.default({
                apiKey: _config.OPENAI_API_KEY,
                dangerouslyAllowBrowser: true
            });
        this.askChatGPTAboutImage = async ({ base64Image, maxTokens = 350, prompt })=>this.openai.chat.completions.create({
                model: 'gpt-4o',
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ]
            });
        this.getResponseJSONString = (response)=>response.choices[0].message.content;
        this.cleanChatGPTJSONString = (jsonString)=>jsonString.replace('```json', '').replace('```', '');
        this.parseChatGPTJSONString = (jsonString)=>{
            if (!jsonString) {
                return;
            }
            const content = this.cleanChatGPTJSONString(jsonString);
            if (content) {
                try {
                    const parsed = JSON.parse(content);
                    return parsed;
                } catch (e) {
                    console.error('Failing parsing Chat GPT response:', e);
                }
            }
        };
        if (_openai1) {
            this.openai = _openai1;
        } else {
            this.openai = this.createOpenAIInstance();
        }
    }
};

//# sourceMappingURL=openai.js.map