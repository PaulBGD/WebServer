import { parse as parseCookie, serialize } from "cookie";
import { Server } from "net";
import { parse } from "querystring";
import { parse as parseURL } from "url";
import { App, Application, Request, Response } from "uWebSockets.js";
import { checkSession, deepCopy, getSession } from "../sessions/session-utils";
import { ParsedRoute, Request as WSRequest, Response as WSResponse, RouteData, RouteHandler, Session, WebBackend, WebOpts, WebService } from "../WebServer";

class RequestWrapper implements WSRequest {
    private parsedCookies?: { [key: string]: string };
    private parsedQuery?: { [key: string]: string | string[] };

    constructor(private webService: WebService, private req: Request) {}

    get ip(): string {
        throw new Error("Unimplemented");
    }

    get params(): any {
        throw new Error("Unimplemented");
    }

    get query() {
        if (!this.parsedQuery) {
            const { query } = parseURL(this.req.getUrl());
            if (query) {
                this.parsedQuery = parse(query);
            } else {
                this.parsedQuery = {};
            }
        }
        return this.parsedQuery;
    }

    get path(): any {
        throw new Error("Unimplemented");
    }

    get stream(): any {
        throw new Error("Unimplemented");
    }

    getHeader(header: string): string | null {
        return this.req.getHeader(header) || null;
    }

    getCookie(cookie: string): string | null {
        const header = this.getHeader("Cookie");
        if (!header) {
            return null;
        }
        if (!this.parsedCookies) {
            const { cookie } = this.webService.getOptions();
            this.parsedCookies = parseCookie(header, cookie ? cookie.parse : undefined);
        }
        return this.parsedCookies[cookie] || null;
    }
}

class ResponseWrapper implements WSResponse {
    private previousCookies: string[] = [];

    constructor(private webService: WebService, private res: Response) {}

    get stream(): any {
        throw new Error("unimplemented");
    }

    setCookie(name: string, value: string): WSResponse {
        const { cookie } = this.webService.getOptions();
        const serialized = serialize(name, value, cookie ? cookie.serialize : undefined);
        this.previousCookies.push(serialized);
        this.setHeader("Set-Cookie", this.previousCookies);
        return this;
    }

    setHeader(header: string, value: string | string[] | number): WSResponse {
        this.res.writeHeader(header, String(value));
        return this;
    }

    setStatus(statusCode: number): WSResponse {
        this.res.writeStatus(String(statusCode));
        return this;
    }

    redirect(url: string): void {
        this.setStatus(302);
        this.setHeader("Location", `${url}`);
    }

    send(data: string | ArrayBuffer): void {
        this.res.write(data);
    }

    sendJSON(data: any): void {
        this.send(JSON.stringify(data));
    }
}

export default class UWSBackend extends WebBackend {
    private app: Application;

    constructor() {
        super();

        this.app = App();
    }

    listen(webService: WebService, opts: WebOpts, port: number, hostname: string, callback?: () => any): Server {
        // todo.. not this
        this.app.listen(port, () => callback && callback());
        return <any>{
            address: () => ({
                port,
                hostname,
            }),
        };
    }

    addRoute<S extends Session>(webService: WebService, opts: WebOpts, routes: ParsedRoute<S>) {
        for (const route of routes) {
            const func: RouteHandler<S> = route.handler;
            const handler = (eReq: Request, eRes: Response) => {
                const req = new RequestWrapper(webService, eReq);
                const res = new ResponseWrapper(webService, eRes);
                (async () => {
                    try {
                        const ses = await getSession(webService, req, res);
                        const copied: S = <any>deepCopy(ses);
                        const obj: RouteData<S> = { req, res, component: comp => comp(obj), ses: copied };
                        const response = func(obj);
                        if (response && response.then) {
                            await response;
                        }
                        await checkSession(webService, copied, ses);
                    } catch (error) {
                        webService.emit("error", { error, req, res });
                    }
                })();
            };
            if (route.method === "GET") {
                this.app.get(route.route, handler);
            } else if (route.method === "POST") {
                this.app.post(route.route, handler);
            } else if (route.method === "PATCH") {
                this.app.patch(route.route, handler);
            } else if (route.method === "DELETE") {
                this.app.del(route.route, handler);
            } else if (route.method === "PUT") {
                this.app.put(route.route, handler);
            }
        }
    }

    addStatic(webService: WebService, opts: WebOpts, route: string, folder: string) {
        throw new Error("Method not implemented.");
    }
}

App().listen(3000, tok => console.log("Listening", tok));
