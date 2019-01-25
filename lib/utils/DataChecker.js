"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class DataTypeError extends Error {
    constructor(typeName, message) {
        super(message);
        this.typeName = typeName;
        this.name = "DataTypeError";
    }
}
exports.DataTypeError = DataTypeError;
exports.StringType = (opts) => (name, data) => {
    if (opts.required && !data) {
        throw new DataTypeError(name, "not provided");
    }
    if (!opts.required && !data) {
        return null;
    }
    if (typeof data !== "string") {
        throw new DataTypeError(name, "not string");
    }
    if (opts.trimmed) {
        data = data.trim();
    }
    if (typeof opts.minLength === "number" && data.length < opts.minLength) {
        throw new DataTypeError(name, `shorter than ${opts.minLength} characters`);
    }
    if (typeof opts.maxLength === "number" && data.length > opts.maxLength) {
        throw new DataTypeError(name, `longer than ${opts.maxLength} characters`);
    }
    if (opts.regex && !opts.regex.test(data)) {
        throw new DataTypeError(name, `invalid format`);
    }
    return data;
};
function getChecked(type, name, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let returned = type(name, data);
        if (returned.then) {
            returned = yield returned;
        }
        return returned;
    });
}
function check(obj, checker) {
    return __awaiter(this, void 0, void 0, function* () {
        // todo figure out how we're actually supposed to use `in keyof`
        const map = {};
        for (const key in checker) {
            map[key] = yield getChecked(checker[key], key, obj[key]);
        }
        return map;
    });
}
exports.check = check;
//# sourceMappingURL=DataChecker.js.map