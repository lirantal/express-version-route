'use strict'

const test = require('ava')
const versionRouter = require('../index')

test('given a versioned router, match the route', t => {
  const v1 = '1.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    return res.out = { testVersion: v1 }
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.is(result.testVersion, v1)
})

test('given a versioned router, dont match if requestVersion is not semver syntax', t => {
  const v1 = '1.0'
  const requestedVersion = '1.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    return res.out = { testVersion: v1 }
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.falsy(result)
})

test('given a versioned router, dont match the requestVersion if no match exists', t => {
  const v1 = '1.0'
  const requestedVersion = '3.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    return res.out = { testVersion: v1 }
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.falsy(result)
})

test('given 2 versions, first version matches', t => {
  const v1 = '1.0'
  const v2 = '2.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v1, (req, res, next) => {
    return res.out = { testVersion: v1 }
  })

  routesMap.set(v2, (req, res, next) => {
    return res.out = { testVersion: v2 }
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.is(result.testVersion, v1)
})

test('given 2 versions, second version matches so the map insertion order doesnt count', t => {
  const v1 = '1.0'
  const v2 = '2.0'
  const requestedVersion = '1.0.0'

  const routesMap = new Map()
  routesMap.set(v2, (req, res, next) => {
    return res.out = { testVersion: v2 }
  })

  routesMap.set(v1, (req, res, next) => {
    return res.out = { testVersion: v1 }
  })

  const middleware = versionRouter.route(routesMap)
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.is(result.testVersion, v1)
})

test('when no version mapping is provided, dont match any route', t => {
  const requestedVersion = '1.0.0'

  const middleware = versionRouter.route()
  const req = {
    version: requestedVersion
  }

  const result = middleware(req, {}, () => {})
  t.falsy(result)
})
