# express-version-route

[![Greenkeeper badge](https://badges.greenkeeper.io/lirantal/express-version-route.svg)](https://greenkeeper.io/)

[![view on npm](http://img.shields.io/npm/v/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![view on npm](http://img.shields.io/npm/l/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![npm module downloads](http://img.shields.io/npm/dt/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![Dependency Status](https://david-dm.org/lirantal/express-version-route.svg)](https://david-dm.org/lirantal/express-version-route)
[![Known Vulnerabilities](https://snyk.io/test/github/lirantal/express-version-route/badge.svg)](https://snyk.io/test/github/lirantal/express-version-route)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md
)

This npm package provides an ExpressJS middleware to load route controllers based on api versions.

Implementing API Versioning in 15 lines of code:

![](https://pbs.twimg.com/media/DDcLgNQXkAARLIX.jpg:small)

now any request would be handled with the appropriate route handler in accordance to `request.version`.

## Usage

Create a map where the key is the version of the supported controller, and the value is a regular ExpressJS route function signature.

```js
const versionRouter = require('express-version-route')

const routesMap = new Map()
routesMap.set('1.0', (req, res, next) => {
  return res.status(200).json({'message': 'hello to you version 1.0'})
})
```

Then, on the route which you wish to version, call the `route` function of this module with the map you created:

```js
router.get('/test', versionRouter.route(routesMap))
```

If no route matches the version requested by a client then the next middleware in the chain will be called.
To set a route fallback incase no version matches set a 'default' key on the routes map, for example:

```js
routesMap.set('default', (req, res, next) => {
  return res.status(200).json({'message': 'hello to you, this is the default route'})
})
``` 

## Usage with TypeScript

```ts
import * as versionRouter from 'express-version-route'
import { Router, Handler } from 'express';

const router = express.Router();
const routesMap = new Map<string, Handler>();

routesMap.set('1.0', (req, res, next) => {
  return res.status(200).json({'message': 'hello to you version 1.0'})
})

routesMap.set('default', (req, res, next) => {
  return res.status(200).json({'message': 'hello to you, this is the default route'})
})

router.get('/test', versionRouter.route(routesMap))
```

## How it works

### The Library

A requested version from the client must be available on the request object at `req.version`.
You are encouraged to use this module's twin: [express-version-request](https://github.com/lirantal/express-version-request) which is another simple ExpressJS middleware that populates `req.version` from the client's X-Api-Version header, Accept header or from a query string (such as 'api-version=1.0.0')

The key for the routes versions you define can be a non-semver format, for example: `1.0` or just `1`. Under the hood, `expression-version-route` uses the `semver` module to check if the version found on the request object at `req.version` matches the route. 

### Client-Server flow

1. An API client will send a request to your API endpoint with an HTTP header that specifies the requested version of the API to use: 
```bash
curl --header "X-Api-Version: 1.0.0" https://www.example.com/api/users
```

2. The `express-version-request` library will parse the `X-Api-Version` and sets ExpressJS's `req.version` property to 1.0.0.
3. The `express-version-route` library, when implemented like the usage example above will match the 1.0 route version because semver will match 1.0.0 to 1.0, and then reply with the JSON payload `{'message': 'hello to you version 1.0'}`.  


## Installation

```bash
yarn add express-version-route
```

## TypeScript Support

```bash
yarn add --dev @types/express-version-route
```

_Note: Don't forget to add types for Express as well!_

## Tests

```bash
yarn test
```

Project linting:

```bash
yarn lint
```

## Coverage

```bash
yarn test:coverage
```

## Commit

The project uses the commitizen tool for standardizing changelog style commit
messages so you should follow it as so:

```bash
git add .           # add files to staging
yarn commit      # use the wizard for the commit message
```

## On API Versioning...

An API versioning is a practice that enables services to evolve their APIs with new changes, signatures and the overall API contract without interrupting API consumers and forcing them to repeatedly make changes in order to keep in pace with changes to APIs.

Several methodologies exist to version your API:
* URL: A request specifies the version for the resource: `http://api.domain.com/api/v1/schools/3/students`
* Query String: A request specifies the resource in a query string: `http://api.domain.com/api/schools/3/students?api-version=1`
* Custom HTTP Header: A request to a resource `http://api.domain.com/api/schools/3/students` with a custom HTTP header set in the request `X-Api-Version: 1`
* MIME Type content negotiation: A request to a resource `http://api.domain.com/api/schools/3/students` with an `Accept` header that specifies the requested content and its version: `Accept: application/vnd.ecma.app-v2+json`

There is no strict rule on which methodology to follow and each has their own pros and cons. The RESTful approach is the semantic mime-type content negotiation, but a more pragmatic solution is the URL or custom HTTP header.

### Why API Versioning at all ?

Upgrading APIs with some breaking change would lead to breaking existing products, services or even your own frontend web application which is dependent on your API contract. By implementing API versioning you can ensure that changes you make to your underlying API endpoints are not affecting systems that consume them, and using a new version of an API is an opt-in on the consumer. [read more...](https://apigee.com/about/blog/technology/restful-api-design-tips-versioning)

## Alternative Node.js libraries

Several npm projects exist which provide similar API versioning capabilities to ExpressJS projects, and I have even contributed Pull Requests to some of them that provide fixes or extra functionality but unfortunately they all seem to be unmaintained, or buggy.

* https://github.com/Prasanna-sr/express-routes-versioning
* https://github.com/elliotttf/express-versioned-routes
* https://github.com/biowink/express-route-versioning

## Author

Liran Tal <liran.tal@gmail.com>
