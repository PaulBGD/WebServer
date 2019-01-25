declare type DataType<T> = (name: string, data: any) => Promise<T> | T;
interface StringOpts {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    trimmed?: boolean;
    regex?: RegExp;
}
export declare class DataTypeError extends Error {
    typeName: string;
    constructor(typeName: string, message: string);
}
export declare const StringType: (opts: StringOpts) => DataType<string | null>;
export declare function check<T>(obj: {
    [key: string]: any;
}, checker: {
    [K in keyof T]: DataType<any>;
}): Promise<{
    [K in keyof T]: any;
}>;
export {};
