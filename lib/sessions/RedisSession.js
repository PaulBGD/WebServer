"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const TIMEOUT = 60 * 60 * 24 * 7; // 1 week
class RedisSession {
    constructor(opts = {}) {
        this.opts = opts;
        opts.prefix = opts.prefix || "wsrs";
        this.redis = new ioredis_1.default(opts.redis);
    }
    getPath(key) {
        return (this.opts.prefix || "wsrs") + ":" + key;
    }
    getSession(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const val = yield this.redis.get(this.getPath(key));
            if (val) {
                return JSON.parse(val);
            }
            return null;
        });
    }
    // gets a lock on `key`.lock, so two simultanious requests won't overwrite each other
    storeSession(key, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPath(key);
            do { } while ((yield this.redis.set(path + ".lock", "", ["EX", "3", "NX"])) === null); // todo maybe wait 5ms?
            const pipeline = this.redis.pipeline();
            pipeline.set(path, JSON.stringify(session), "EX", this.opts.timeout_seconds || TIMEOUT);
            pipeline.del(path + ".lock");
            yield pipeline.exec();
        });
    }
    deleteSession(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPath(key);
            yield this.redis.del(path);
        });
    }
}
exports.default = RedisSession;
//# sourceMappingURL=RedisSession.js.map