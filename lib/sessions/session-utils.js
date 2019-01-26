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
const crypto_1 = require("crypto");
function getSession(webService, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = webService.getOptions().sessionName || "wssession";
        let cookie = req.getCookie(name);
        if (!cookie) {
            cookie = yield crypto_1.randomBytes(16).toString("hex");
            res.setCookie(name, cookie);
        }
        const ses = yield webService.getSessionStore().getSession(cookie);
        return Object.assign({ _cookie: cookie, _existed: !!ses, _destroy: () => webService.getSessionStore().deleteSession(cookie) }, (ses || {}));
    });
}
exports.getSession = getSession;
function deepEquals(o1, o2, previous = []) {
    if (typeof o1 === "function" && typeof o2 === "function") {
        return true; // ignore functions, they don't get serialized
    }
    if (typeof o1 !== "object") {
        return o1 === o2;
    }
    if (previous.indexOf(o1) > -1) {
        throw new Error("Recursive deepEquals");
    }
    previous.push(o1);
    for (const prop in o1) {
        if (o1.hasOwnProperty(prop) && !o2.hasOwnProperty(prop)) {
            return false;
        }
        if (!deepEquals(o1[prop], o2[prop], previous)) {
            return false;
        }
    }
    for (const prop in o2) {
        if (o2.hasOwnProperty(prop) && !o2.hasOwnProperty(prop)) {
            return false;
        }
        if (!deepEquals(o2[prop], o1[prop], previous)) {
            return false;
        }
    }
    return true;
}
function deepCopy(o1) {
    if (typeof o1 !== "object") {
        return o1;
    }
    const obj = {};
    for (const key in o1) {
        obj[key] = deepCopy(o1[key]);
    }
    return obj;
}
exports.deepCopy = deepCopy;
function checkSession(webService, session, original) {
    return __awaiter(this, void 0, void 0, function* () {
        const equals = deepEquals(original, session);
        if (!equals) {
            const { _cookie, _existed } = session;
            delete session._cookie;
            delete session._destroy;
            delete session._existed;
            if (Object.keys(session).length === 0) {
                if (_existed) {
                    yield webService.getSessionStore().deleteSession(_cookie);
                }
            }
            else {
                yield webService.getSessionStore().storeSession(_cookie, session);
            }
        }
    });
}
exports.checkSession = checkSession;
//# sourceMappingURL=session-utils.js.map