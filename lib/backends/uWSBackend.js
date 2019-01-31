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
const cookie_1 = require("cookie");
const querystring_1 = require("querystring");
const url_1 = require("url");
const uWebSockets_js_1 = require("uWebSockets.js");
const session_utils_1 = require("../sessions/session-utils");
const WebServer_1 = require("../WebServer");
class RequestWrapper {
    constructor(webService, req) {
        this.webService = webService;
        this.req = req;
    }
    get ip() {
        throw new Error("Unimplemented");
    }
    get params() {
        throw new Error("Unimplemented");
    }
    get query() {
        if (!this.parsedQuery) {
            const { query } = url_1.parse(this.req.getUrl());
            if (query) {
                this.parsedQuery = querystring_1.parse(query);
            }
            else {
                this.parsedQuery = {};
            }
        }
        return this.parsedQuery;
    }
    get path() {
        throw new Error("Unimplemented");
    }
    get stream() {
        throw new Error("Unimplemented");
    }
    getHeader(header) {
        return this.req.getHeader(header) || null;
    }
    getCookie(cookie) {
        const header = this.getHeader("Cookie");
        if (!header) {
            return null;
        }
        if (!this.parsedCookies) {
            const { cookie } = this.webService.getOptions();
            this.parsedCookies = cookie_1.parse(header, cookie ? cookie.parse : undefined);
        }
        return this.parsedCookies[cookie] || null;
    }
}
class ResponseWrapper {
    constructor(webService, res) {
        this.webService = webService;
        this.res = res;
        this.previousCookies = [];
    }
    get stream() {
        throw new Error("unimplemented");
    }
    setCookie(name, value) {
        const { cookie } = this.webService.getOptions();
        const serialized = cookie_1.serialize(name, value, cookie ? cookie.serialize : undefined);
        this.previousCookies.push(serialized);
        this.setHeader("Set-Cookie", this.previousCookies);
        return this;
    }
    setHeader(header, value) {
        this.res.writeHeader(header, String(value));
        return this;
    }
    setStatus(statusCode) {
        this.res.writeStatus(String(statusCode));
        return this;
    }
    redirect(url) {
        this.setStatus(302);
        this.setHeader("Location", `${url}`);
    }
    send(data) {
        this.res.write(data);
    }
    sendJSON(data) {
        this.send(JSON.stringify(data));
    }
}
class UWSBackend extends WebServer_1.WebBackend {
    constructor() {
        super();
        this.app = uWebSockets_js_1.App();
    }
    listen(webService, opts, port, hostname, callback) {
        // todo.. not this
        this.app.listen(port, () => callback && callback());
        return {
            address: () => ({
                port,
                hostname,
            }),
        };
    }
    addRoute(webService, opts, routes) {
        for (const route of routes) {
            const func = route.handler;
            const handler = (eReq, eRes) => {
                const req = new RequestWrapper(webService, eReq);
                const res = new ResponseWrapper(webService, eRes);
                (() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const ses = yield session_utils_1.getSession(webService, req, res);
                        const copied = session_utils_1.deepCopy(ses);
                        const obj = { req, res, component: comp => comp(obj), ses: copied };
                        const response = func(obj);
                        if (response && response.then) {
                            yield response;
                        }
                        yield session_utils_1.checkSession(webService, copied, ses);
                    }
                    catch (error) {
                        webService.emit("error", { error, req, res });
                    }
                }))();
            };
            if (route.method === "GET") {
                this.app.get(route.route, handler);
            }
            else if (route.method === "POST") {
                this.app.post(route.route, handler);
            }
            else if (route.method === "PATCH") {
                this.app.patch(route.route, handler);
            }
            else if (route.method === "DELETE") {
                this.app.del(route.route, handler);
            }
            else if (route.method === "PUT") {
                this.app.put(route.route, handler);
            }
        }
    }
    addStatic(webService, opts, route, folder) {
        throw new Error("Method not implemented.");
    }
}
exports.default = UWSBackend;
uWebSockets_js_1.App().listen(3000, tok => console.log("Listening", tok));
//# sourceMappingURL=uWSBackend.js.map