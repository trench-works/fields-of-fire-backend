import "reflect-metadata";
import { Instantiable } from "../app/Types/Instantiable";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isInstantiable = <T = any>(
    obj: string | Instantiable<T>
): obj is Instantiable<T> => {
    return typeof obj !== "string";
}

export type ParameterPropertyDecorator = ((target: object, propertyKey: string | symbol | undefined, parameterIndex?: number | undefined) => void);

export const Provide = (
    providable: Instantiable | string
): ParameterPropertyDecorator => {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target: any,
        propertyKey: string | symbol | undefined,
        parameterIndex?: number | undefined
    ) => {
        const providableName = isInstantiable(providable) ? providable.name : providable;
        if(parameterIndex === undefined) {
            return provideProperty(providableName, target, propertyKey as string)
        } else {
            return provideParameter(providableName, target, propertyKey as string | undefined, parameterIndex)
        }
    };
};

const provideProperty = (
    providableName: string,
    target: object,
    propertyKey: string
) => {
    Reflect.defineMetadata(
        `provider-${propertyKey}`,
        providableName,
        target,
        propertyKey
    );
}

const provideParameter = (
    providableName: string,
    target: object,
    propertyKey: string | undefined,
    parameterIndex: number
) => {
        if(propertyKey) {
            Reflect.defineMetadata(
                `provider-${propertyKey}-${parameterIndex}`,
                providableName,
                target,
                propertyKey
            );
        } else {
            Reflect.defineMetadata(
                `provider-constructor-${parameterIndex}`,
                providableName,
                target
            );
        }

}