# AWS Parameter Store to Object (JavaScript)

In the spirit of the dependency hell that is the JavaScript world, here is a simple function that I ended up reusing a lot at work to query parameters from AWS' Parameter Store.

## Installation

```bash
npm install @allejo/aws-parameter-store-to-object
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

### Value Mapping

Give you have a Parameter Store key in the format of `/application/app_id`, then you will set the key of the object to the 'app_id' (this is coming from Parameter Store) and the value to 'appID' (this is the value in the object being created, i.e. `Settings`).

```javascript
{
    app_id: 'appID'
}
```

By default, everything from Parameter Store will be coming in as a string. In the situation where you'd like to convert the string to an integer, you give it an object with the key of the `Settings` object, and a callback that converts a nullable string to whatever data type the field is.

For example, if we need to convert the `app_id` Parameter Store value from a string to an integer and assign it to the `appID` field of a `Settings` object.

```typescript
{
    app_id: { appID: (val?: string) => val ? Number.parseInt(val) : 0 }
}
```
