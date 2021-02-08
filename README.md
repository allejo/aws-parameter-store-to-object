# AWS Parameter Store to Object (JavaScript)

In the spirit of the dependency hell that is the JavaScript world, here is a simple function that I ended up reusing a lot at work to query parameters from AWS' Parameter Store.

## Installation

```bash
npm add @allejo/aws-parameter-store-to-object
# or
yarn add @allejo/aws-parameter-store-to-object
```

## Usage

```typescript
import { getParameterStoreValues } from '@allejo/aws-parameter-store-to-object';

interface Settings {
    appID: number;
    installID: number;
    ghOrg: string;
    privateKey: string;
}

const strToNum = (value?: string) => value ? Number.parseInt(value) : 0;
const variables = await getParameterStoreValues<Settings>(
    {
        app_id: { appID: strToNum },
        installation_id: { installID: strToNum },
        gh_org: 'ghOrg',
        private_key: 'privateKey',
    },
    {
        prefix: '/application/github_application/',
    }
);

// variables.appID
// variables.installID
// etc.
```
