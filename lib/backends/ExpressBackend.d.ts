/// <reference types="node" />
import { WebBackend, WebOpts, ParsedRoute, WebService } from "../WebServer";
import { Server } from "net";
export default class ExpressBackend extends WebBackend {
    private opts;
    private app;
    constructor(opts: WebOpts, webService: WebService);
    listen(port: number, hostname: string, callback?: () => any): Server;
    addRoute(route: ParsedRoute): void;
    addStatic(route: string, folder: string): void;
}
