[![CircleCI](https://circleci.com/gh/vzakharchenko/keycloak-lambda-cloudfront-ui.svg?style=svg)](https://circleci.com/gh/vzakharchenko/keycloak-lambda-cloudfront-ui)
# Integration cloudfront ui with keycloak-lambda-authorizer

# installation
```
npm i keycloak-lambda-cloudfront-ui -S
```
# Example
todo
# How To use

```javascript
import {
    getActiveTenantToken
} from 'keycloak-lambda-cloudfront-ui';
import fetch from 'axios';

// get active JWT token. (if expired, the token will be automatically updated)
const jwtToken = await getActiveTenantToken();

const res = await fetch({
    url: 'http://localhost:8080/api',
    method: 'GET',
    headers: {
        Authorization: `Bearer ${jwtToken}`
    },
    withCredentials: true,
});
```

# Functions

- **getTenants()** - list of all active tenants
- **getTenantCookie(realm, clientId)** - tenant cookie name
- **async reloadToken(realm, clientId, cookieName)** - force reload tenant jwt token
- **async getActiveTenantToken(realm, clientId)** - get active JWT token. (if expired, the token will be automatically refreshed)
- **async getDecodedTenantToken(realm, clientId)** - get payload from  JWT token;

**realm**: tenant realm  
**clientId**: tenant client
