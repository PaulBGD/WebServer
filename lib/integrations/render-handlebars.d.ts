/// <reference types="handlebars" />
import { Component } from "../WebServer";
export declare class HandlebarsComponent extends Component {
    static component: string;
    static compiled: {
        [key: string]: HandlebarsTemplateDelegate;
    };
    renderFile(sourceFile: string, data?: any): Promise<void>;
}
