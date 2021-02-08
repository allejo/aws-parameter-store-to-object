import { SSM } from 'aws-sdk';
import { getParameterStoreValues } from '../index';

describe('getParameterStoreValues', () => {
    function MockSSM(values: Record<string, string>) {
        return {
            getParameters({ Names }: { Names: string[], WithDecryption: boolean }) {
                return {
                    promise: () => Promise.resolve({
                        Parameters: Names.map(name => ({
                            Name: name,
                            Value: values[name],
                        })),
                    }),
                };
            }
        };
    }

    function ssmFactory(...args: Parameters<typeof MockSSM>): SSM {
        return MockSSM(...args) as SSM;
    }

    it('should generate an object with all strings', async () => {
        interface ExpectedShape {
            arg1: string;
        }

        const ssm = ssmFactory({
            '/application/argument_1': 'hello world',
        });
        const parameters = await getParameterStoreValues<ExpectedShape>({
            '/application/argument_1': 'arg1',
        }, { ssm });

        expect(parameters.arg1).toEqual('hello world');
    });

    it('should handle prefix for Parameter Store paths', async () => {
        interface ExpectedShape {
            dbUser: string;
            dbPass: string;
        }

        const ssm = ssmFactory({
            '/applications/foo_app/db_user': 'root',
            '/applications/foo_app/db_pass': 'hunter2',
        });
        const parameters = await getParameterStoreValues<ExpectedShape>({
            'db_user': 'dbUser',
            'db_pass': 'dbPass',
        }, { ssm: ssm, prefix: '/applications/foo_app/' });

        expect(parameters.dbUser).toEqual('root');
        expect(parameters.dbPass).toEqual('hunter2');
    });

    it('should cast values based on functions', async () => {
        interface ExpectedShape {
            userID: number;
            apiKey: string;
        }

        const ssm = ssmFactory({
            '/application/foo_app/user_id': '4200',
            '/application/foo_app/api_key': 'abcdef1234567890',
        });
        const parameters = await getParameterStoreValues<ExpectedShape>({
            'user_id': { userID: (value?: string) => value ? Number.parseInt(value) : 0 },
            'api_key': 'apiKey',
        }, { ssm, prefix: '/application/foo_app/' });

        expect(typeof parameters.userID).toEqual('number');
        expect(parameters.userID).toEqual(4200);
    });
});
