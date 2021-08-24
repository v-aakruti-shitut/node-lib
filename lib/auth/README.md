# Auth

## This module wraps helper functions around authentication and authorization to simplify development 

- Requires
```
tough-cookie
google-auth-library
request-promise
```

- Basic Initialization - freeipa or google client
```
const Auth = require('@kelchy/auth')
//const auth = new Auth.Freeipa('sg', 'telco', 'domain.com')
const auth = new Auth.Google('sg', 'telco', 'domain.com')
```
- Custom client options - override baseUrl for freeipa instead of the tenant specific default endpoints
```
const auth = new Auth.Freeipa('sg', 'telco', 'domain.com', { baseUrl: 'https://freeipa.domain.net' })
```
- Custom client options - override clientId for google instead of the tenant specific default clientId
```
const auth = new Auth.Google('sg', 'telco', 'domain.com', { clientId: 'xxxx123yyy456zzz789' })
```
- Turn internal logging on
```
const Log = require('@kelchy/log')
const auth = new Auth.Google('sg', 'telco', 'domain.com', { log: new Log.Standard() })
```

- supported methods
```
generateToken(id, secret) - create an access token, given the credentials
isTokenValid(token) - check if access token is valid
isOperationAllowed(token, scope) - check if scope is allowed given the token
getMetadata(token) - get metadata associated with token

```
