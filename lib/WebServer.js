"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const events_1 = require("events");
const MemorySession_1 = __importDefault(require("./sessions/MemorySession"));
class WebBackend {
}
exports.WebBackend = WebBackend;
function parseRoute(route, used, parent = "/") {
    if (!used) {
        used = [];
    }
    const parsed = [];
    for (const key in route) {
        const fullRoute = path_1.join(parent, key);
        let routeMethod = route[key];
        if (typeof routeMethod === "function") {
            routeMethod = new RouteMethod("GET", routeMethod);
        }
        if (routeMethod instanceof RouteMethod) {
            const key = routeMethod.method + "\0" + fullRoute;
            if (used.indexOf(key) > -1) {
                throw new Error("Route " + fullRoute + " registered more than once");
            }
            used.push(key);
            parsed.push(Object.assign({ route: fullRoute }, routeMethod));
        }
        else {
            parsed.push(...parseRoute(routeMethod, used, fullRoute));
        }
    }
    return parsed;
}
class WebService extends events_1.EventEmitter {
    constructor(opts, backend, sessionStore) {
        super();
        this.opts = opts;
        this.setRoot = false;
        this.backend = backend;
        this.sessionStore = sessionStore || new MemorySession_1.default();
    }
    getOptions() {
        return this.opts;
    }
    getSessionStore() {
        return this.sessionStore;
    }
    addRoute(route) {
        if (this.setRoot) {
            throw new Error("Route already set");
        }
        const parsed = parseRoute(route);
        this.backend.addRoute(this, this.opts, parsed);
        this.setRoot = true;
    }
    listen(callback) {
        const server = this.backend.listen(this, this.opts, this.opts.port || 3000, this.opts.hostname || "localhost", () => callback && callback(server.address()));
    }
    addStatic(route, folder) {
        this.backend.addStatic(this, this.opts, route, folder);
    }
}
exports.WebService = WebService;
const METHOD = (method) => (handler) => new RouteMethod(method, handler);
exports.GET = METHOD("GET");
exports.POST = METHOD("POST");
exports.PATCH = METHOD("PATCH");
exports.PUT = METHOD("PUT");
exports.DELETE = METHOD("DELETE");
class RouteMethod {
    constructor(method, handler) {
        this.method = method;
        this.handler = handler;
    }
}
exports.RouteMethod = RouteMethod;
//# sourceMappingURL=WebServer.js.map