import { SSM } from 'aws-sdk';

export interface Options {
    prefix?: string;
    ssm?: SSM;
    ssmConfig?: {};
    withDecryption?: boolean;
}

export async function getParameterStoreValues<T extends {}>(
    paths: string[], 
    options: Options = {},
): Promise<T> {
    const psPaths = options.prefix ? paths.map(v => `${options.prefix}${v}`) : paths;
    const psParameters = {
        Names: psPaths,
        WithDecryption: options.withDecryption ?? true,
    };
    const ssm = options.ssm ?? new SSM(options.ssmConfig);
    const { Parameters } = await ssm.getParameters(psParameters).promise();
    const values: Record<string, string | undefined> = {};

    Parameters?.forEach((value: SSM.Parameter) => {
        if (!value.Name) {
            return;
        }

        values[value.Name] = value.Value;
    });

    return Promise.resolve(values as T);
}
