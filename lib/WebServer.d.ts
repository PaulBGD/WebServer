/// <reference types="node" />
import { Writable, Readable } from "stream";
import { Server, AddressInfo } from "net";
import { EventEmitter } from "events";
import { CookieParseOptions, CookieSerializeOptions } from "cookie";
export interface Request {
    /**
     * IP the request originated from. if behind reverse-proxy, provides original IP
     */
    ip: string;
    /**
     * Parameters used in path name such as /:path where /pathpath returns {path: "pathpath"}
     */
    params: {
        [key: string]: string;
    };
    /**
     * Query provides values provided in the URL
     */
    query: {
        [key: string]: string | string[];
    };
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
export declare abstract class WebBackend {
    abstract listen(webService: WebService, opts: WebOpts, port: number, hostname: string, callback?: () => any): Server;
    abstract addRoute<S extends Session>(webService: WebService, opts: WebOpts, params: ParsedRoute<S>): void;
    abstract addStatic(webService: WebService, opts: WebOpts, route: string, folder: string): void;
}
declare type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export declare type ParsedRoute<S extends Session> = {
    route: string;
    method: Method;
    handler: RouteHandler<S>;
}[];
export interface SessionStore {
    getSession(key: string): Promise<any | null>;
    storeSession(key: string, session: any): Promise<void>;
    deleteSession(key: string): Promise<void>;
}
export declare class WebService extends EventEmitter {
    private opts;
    private backend;
    private setRoot;
    private sessionStore;
    constructor(opts: WebOpts, backend: WebBackend, sessionStore: SessionStore);
    getOptions(): WebOpts;
    getSessionStore(): SessionStore;
    addRoute<S extends Session>(route: RouteObject<S>): void;
    listen(callback?: (info: string | AddressInfo) => any): void;
    addStatic(route: string, folder: string): void;
}
export declare const GET: <S extends Session>(handler: RouteHandler<S>) => {
    method: Method;
    handler: RouteHandler<S>;
};
export declare const POST: <S extends Session>(handler: RouteHandler<S>) => {
    method: Method;
    handler: RouteHandler<S>;
};
export declare const PATCH: <S extends Session>(handler: RouteHandler<S>) => {
    method: Method;
    handler: RouteHandler<S>;
};
export declare const PUT: <S extends Session>(handler: RouteHandler<S>) => {
    method: Method;
    handler: RouteHandler<S>;
};
export declare const DELETE: <S extends Session>(handler: RouteHandler<S>) => {
    method: Method;
    handler: RouteHandler<S>;
};
export declare class RouteMethod<S extends Session> {
    method: Method;
    handler: RouteHandler<S>;
    constructor(method: Method, handler: RouteHandler<S>);
}
export interface Session {
    _existed: boolean;
    _cookie: string;
    _destroy(): Promise<void>;
}
export declare type RouteData<S extends Session> = {
    req: Request;
    res: Response;
    ses: S;
    component: <T>(type: ComponentStatic<T, S>) => T;
};
export declare type RouteHandler<S extends Session> = (data: RouteData<S>) => Promise<any> | any;
export declare type RouteObject<S extends Session> = {
    [key: string]: RouteMethod<S> | RouteObject<S>;
};
export declare type ComponentStatic<T, S extends Session> = (data: RouteData<S>) => T;
export {};
