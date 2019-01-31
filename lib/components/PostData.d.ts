import { RouteData } from "../WebServer";
declare const PostData: ({ req }: RouteData<any>) => Promise<{
    [key: string]: string | string[];
} | null>;
export default PostData;
