# express-version-router

[![view on npm](http://img.shields.io/npm/v/express-version-router.svg)](https://www.npmjs.org/package/express-version-router)
[![view on npm](http://img.shields.io/npm/l/express-version-router.svg)](https://www.npmjs.org/package/express-version-router)
[![npm module downloads](http://img.shields.io/npm/dt/express-version-router.svg)](https://www.npmjs.org/package/express-version-router)
[![Dependency Status](https://david-dm.org/lirantal/express-version-router.svg)](https://david-dm.org/lirantal/express-version-router)

## What is this?

This npm package provides an ExpressJS middleware to load route controllers based on api versions.

## Usage

Create a map where the key is the version of the supported controller, and the value is a regular ExpressJS route function signature.


```js
const versionRouter = require('express-version-router')

const routesMap = new Map()
routesMap.set('1.0', (req, res, next) => {
  return res.status(200).json('hello to you version 1.0');
})
```

Then, on the route which you wish to version, call the `route` function of this module with the map you created:

```js
router.get('/test', versionRouter.route(routesMap))
```

## How it works

A requested version from the client must be available on the request object at `req.version`.
You are encouraged to use this module's twin: [express-version-request](https://github.com/lirantal/express-version-request) which is another simple ExpressJS middleware that populates `req.version` from the client's X-Api-Version header.

The key for the routes versions you define can be a non-semver format, for example: `1.0` or just `1`. Under the hood, `expression-version-router` uses the `semver` module to check if the version found on the request object at `req.version` matches the route. 

## Installation

```bash
yarn add express-version-router
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



## Author

Liran Tal <liran.tal@gmail.com>
