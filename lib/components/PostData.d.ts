import { Request, Response, WebService } from "../WebServer";
declare const _default: (service: WebService, req: Request, res: Response) => () => Promise<{
    [key: string]: string | string[];
} | null>;
export default _default;
