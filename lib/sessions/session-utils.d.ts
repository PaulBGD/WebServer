import { Request, Response, WebService, Session } from "../WebServer";
export declare function getSession(webService: WebService, req: Request, res: Response): Promise<Session>;
export declare function deepCopy<T extends Object>(o1: T): T;
export declare function checkSession(webService: WebService, session: Session, original: Session): Promise<void>;
