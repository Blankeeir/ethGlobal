"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubmissionDto", {
    enumerable: true,
    get: function() {
        return SubmissionDto;
    }
});
const _classvalidator = require("class-validator");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SubmissionDto = class SubmissionDto {
    constructor(){
        _define_property(this, "name", void 0);
        _define_property(this, "description", void 0);
        _define_property(this, "quantity", void 0);
        _define_property(this, "location", void 0);
        _define_property(this, "expiryDate", void 0);
        _define_property(this, "productionDate", void 0);
        _define_property(this, "category", void 0);
        _define_property(this, "price", void 0);
        _define_property(this, "imageUri", void 0);
        _define_property(this, "metadata", void 0);
    }
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SubmissionDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SubmissionDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], SubmissionDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SubmissionDto.prototype, "location", void 0);
_ts_decorate([
    (0, _classvalidator.IsDate)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], SubmissionDto.prototype, "expiryDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsDate)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], SubmissionDto.prototype, "productionDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SubmissionDto.prototype, "category", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], SubmissionDto.prototype, "price", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], SubmissionDto.prototype, "imageUri", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], SubmissionDto.prototype, "metadata", void 0);

//# sourceMappingURL=submission.dto.js.map