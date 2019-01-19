import { WebBackend, WebOpts, ParsedRoute, RouteHandler, WebService, Request as WSRequest, Response as WSResponse } from "../WebServer";
import { App, Application, Request, Response } from "uWebSockets.js";
import { Server } from "net";

class RequestWrapper implements WSRequest {
    constructor(private req: Request) {}

    get ip(): string {
        throw new Error("Unimplemented");
    }

    get params(): any {
        throw new Error("Unimplemented");
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
}

class ResponseWrapper implements WSResponse {
    constructor(private res: Response) {}

    get stream(): any {
        throw new Error("unimplemented");
    }

    setHeader(header: string, value: string | number): WSResponse {
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

    constructor(private opts: WebOpts, webService: WebService) {
        super(opts, webService);

        this.app = App();
    }

    listen(port: number, hostname: string, callback?: () => any): Server {
        // todo.. not this
        this.app.listen(port, () => callback && callback());
        return <any>{
            address: () => ({
                port,
                hostname,
            }),
        };
    }

    addRoute(route: ParsedRoute) {
        if (typeof route.handler === "function") {
            const func: RouteHandler = route.handler;
            const handler = (eReq: Request, eRes: Response) => {
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

    addStatic(route: string, folder: string) {
        throw new Error("Method not implemented.");
    }
}

App().listen(3000, tok => console.log("Listening", tok));
