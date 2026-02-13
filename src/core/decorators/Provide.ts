import { Providable } from "../types/Instantiable";
import "reflect-metadata";

export const Provide = (providable: Providable): ParameterDecorator => {
    return (
        target: Object,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) => {
        const provideType =
            propertyKey === "asyncProvide" ? "asyncProvider" : "provider";
        Reflect.defineMetadata(
            `${provideType}-${parameterIndex}`,
            providable.name,
            target,
            propertyKey as string | symbol
        );
    };
};
