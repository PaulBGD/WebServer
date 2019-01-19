import express, { Application, Request, Response, NextFunction, static as expressStatic } from "express";
import { WebBackend, WebOpts, ParsedRoute, RouteHandler, WebService, Request as WSRequest, Response as WSResponse } from "../WebServer";
import { Server } from "net";

class RequestWrapper implements WSRequest {
    constructor(private req: Request) {}

    get ip() {
        return this.req.ip;
    }

    get params() {
        return this.req.params;
    }

    get path() {
        return this.req.path;
    }

    get stream() {
        return this.req;
    }

    getHeader(header: string): string | null {
        return this.req.header(header) || null;
    }
}

class ResponseWrapper implements WSResponse {
    constructor(private res: Response) {}

    get stream() {
        return this.res;
    }

    setHeader(header: string, value: string | number): WSResponse {
        this.res.setHeader(header, value);
        return this;
    }

    setStatus(statusCode: number): WSResponse {
        this.res.status(statusCode);
        return this;
    }

    redirect(url: string): void {
        this.res.redirect(url);
    }

    send(data: string | ArrayBuffer): void {
        this.res.send(data);
    }

    sendJSON(data: any): void {
        this.res.json(data);
    }
}

export default class ExpressBackend extends WebBackend {
    private app: Application;
    constructor(private opts: WebOpts, webService: WebService) {
        super(opts, webService);

        this.app = express();
    }

    public listen(port: number, hostname: string, callback?: () => any): Server {
        return this.app.listen(port, hostname, callback);
    }

    public addRoute(route: ParsedRoute) {
        if (typeof route.handler === "function") {
            const func: RouteHandler = route.handler;
            const handler = (eReq: Request, eRes: Response, next: NextFunction) => {
                const req = new RequestWrapper(eReq);
                const res = new ResponseWrapper(eRes);
                try {
                    const response = func(req, res, async Comp => {
                        const comp = new Comp(this.webService, req, res);
                        await comp.init();
                        return comp;
                    });
                    if (response && response.catch) {
                        response.catch((error: Error) => {
                            this.webService.emit("error", { error, req, res });
                        });
                    }
                } catch (error) {
                    this.webService.emit("error", { error, req, res });
                }
            };
            if (route.method === "GET") {
                this.app.get(route.route, handler);
            } else if (route.method === "POST") {
                this.app.post(route.route, handler);
            } else if (route.method === "PATCH") {
                this.app.patch(route.route, handler);
            } else if (route.method === "DELETE") {
                this.app.delete(route.route, handler);
            } else if (route.method === "PUT") {
                this.app.put(route.route, handler);
            }
        } else {
            for (const val of route.handler) {
                this.addRoute(val);
            }
        }
    }

    public addStatic(route: string, folder: string) {
        this.app.use(route, expressStatic(folder));
    }
}
