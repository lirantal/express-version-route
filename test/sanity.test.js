'use strict'

const test = require('ava')
const versionRouter = require('../index')
const { RouteVersionUnmatchedError } = require('../errors')

test('given a versioned router, match the route', t => {
  const v1 = '1.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v1)
})

test('given a versioned router, dont match if requestVersion is not semver syntax', t => {
  const v1 = '1.0'
  const requestedVersion = '1.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.falsy(result)
})

test('given a versioned router, dont match the requestVersion and error out if no match exists', t => {
  const v1 = '1.0'
  const requestedVersion = '3.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  const nextHandler = (err) => {
    return err
  }

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  let resIn = null
  const result = middleware(req, resIn, nextHandler)
  t.falsy(resIn)
  t.truthy(result instanceof Error)
  t.truthy(result instanceof RouteVersionUnmatchedError)
  t.true(result.name === 'RouteVersionUnmatchedError')
  t.true(result.message === `${requestedVersion} doesn't match any versions`)
})

test('given 2 versions, first version matches', t => {
  const v1 = '1.0'
  const v2 = '2.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v1)
})

test('given 2 overlapping matching versions, first match wins', t => {
  const v1 = '>=1.0'
  const v2 = '>=2.0'
  const requestedVersion = '2.0.0'

  const routesMap = new Map()
  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v2)
})

test('given 2 versions, second version matches so the map insertion order doesnt count', t => {
  const v1 = '1.0'
  const v2 = '2.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v1)
})

test('when no version mapping is provided, dont match any route', t => {
  const requestedVersion = '1.0.0'

  const middleware = versionRouter.route()
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.falsy(result)
})

test('given 2 versions and a default, if no match is found the default route should be used', t => {
  const v1 = '1.0'
  const v2 = '2.0'
  const requestedVersion = '3.0.0'

  const routesMap = new Map()
  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  routesMap.set('default', (req, res, next) => {
    res.out = { testVersion: 'default' }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, 'default')
})

test('given 2 versions, max version matches', t => {
  const v1 = '1.2.0'
  const v2 = '1.2.3'
  const requestedVersion = '1.2'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap, { useMaxVersion: true })
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v2)
})

test('given 2 versions, if no max version default matches', t => {
  const v1 = '1.2.0'
  const v2 = '1.2.3'
  const v3 = 'default'
  const requestedVersion = '1.2'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    res.out = { testVersion: v1 }
    return res.out
  })

  routesMap.set(v2, (req, res, next) => {
    res.out = { testVersion: v2 }
    return res.out
  })

  routesMap.set(v3, (req, res, next) => {
    res.out = { testVersion: v3 }
    return res.out
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => { })
  t.is(result.testVersion, v3)
})
