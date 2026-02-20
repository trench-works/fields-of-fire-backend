import "reflect-metadata";
import { Instantiable } from "../app/Types/Instantiable";

export const Provide = (providable: Instantiable): ParameterDecorator => {
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
