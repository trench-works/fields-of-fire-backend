import "reflect-metadata";
import { Instantiable } from "../app/Types/Instantiable";

function isInstantiable<T = any>(
    obj: string | Instantiable<T>
): obj is Instantiable<T> {
    return typeof obj !== "string";
}

export const Provide = (
    providable: Instantiable | string
): ParameterDecorator => {
    return (
        target: Object,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) => {
        const provideType =
            propertyKey === "asyncProvide" ? "asyncProvider" : "provider";
        Reflect.defineMetadata(
            `${provideType}-${parameterIndex}`,
            isInstantiable(providable) ? providable.name : providable,
            target,
            propertyKey as string
        );
    };
};
