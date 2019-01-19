declare module "uWebSockets.js" {
    import { Writable } from "stream";

    type Token = "__some unique object__";

    interface Request {
        getHeader(name: string): string;
        getParameter(index: number): string | undefined;
        getUrl(): string;
        getMethod(): string;
        getQuery(): string;
    }

    interface Response {
        onData(callback: (chunk: ArrayBuffer, isLast: boolean) => any): void;
        onWritable(callback: (chunk: ArrayBuffer, isLast: boolean) => boolean | undefined): void;
        onAborted(callback: () => any): void;
        tryEnd(buf: ArrayBuffer, totalSize?: number): boolean;
        end(data: string | ArrayBuffer): boolean;
        write(data: string | ArrayBuffer): boolean;
        writeStatus(status: string): Response;
        writeHeader(name: string, value: string): Response;
        getWriteOffset(): number;
    }

    type RouteHandler = (req: Request, res: Response) => any;

    interface Application {
        get(route: string, callback: RouteHandler): Application;
        post(route: string, callback: RouteHandler): Application;
        options(route: string, callback: RouteHandler): Application;
        del(route: string, callback: RouteHandler): Application;
        patch(route: string, callback: RouteHandler): Application;
        put(route: string, callback: RouteHandler): Application;
        head(route: string, callback: RouteHandler): Application;
        connect(route: string, callback: RouteHandler): Application;
        trace(route: string, callback: RouteHandler): Application;

        listen(port: number, callback: (token: Token) => any): void;
    }

    interface Opts {}

    export function us_listen_socket_close(token: Token): void;
    export function App(opts?: Opts): Application;
}
