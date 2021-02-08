import { SSM } from 'aws-sdk';

// From jcalz: https://stackoverflow.com/a/60873215
type ExactlyOneKey<K extends keyof any, V, KK extends keyof any = K> =
    { [P in K]: { [Q in P]: V } &
        { [Q in Exclude<KK, P>]?: undefined } extends infer O ?
        { [Q in keyof O]: O[Q] } : never
    }[K];

export interface Options {
    prefix?: string;
    ssm?: SSM;
    ssmConfig?: {};
    withDecryption?: boolean;
}

export async function getParameterStoreValues<
    I extends object,
    M extends object = ExactlyOneKey<keyof I, (v?: string) => I[keyof I]>,
>(
    valMapping: Record<string, string | M>,
    options: Options = {},
): Promise<Partial<I>> {
    const paths = Object.keys(valMapping);
    const psPaths = options.prefix ? paths.map(v => `${options.prefix}${v}`) : paths;
    const psParameters = {
        Names: psPaths,
        WithDecryption: options.withDecryption ?? true,
    };
    const ssm = options.ssm ?? new SSM(options.ssmConfig);
    const { Parameters } = await ssm.getParameters(psParameters).promise();
    const values: Partial<I> = {};

    Parameters?.forEach((value: SSM.Parameter) => {
        if (!value.Name) {
            return;
        }

        const psKey: string = value.Name.replace(options?.prefix ?? '', '');
        const valueKey = valMapping[psKey];

        if (typeof valueKey === 'string') {
            values[valueKey as keyof I] = value.Value as any;
        } else {
            const [key, casting] = Object.entries(valueKey as M)[0];
            values[key as keyof I] = casting(value.Value);
        }
    });

    return Promise.resolve(values);
}
