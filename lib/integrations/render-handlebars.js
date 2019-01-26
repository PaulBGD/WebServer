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
const fs_1 = require("fs");
const handlebars_1 = require("handlebars");
const PROD_TEMPLATES = {};
exports.default = ({ res }) => (sourceFile, data) => __awaiter(this, void 0, void 0, function* () {
    let cachedTemplate;
    if (process.env.NODE_ENV === "production" && (cachedTemplate = PROD_TEMPLATES[sourceFile])) {
        return res.send(cachedTemplate(data));
    }
    const source = yield new Promise((resolve, reject) => fs_1.readFile(sourceFile, "utf8", (err, file) => (err ? reject(err) : resolve(file))));
    const compiled = handlebars_1.compile(source);
    if (process.env.NODE_ENV === "production") {
        PROD_TEMPLATES[sourceFile] = compiled;
    }
    return res.send(compiled(data));
});
//# sourceMappingURL=render-handlebars.js.map