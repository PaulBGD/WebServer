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
const WebServer_1 = require("../WebServer");
const fs_1 = require("fs");
const handlebars_1 = require("handlebars");
class HandlebarsComponent extends WebServer_1.Component {
    renderFile(sourceFile, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV === "production" && HandlebarsComponent.compiled[sourceFile]) {
                return this.res.send(HandlebarsComponent.compiled[sourceFile](data));
            }
            const source = yield new Promise((resolve, reject) => fs_1.readFile(sourceFile, "utf8", (err, file) => (err ? reject(err) : resolve(file))));
            const compiled = (HandlebarsComponent.compiled[sourceFile] = handlebars_1.compile(source));
            return this.res.send(compiled(data));
        });
    }
}
HandlebarsComponent.component = "Handlebars.js";
HandlebarsComponent.compiled = {};
exports.HandlebarsComponent = HandlebarsComponent;
//# sourceMappingURL=render-handlebars.js.map