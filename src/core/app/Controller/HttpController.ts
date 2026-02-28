/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpError } from "../../errors/http/HttpError";
import { Instantiable } from "../Types/Instantiable";

export type GetListenerOptions<
    ParamObject extends Record<string, unknown> = {},
    QueryObject extends Record<string, unknown> = {}
> = {
    params?: ParamObject;
    query?: QueryObject;
};


type GetListener<
    ReturnType = void,
    ParamObject extends Record<string, unknown> = {},
    QueryObject extends Record<string, unknown> = {},
> = (
    options: GetListenerOptions<ParamObject, QueryObject>
) => Promise<ReturnType | HttpError>;


export type GetHandler<
    ReturnType = void,
    ParamObject extends Record<string, unknown> = {},
    QueryObject extends Record<string, unknown> = {}
> = {
    listener: GetListener<ReturnType, ParamObject, QueryObject>;
    param?: Instantiable<ParamObject>;
    query?: Instantiable<QueryObject>;
}


type GetOptions<
    ParamObject extends Record<string, unknown> = {},
    QueryObject extends Record<string, unknown> = {}
> = {
    param?: Instantiable<ParamObject>;
    query?: Instantiable<QueryObject>;
};

export class HttpController {
    private readonly _isHttpController = true;

    static isHttpController(obj: any): obj is HttpController {
        return (obj as HttpController)._isHttpController === true;
    }
    
    public getHandlers: Map<
        string,
        GetHandler<any, any, any>
    >;

    constructor() {
        this.getHandlers = new Map();
    }

    get<ReturnType = void, ParamObject extends Record<string, unknown> = any, QueryObject extends Record<string, unknown> = any>(
        path: string,
        listener: GetListener<ReturnType, ParamObject, QueryObject>,
        options?: GetOptions<ParamObject, QueryObject>
    ): this {
        this.getHandlers.set(path, {
            listener,
            ...options
        });
        return this;
    }
}