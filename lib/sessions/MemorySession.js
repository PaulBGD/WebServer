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
class MemorySession {
    constructor() {
        this.keys = {};
    }
    getSession(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.keys;
        });
    }
    storeSession(key, session) {
        return __awaiter(this, void 0, void 0, function* () {
            this.keys[key] = session;
        });
    }
    deleteSession(key) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.keys[key];
        });
    }
}
exports.default = MemorySession;
//# sourceMappingURL=MemorySession.js.map