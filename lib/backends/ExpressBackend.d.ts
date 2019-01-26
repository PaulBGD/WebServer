/// <reference types="node" />
import { WebBackend, WebOpts, ParsedRoute, WebService, Session } from "../WebServer";
import { Server } from "net";
export default class ExpressBackend extends WebBackend {
    private opts;
    private app;
    constructor(opts: WebOpts, webService: WebService);
    listen(port: number, hostname: string, callback?: () => any): Server;
    addRoute<S extends Session>(route: ParsedRoute<S>): void;
    addStatic(route: string, folder: string): void;
}
