"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebServer_1 = require("../WebServer");
const uWebSockets_js_1 = require("uWebSockets.js");
class RequestWrapper {
    constructor(req) {
        this.req = req;
    }
    get ip() {
        throw new Error("Unimplemented");
    }
    get params() {
        throw new Error("Unimplemented");
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
}
class ResponseWrapper {
    constructor(res) {
        this.res = res;
    }
    get stream() {
        throw new Error("unimplemented");
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
    constructor(opts, webService) {
        super(opts, webService);
        this.opts = opts;
        this.app = uWebSockets_js_1.App();
    }
    listen(port, hostname, callback) {
        // todo.. not this
        this.app.listen(port, () => callback && callback());
        return {
            address: () => ({
                port,
                hostname,
            }),
        };
    }
    addRoute(route) {
        if (typeof route.handler === "function") {
            const func = route.handler;
            const handler = (eReq, eRes) => {
                const req = new RequestWrapper(eReq);
                const res = new ResponseWrapper(eRes);
                try {
                    const response = func(req, res, Comp => Comp(this.webService, req, res));
                    if (response && response.catch) {
                        response.catch((error) => {
                            this.webService.emit("error", { error, req, res });
                        });
                    }
                }
                catch (error) {
                    this.webService.emit("error", { error, req, res });
                }
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
        else {
            for (const val of route.handler) {
                this.addRoute(val);
            }
        }
    }
    addStatic(route, folder) {
        throw new Error("Method not implemented.");
    }
}
exports.default = UWSBackend;
uWebSockets_js_1.App().listen(3000, tok => console.log("Listening", tok));
//# sourceMappingURL=uWSBackend.js.map