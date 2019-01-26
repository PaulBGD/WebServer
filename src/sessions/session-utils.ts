import { SessionStore, Request, Response, WebService, Session } from "../WebServer";
import { randomBytes } from "crypto";

export async function getSession(webService: WebService, req: Request, res: Response): Promise<Session> {
    const name = webService.getOptions().sessionName || "wssession";
    let cookie = req.getCookie(name);
    if (!cookie) {
        cookie = await randomBytes(16).toString("hex");
        res.setCookie(name, cookie);
    }
    const ses = (await webService.getSessionStore().getSession(cookie)) || {};
    return {
        destroy: () => webService.getSessionStore().deleteSession(cookie!),
        ...ses,
    };
}

export function checkSession(session: Session, original: Session) {}
