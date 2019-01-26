import { SessionStore } from "../WebServer";
import Redis from "ioredis";

interface RedisOpts {
    prefix?: string;
    timeout_seconds?: number;
    redis?: Redis.RedisOptions;
}

const TIMEOUT = 60 * 60 * 24 * 7; // 1 week
export default class RedisSession implements SessionStore {
    private redis: Redis.Redis;

    constructor(private opts: RedisOpts = {}) {
        opts.prefix = opts.prefix || "wsrs";
        this.redis = new Redis(opts.redis);
    }

    private getPath(key: string) {
        return (this.opts.prefix || "wsrs") + ":" + key;
    }

    async getSession(key: string): Promise<any | null> {
        const val = await this.redis.get(this.getPath(key));
        if (val) {
            return JSON.parse(val);
        }
        return null;
    }

    // gets a lock on `key`.lock, so two simultanious requests won't overwrite each other
    async storeSession(key: string, session: string): Promise<void> {
        const path = this.getPath(key);

        do {} while ((await this.redis.set(path + ".lock", "", ["EX", "3", "NX"])) === null); // todo maybe wait 5ms?

        const pipeline = this.redis.pipeline();
        pipeline.set(path, session, "EX", this.opts.timeout_seconds || TIMEOUT);
        pipeline.del(path + ".lock");
        await pipeline.exec();
    }

    async deleteSession(key: string): Promise<void> {
        const path = this.getPath(key);
        await this.redis.del(path);
    }
}
