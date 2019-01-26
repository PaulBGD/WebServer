import { SessionStore, Request, Response, WebService, Session } from "../WebServer";
import { randomBytes } from "crypto";

export async function getSession(webService: WebService, req: Request, res: Response): Promise<Session> {
    const name = webService.getOptions().sessionName || "wssession";
    let cookie = req.getCookie(name);
    if (!cookie) {
        cookie = await randomBytes(16).toString("hex");
        res.setCookie(name, cookie);
    }
    const ses = await webService.getSessionStore().getSession(cookie);
    return {
        _cookie: cookie,
        _existed: !!ses,
        _destroy: () => webService.getSessionStore().deleteSession(cookie!),
        ...(ses || {}),
    };
}

type RecursiveObject = { [key: string]: RecursiveObject };

function deepEquals(o1: RecursiveObject, o2: RecursiveObject, previous: RecursiveObject[] = []) {
    if (typeof o1 === "function" && typeof o2 === "function") {
        return true; // ignore functions, they don't get serialized
    }
    if (typeof o1 !== "object") {
        return o1 === o2;
    }
    if (previous.indexOf(o1) > -1) {
        throw new Error("Recursive deepEquals");
    }
    previous.push(o1);
    for (const prop in o1) {
        if (o1.hasOwnProperty(prop) && !o2.hasOwnProperty(prop)) {
            return false;
        }
        if (!deepEquals(o1[prop], o2[prop], previous)) {
            return false;
        }
    }
    for (const prop in o2) {
        if (o2.hasOwnProperty(prop) && !o2.hasOwnProperty(prop)) {
            return false;
        }
        if (!deepEquals(o2[prop], o1[prop], previous)) {
            return false;
        }
    }
    return true;
}

export function deepCopy<T extends Object>(o1: T): T {
    if (typeof o1 !== "object") {
        return o1;
    }
    const obj: any = {};
    for (const key in o1) {
        obj[key] = deepCopy(o1[key]);
    }
    return obj;
}

export async function checkSession(webService: WebService, session: Session, original: Session) {
    const equals = deepEquals(<any>original, <any>session);
    if (!equals) {
        const { _cookie, _existed } = session;
        delete session._cookie;
        delete session._destroy;
        delete session._existed;
        if (Object.keys(session).length === 0) {
            if (_existed) {
                await webService.getSessionStore().deleteSession(_cookie);
            }
        } else {
            await webService.getSessionStore().storeSession(_cookie, session);
        }
    }
}
