# express-version-route

[![view on npm](http://img.shields.io/npm/v/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![view on npm](http://img.shields.io/npm/l/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![npm module downloads](http://img.shields.io/npm/dt/express-version-route.svg)](https://www.npmjs.org/package/express-version-route)
[![Dependency Status](https://david-dm.org/lirantal/express-version-route.svg)](https://david-dm.org/lirantal/express-version-route)

## What is this?

This npm package provides an ExpressJS middleware to load route controllers based on api versions.

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

## How it works

### The Library

A requested version from the client must be available on the request object at `req.version`.
You are encouraged to use this module's twin: [express-version-request](https://github.com/lirantal/express-version-request) which is another simple ExpressJS middleware that populates `req.version` from the client's X-Api-Version header or from a query string (such as 'api-version=1.0.0')

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

## Alternatives

Several npm projects exist which provide similar API versioning capabilities to ExpressJS projects, and I have even contributed Pull Requests to some of them that provide fixes or extra functionality but unfortunately they all seem to be unmaintained, or buggy.

* https://github.com/Prasanna-sr/express-routes-versioning
* https://github.com/elliotttf/express-versioned-routes
* https://github.com/biowink/express-route-versioning

## Author

Liran Tal <liran.tal@gmail.com>
