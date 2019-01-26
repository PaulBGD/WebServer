import { RouteData } from "../WebServer";
declare const _default: ({ req }: RouteData<any>) => () => Promise<{
    [key: string]: string | string[];
} | null>;
export default _default;
