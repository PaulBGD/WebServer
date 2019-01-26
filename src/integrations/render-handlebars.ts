import { readFile } from "fs";
import { compile } from "handlebars";
import { RouteData } from "../WebServer";

const PROD_TEMPLATES: { [key: string]: HandlebarsTemplateDelegate } = {};

export default ({ res }: RouteData<any>) => async (sourceFile: string, data?: any) => {
    let cachedTemplate;
    if (process.env.NODE_ENV === "production" && (cachedTemplate = PROD_TEMPLATES[sourceFile])) {
        return res.send(cachedTemplate(data));
    }
    const source = await new Promise<string>((resolve, reject) => readFile(sourceFile, "utf8", (err, file) => (err ? reject(err) : resolve(file))));
    const compiled = compile(source);
    if (process.env.NODE_ENV === "production") {
        PROD_TEMPLATES[sourceFile] = compiled;
    }
    return res.send(compiled(data));
};
