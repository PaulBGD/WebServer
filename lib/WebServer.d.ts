/// <reference types="node" />
import { Writable, Readable } from "stream";
import { Server, AddressInfo } from "net";
import { EventEmitter } from "events";
export interface Request {
    /**
     * IP the request originated from. if behind reverse-proxy, provides original IP
     */
    ip: string;
    /**
     * Paramaters used in path name such as /:path where /pathpath returns {path: "pathpath"}
     */
    params: {
        [key: string]: string;
    };
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
export declare abstract class WebBackend {
    protected webService: WebService;
    constructor(opts: WebOpts, webService: WebService);
    abstract listen(port: number, hostname: string, callback?: () => any): Server;
    abstract addRoute(params: ParsedRoute): void;
    abstract addStatic(route: string, folder: string): void;
}
declare type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export declare type ParsedRoute = {
    route: string;
    method: Method;
    handler: RouteHandler | ParsedRoute[];
};
export declare class WebService extends EventEmitter {
    private opts;
    private backend;
    private setRoot;
    constructor(opts: WebOpts, backend: typeof WebBackend);
    setRoute(route: RouteObject): void;
    listen(callback?: (info: string | AddressInfo) => any): void;
    addStatic(route: string, folder: string): void;
}
export declare type RouteHandler = (req: Request, res: Response, component: <T>(type: ComponentStatic<T>) => T) => Promise<any> | any;
declare type RouteObject = {
    [key: string]: RouteHandler | RouteObject;
};
declare type ComponentStatic<T> = (service: WebService, req: Request, res: Response) => T;
export {};
