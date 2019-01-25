import { Writable, Readable } from "stream";
import { Server, AddressInfo } from "net";
import { join } from "path";
import { EventEmitter } from "events";

export interface Request {
    /**
     * IP the request originated from. if behind reverse-proxy, provides original IP
     */
    ip: string;
    /**
     * Paramaters used in path name such as /:path where /pathpath returns {path: "pathpath"}
     */
    params: { [key: string]: string };
    /**
     * Returns that path without query
     */
    path: string;
    /**
     * Returns value for key header, ignoring case
     * @param header the header to get
     * @returns string of header value
     */
    getHeader(header: string): string | null;

    /**
     * The internal stream, for reading other data
     */
    stream: Readable;
}

export interface Response {
    /**
     * Sets header to value
     * @param header name of header
     * @param value value of header
     * @returns current response
     */
    setHeader(header: string, value: string | number): Response;
    /**
     * Sets the status code of the response
     * @param statusCode the status code to return
     * @returns current response
     */
    setStatus(statusCode: number): Response;
    /**
     * Redirects the user to the given URL, may be relative for the current domain
     * @param url URL to redirect to
     */
    redirect(url: string): void;
    /**
     * Sends data to the client
     * @param data the data to send, either a string or Buffer
     */
    send(data: string | ArrayBuffer): void;
    /**
     * Sends json to the client
     * @param json the JSON to send
     */
    sendJSON(data: any): void;

    /**
     * The internal stream, for piping other data.
     */
    stream: Writable;
}

export interface WebOpts {
    hostname?: string;
    port?: number;
}

export abstract class WebBackend {
    constructor(opts: WebOpts, protected webService: WebService) {}

    abstract listen(port: number, hostname: string, callback?: () => any): Server;
    abstract addRoute(params: ParsedRoute): void;
    abstract addStatic(route: string, folder: string): void;
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ParsedRoute = {
    route: string; // full route
    method: Method;
    handler: RouteHandler | ParsedRoute[];
};

function parseRoute(route: RouteObject, used?: string[], parent = "/"): ParsedRoute[] {
    if (!used) {
        used = [];
    }
    const parsed: ParsedRoute[] = [];
    for (const key in route) {
        const split = key.split(" ");
        let routePath;
        let method: Method = "GET";
        if (split.length > 2 || (split.length === 2 && ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(split[0]) < 0)) {
            throw new Error(`Route "${join(parent, key)}" has spaces in it. Please use %20 to escape spaces.`);
        }
        if (["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(split[0]) > -1) {
            routePath = split.slice(1).join(" ");
            method = <Method>split[0];
        } else {
            routePath = key;
        }
        const fullRoute = join(parent, routePath);
        const routeHandler = route[key];
        let handler;
        if (typeof routeHandler === "function") {
            handler = <RouteHandler>routeHandler;
            if (used.indexOf(fullRoute) > -1) {
                throw new Error("Route " + fullRoute + " registered more than once");
            }
            used.push(method + "\0" + fullRoute);
        } else {
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

export class WebService extends EventEmitter {
    private backend: WebBackend;
    private setRoot = false;
    constructor(private opts: WebOpts, backend: typeof WebBackend) {
        super();

        this.backend = new (<any>backend)(opts, this);
    }

    public setRoute(route: RouteObject) {
        if (this.setRoot) {
            throw new Error("Route already set");
        }
        const parsed = parseRoute(route);
        for (const route of parsed) {
            this.backend.addRoute(route);
        }
        this.setRoot = true;
    }

    public listen(callback?: (info: string | AddressInfo) => any) {
        const server = this.backend.listen(this.opts.port || 3000, this.opts.hostname || "localhost", () => callback && callback(server.address()));
    }

    public addStatic(route: string, folder: string) {
        this.backend.addStatic(route, folder);
    }
}

export type RouteHandler = (req: Request, res: Response, component: <T>(type: ComponentStatic<T>) => T) => Promise<any> | any;

type RouteObject = { [key: string]: RouteHandler | RouteObject };

type ComponentStatic<T> = (service: WebService, req: Request, res: Response) => T;
