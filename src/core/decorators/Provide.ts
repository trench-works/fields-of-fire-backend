import { Providable } from "../types/Instantiable";
import "reflect-metadata";

export const Provide = (providable: Providable): ParameterDecorator => {
    return (target: Object, propertyKey: string, parameterIndex: number) => {
        Reflect.defineMetadata(
            `provider-${parameterIndex}`,
            providable.name,
            target,
            propertyKey
        );
    };
};
