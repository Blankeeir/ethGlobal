"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isBase64Image", {
    enumerable: true,
    get: function() {
        return isBase64Image;
    }
});
const _classvalidator = require("class-validator");
const isBase64Image = (image)=>{
    const regex = /^data:image\/[a-z]+;base64,/;
    return regex.test(image) && (0, _classvalidator.isBase64)(image.split(',')[1]);
};

//# sourceMappingURL=data.js.map