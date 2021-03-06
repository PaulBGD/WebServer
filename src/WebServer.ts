import { Writable, Readable } from "stream";
import { Server, AddressInfo } from "net";
import { join } from "path";
import { EventEmitter } from "events";
import MemorySession from "./sessions/MemorySession";
import { CookieParseOptions, CookieSerializeOptions } from "cookie";

export interface Request {
    /**
     * IP the request originated from. if behind reverse-proxy, provides original IP
     */
    ip: string;
    /**
     * Parameters used in path name such as /:path where /pathpath returns {path: "pathpath"}
     */
    params: { [key: string]: string };
    /**
     * Query provides values provided in the URL
     */
    query: { [key: string]: string | string[] };
    /**
     * Returns that path without query
     */
    path: string;
    /**
     * Returns value for key header, ignoring case
     * @param header the header to get
     * @returns string of header value, or null
     */
    getHeader(header: string): string | null;

    /**
     * Returns cookie for key name
     * @param cookie the cookie name to get
     * @returns the cookie's value, or null
     */
    getCookie(cookie: string): string | null;

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
    setHeader(header: string, value: string | string[] | number): Response;
    /**
     * Sets the cookie of the specific name
     * @param name cookie name
     * @param value value of cookie
     * @returns current response
     */
    setCookie(name: string, value: string): Response;
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
    cookie?: {
        parse: CookieParseOptions;
        serialize: CookieSerializeOptions;
    };
    sessionName?: string;
}

export abstract class WebBackend {
    abstract listen(webService: WebService, opts: WebOpts, port: number, hostname: string, callback?: () => any): Server;
    abstract addRoute<S extends Session>(webService: WebService, opts: WebOpts, params: ParsedRoute<S>): void;
    abstract addStatic(webService: WebService, opts: WebOpts, route: string, folder: string): void;
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ParsedRoute<S extends Session> = {
    route: string;
    method: Method;
    handler: RouteHandler<S>;
}[];

function parseRoute<S extends Session>(route: RouteObject<S>, used?: string[], parent = "/"): ParsedRoute<S> {
    if (!used) {
        used = [];
    }
    const parsed: ParsedRoute<S> = [];
    for (const key in route) {
        const fullRoute = join(parent, key);
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
            parsed.push({
                route: fullRoute,
                ...routeMethod,
            });
        } else {
            parsed.push(...parseRoute(routeMethod, used, fullRoute));
        }
    }
    return parsed;
}

export interface SessionStore {
    getSession(key: string): Promise<any | null>;
    storeSession(key: string, session: any): Promise<void>;
    deleteSession(key: string): Promise<void>;
}

export class WebService extends EventEmitter {
    private backend: WebBackend;
    private setRoot = false;
    private sessionStore: SessionStore;

    constructor(private opts: WebOpts, backend: WebBackend, sessionStore: SessionStore) {
        super();

        this.backend = backend;
        this.sessionStore = sessionStore || new MemorySession();
    }

    public getOptions(): WebOpts {
        return this.opts;
    }

    public getSessionStore() {
        return this.sessionStore;
    }

    public addRoute<S extends Session>(route: RouteObject<S>) {
        if (this.setRoot) {
            throw new Error("Route already set");
        }
        const parsed = parseRoute(route);
        this.backend.addRoute(this, this.opts, parsed);
        this.setRoot = true;
    }

    public listen(callback?: (info: string | AddressInfo) => any) {
        const server = this.backend.listen(this, this.opts, this.opts.port || 3000, this.opts.hostname || "localhost", () => callback && callback(server.address()));
    }

    public addStatic(route: string, folder: string) {
        this.backend.addStatic(this, this.opts, route, folder);
    }
}

const METHOD = (method: Method) => <S extends Session>(handler: RouteHandler<S>) => new RouteMethod(method, handler);

export const GET = METHOD("GET");
export const POST = METHOD("POST");
export const PATCH = METHOD("PATCH");
export const PUT = METHOD("PUT");
export const DELETE = METHOD("DELETE");

export class RouteMethod<S extends Session> {
    constructor(public method: Method, public handler: RouteHandler<S>) {}
}

export interface Session {
    _existed: boolean;
    _cookie: string;
    _destroy(): Promise<void>;
}
export type RouteData<S extends Session> = {
    req: Request;
    res: Response;
    ses: S;
    component: <T>(type: ComponentStatic<T, S>) => T;
};
export type RouteHandler<S extends Session> = (data: RouteData<S>) => Promise<any> | any;

export type RouteObject<S extends Session> = { [key: string]: RouteMethod<S> | RouteHandler<S> | RouteObject<S> };

export type ComponentStatic<T, S extends Session> = (data: RouteData<S>) => T;
