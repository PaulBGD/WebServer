/// <reference types="node" />
import { Server } from "net";
import { ParsedRoute, Session, WebBackend, WebOpts, WebService } from "../WebServer";
export default class UWSBackend extends WebBackend {
    private app;
    constructor();
    listen(webService: WebService, opts: WebOpts, port: number, hostname: string, callback?: () => any): Server;
    addRoute<S extends Session>(webService: WebService, opts: WebOpts, routes: ParsedRoute<S>): void;
    addStatic(webService: WebService, opts: WebOpts, route: string, folder: string): void;
}
