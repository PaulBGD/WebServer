import { Component } from "../WebServer";
import { readFile } from "fs";
import { compile } from "handlebars";

export class HandlebarsComponent extends Component {
    public static component = "Handlebars.js";
    static compiled: { [key: string]: HandlebarsTemplateDelegate } = {};

    public async renderFile(sourceFile: string, data?: any) {
        if (process.env.NODE_ENV === "production" && HandlebarsComponent.compiled[sourceFile]) {
            return this.res.send(HandlebarsComponent.compiled[sourceFile](data));
        }
        const source = await new Promise<string>((resolve, reject) => readFile(sourceFile, "utf8", (err, file) => (err ? reject(err) : resolve(file))));
        const compiled = (HandlebarsComponent.compiled[sourceFile] = compile(source));
        return this.res.send(compiled(data));
    }
}
