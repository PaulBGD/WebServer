import { SessionStore } from "../WebServer";
export default class MemorySession implements SessionStore {
    private keys;
    getSession(key: string): Promise<{
        [key: string]: any;
    }>;
    storeSession(key: string, session: any): Promise<void>;
    deleteSession(key: string): Promise<void>;
}
