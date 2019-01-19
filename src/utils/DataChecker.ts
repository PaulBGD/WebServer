type DataType<T> = (name: string, data: any) => Promise<T> | T;

interface StringOpts {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    trimmed?: boolean;
    regex?: RegExp;
}

export class DataTypeError extends Error {
    constructor(public typeName: string, message: string) {
        super(message);

        this.name = "DataTypeError";
    }
}

export const StringType = (opts: StringOpts) => (name: string, data: any): DataType<string> => {
    if (opts.required && !data) {
        throw new DataTypeError(name, "not provided");
    }
    if (typeof data !== "string") {
        throw new DataTypeError(name, "not string");
    }
    if (opts.trimmed) {
        data = data.trim();
    }
    if (typeof opts.minLength === "number" && data.length < opts.minLength) {
        throw new DataTypeError(name, `shorter than ${opts.minLength} characters`);
    }
    if (typeof opts.maxLength === "number" && data.length > opts.maxLength) {
        throw new DataTypeError(name, `longer than ${opts.maxLength} characters`);
    }
    if (opts.regex && !opts.regex.test(data)) {
        throw new DataTypeError(name, `invalid format`);
    }
    return data;
};

async function getChecked<T>(type: DataType<T>, name: string, data: any): Promise<T | DataTypeError> {
    let returned = type(name, data);
    if ((<any>returned).then) {
        returned = await returned;
    }
    return returned;
}

export async function check<T>(obj: { [key: string]: any }, checker: { [K in keyof T]: DataType<any> }): Promise<{ [K in keyof T]: any }> {
    // todo figure out how we're actually supposed to use `in keyof`
    const map: { [K in keyof T]: any } = <any>{};
    for (const key in checker) {
        map[key] = await getChecked(checker[key], key, obj[key]);
    }
    return map;
}
