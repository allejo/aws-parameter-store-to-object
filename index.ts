import { SSM } from 'aws-sdk';

export interface Options<T> {
    prefix?: string;
    ssm?: SSM;
    ssmConfig?: {};
    typeCasts?: Partial<Record<keyof T, (value?: string) => T[keyof T]>>;
    withDecryption?: boolean;
}

export async function getParameterStoreValues<T extends {}>(
    paths: string[],
    options: Options<T> = {},
): Promise<Partial<T>> {
    const psPaths = options.prefix ? paths.map(v => `${options.prefix}${v}`) : paths;
    const psParameters = {
        Names: psPaths,
        WithDecryption: options.withDecryption ?? true,
    };
    const ssm = options.ssm ?? new SSM(options.ssmConfig);
    const { Parameters } = await ssm.getParameters(psParameters).promise();
    const values: Partial<T> = {};

    Parameters?.forEach((value: SSM.Parameter) => {
        if (!value.Name) {
            return;
        }

        const key = value.Name as keyof T;
        const castedVal = options.typeCasts?.[key]?.(value.Value) ?? value.Value;

        values[key] = castedVal as (T[keyof T] | undefined);
    });

    return Promise.resolve(values);
}
