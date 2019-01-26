import { SessionStore } from "../WebServer";

export default class MemorySession implements SessionStore {
    private keys: { [key: string]: any } = {};

    async getSession(key: string) {
        return this.keys;
    }

    async storeSession(key: string, session: any) {
        this.keys[key] = session;
    }

    async deleteSession(key: string) {
        delete this.keys[key];
    }
}
