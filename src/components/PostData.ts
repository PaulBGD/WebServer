import { Request, Response, WebService } from "../WebServer";
import { parse, ParsedUrlQuery } from "querystring";

// class CaselessMap<V> extends Map<string, V> {
//     constructor(entries?: ReadonlyArray<[string, V]> | null) {
//         super(entries ? entries.map<[string, V]>(([key, value]) => [key.toLowerCase(), value]) : null);
//     }

//     get(key: string) {
//         return super.get(key.toLowerCase());
//     }

//     has(key: string) {
//         return super.has(key.toLowerCase());
//     }

//     set(key: string, value: V) {
//         return super.set(key.toLowerCase(), value);
//     }
// }

export default (service: WebService, req: Request, res: Response) => async (): Promise<{ [key: string]: string | string[] } | null> => {
    const type = req.getHeader("Content-Type");
    if (!type) {
        return null;
    }
    const split = type.split(";");
    // todo handle more than form-urlencoded and utf-8
    if (split[0] !== "application/x-www-form-urlencoded" || (split.length > 1 && split[1] !== "charset=utf-8")) {
        return null;
    }

    const buffers: Buffer[] = [];
    req.stream.on("data", chunk => buffers.push(chunk));

    const buffer = await new Promise<Buffer>((resolve, reject) => {
        req.stream.once("error", err => reject(err));
        req.stream.once("end", () => resolve(Buffer.concat(buffers)));
    });
    let encoded: ParsedUrlQuery;
    try {
        encoded = parse(buffer.toString("UTF8"));
    } catch (err) {
        // todo use debug module
        console.error("Ran into error decoding x-www-form-urlencoded content", err);
        return null;
    }

    return encoded;
};
