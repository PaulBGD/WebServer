/// <reference types="node" />
import { WebBackend, WebOpts, ParsedRoute, WebService, Session } from "../WebServer";
import { Server } from "net";
export default class ExpressBackend extends WebBackend {
    private app;
    constructor();
    listen(webService: WebService, opts: WebOpts, port: number, hostname: string, callback?: () => any): Server;
    addRoute<S extends Session>(webService: WebService, opts: WebOpts, route: ParsedRoute<S>): void;
    addStatic(webService: WebService, opts: WebOpts, route: string, folder: string): void;
}
