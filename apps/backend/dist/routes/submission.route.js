"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubmissionRoute", {
    enumerable: true,
    get: function() {
        return SubmissionRoute;
    }
});
const _express = require("express");
const _submissioncontroller = require("../controllers/submission.controller");
const _validationmiddleware = require("../middlewares/validation.middleware");
const _submissiondto = require("../dtos/submission.dto");
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
let SubmissionRoute = class SubmissionRoute {
    initializeRoutes() {
        this.router.post(`/submitReceipt`, (0, _validationmiddleware.ValidationMiddleware)(_submissiondto.SubmitDto), this.submission.submitReceipt);
    }
    constructor(){
        _define_property(this, "router", (0, _express.Router)());
        _define_property(this, "submission", new _submissioncontroller.SubmissionController());
        this.initializeRoutes();
    }
};

//# sourceMappingURL=submission.route.js.map