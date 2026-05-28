'use strict'

const semver = require('semver')
const { RouteVersionUnmatchedError } = require('./errors')

class versionRouter {
  static route (versionsMap = new Map(), options = new Map()) {
    return (req, res, next) => {
      var versionArray = []
      for (let [versionKey, versionRouter] of versionsMap) {
        versionArray.push(versionKey)
        if (this.checkVersionMatch(req.version, versionKey)) {
          return this.dispatchRoute(versionRouter, req, res, next)
        }
      }

      if (options.useMaxVersion) {
        const maxVersion = semver.maxSatisfying(versionArray, req.version)
        if (maxVersion) {
          for (let [versionKey, versionRouter] of versionsMap) {
            if (this.checkVersionMatch(maxVersion, versionKey)) {
              return versionRouter(req, res, next)
            }
          }
        }
      }

      const defaultRoute = this.getDefaultRoute(versionsMap)
      if (defaultRoute) {
        return defaultRoute(req, res, next)
      }

      return next(new RouteVersionUnmatchedError(`${req.version} doesn't match any versions`))
    }
  }

  static checkVersionMatch (requestedVersion, routeVersion) {
    return semver.valid(requestedVersion) && semver.satisfies(requestedVersion, routeVersion)
  }

  static getDefaultRoute (options = new Map()) {
    return options.get('default')
  }

  static dispatchRoute (versionRoute, req, res, next) {
    if (!Array.isArray(versionRoute)) {
      return versionRoute(req, res, next)
    }

    let currentIndex = 0
    const dispatch = (err) => {
      if (err) {
        return next(err)
      }

      const route = versionRoute[currentIndex]
      currentIndex += 1

      if (!route) {
        return next()
      }

      return route(req, res, dispatch)
    }

    return dispatch()
  }
}

module.exports = versionRouter
