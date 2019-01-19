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
const querystring_1 = require("querystring");
// class CaselessMap<V> extends Map<string, V> {
//     constructor(entries?: ReadonlyArray<[string, V]> | null) {
//         super(entries ? entries.map<[string, V]>(([key, value]) => [key.toLowerCase(), value]) : null);
//     }
//     get(key: string) {
//         return super.get(key.toLowerCase());
//     }
//     has(key: string) {
//         return super.has(key.toLowerCase());
//     }
//     set(key: string, value: V) {
//         return super.set(key.toLowerCase(), value);
//     }
// }
class BodyParser extends WebServer_1.Component {
    getBody() {
        return __awaiter(this, void 0, void 0, function* () {
            const type = this.req.getHeader("Content-Type");
            if (!type) {
                return null;
            }
            const split = type.split(";");
            // todo handle more than form-urlencoded and utf-8
            if (split[0] !== "application/x-www-form-urlencoded" || (split.length > 1 && split[1] !== "charset=utf-8")) {
                return null;
            }
            const buffers = [];
            this.req.stream.on("data", chunk => buffers.push(chunk));
            const buffer = yield new Promise((resolve, reject) => {
                this.req.stream.once("error", err => reject(err));
                this.req.stream.once("end", () => resolve(Buffer.concat(buffers)));
            });
            let encoded;
            try {
                encoded = querystring_1.parse(buffer.toString("UTF8"));
            }
            catch (err) {
                // todo use debug module
                console.error("Ran into error decoding x-www-form-urlencoded content", err);
                return null;
            }
            return encoded;
        });
    }
}
BodyParser.component = "WebServer/BodyParser";
exports.BodyParser = BodyParser;
//# sourceMappingURL=PostData.js.map