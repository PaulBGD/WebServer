"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const events_1 = require("events");
class WebBackend {
    constructor(opts, webService) {
        this.webService = webService;
    }
}
exports.WebBackend = WebBackend;
function parseRoute(route, used, parent = "/") {
    if (!used) {
        used = [];
    }
    const parsed = [];
    for (const key in route) {
        const split = key.split(" ");
        let routePath;
        let method = "GET";
        if (split.length > 2 || (split.length === 2 && ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(split[0]) < 0)) {
            throw new Error(`Route "${path_1.join(parent, key)}" has spaces in it. Please use %20 to escape spaces.`);
        }
        if (["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(split[0]) > -1) {
            routePath = split.slice(1).join(" ");
            method = split[0];
        }
        else {
            routePath = key;
        }
        const fullRoute = path_1.join(parent, routePath);
        const routeHandler = route[key];
        let handler;
        if (typeof routeHandler === "function") {
            handler = routeHandler;
            if (used.indexOf(fullRoute) > -1) {
                throw new Error("Route " + fullRoute + " registered more than once");
            }
            used.push(method + "\0" + fullRoute);
        }
        else {
            handler = parseRoute(routeHandler, used, fullRoute);
        }
        parsed.push({
            route: fullRoute,
            method,
            handler,
        });
    }
    return parsed;
}
class WebService extends events_1.EventEmitter {
    constructor(opts, backend) {
        super();
        this.opts = opts;
        this.setRoot = false;
        this.backend = new backend(opts, this);
    }
    setRoute(route) {
        if (this.setRoot) {
            throw new Error("Route already set");
        }
        const parsed = parseRoute(route);
        for (const route of parsed) {
            this.backend.addRoute(route);
        }
        this.setRoot = true;
    }
    listen(callback) {
        const server = this.backend.listen(this.opts.port || 3000, this.opts.hostname || "localhost", () => callback && callback(server.address()));
    }
    addStatic(route, folder) {
        this.backend.addStatic(route, folder);
    }
}
exports.WebService = WebService;
//# sourceMappingURL=WebServer.js.map