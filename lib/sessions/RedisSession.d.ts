import { SessionStore } from "../WebServer";
import Redis from "ioredis";
interface RedisOpts {
    prefix?: string;
    timeout_seconds?: number;
    redis?: Redis.RedisOptions;
}
export default class RedisSession implements SessionStore {
    private opts;
    private redis;
    constructor(opts?: RedisOpts);
    private getPath;
    getSession(key: string): Promise<any | null>;
    storeSession(key: string, session: any): Promise<void>;
    deleteSession(key: string): Promise<void>;
}
export {};
