"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const WebServer_1 = require("../WebServer");
class RequestWrapper {
    constructor(req) {
        this.req = req;
    }
    get ip() {
        return this.req.ip;
    }
    get params() {
        return this.req.params;
    }
    get path() {
        return this.req.path;
    }
    get stream() {
        return this.req;
    }
    getHeader(header) {
        return this.req.header(header) || null;
    }
}
class ResponseWrapper {
    constructor(res) {
        this.res = res;
    }
    get stream() {
        return this.res;
    }
    setHeader(header, value) {
        this.res.setHeader(header, value);
        return this;
    }
    setStatus(statusCode) {
        this.res.status(statusCode);
        return this;
    }
    redirect(url) {
        this.res.redirect(url);
    }
    send(data) {
        this.res.send(data);
    }
    sendJSON(data) {
        this.res.json(data);
    }
}
class ExpressBackend extends WebServer_1.WebBackend {
    constructor(opts, webService) {
        super(opts, webService);
        this.opts = opts;
        this.app = express_1.default();
    }
    listen(port, hostname, callback) {
        return this.app.listen(port, hostname, callback);
    }
    addRoute(route) {
        if (typeof route.handler === "function") {
            const func = route.handler;
            const handler = (eReq, eRes, next) => {
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
                this.app.delete(route.route, handler);
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
        this.app.use(route, express_1.static(folder));
    }
}
exports.default = ExpressBackend;
//# sourceMappingURL=ExpressBackend.js.map