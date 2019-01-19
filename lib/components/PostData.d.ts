import { Component } from "../WebServer";
export declare class BodyParser extends Component {
    static component: string;
    getBody(): Promise<{
        [key: string]: string | string[];
    } | null>;
}
