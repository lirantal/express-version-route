'use strict'

const semver = require('semver')

class versionRouter {
  static route (versionsMap = new Map(), options = new Map()) {
    return (req, res, next) => {
      for (let [versionKey, versionRouter] of versionsMap) {
        if (this.checkVersionMatch(req.version, versionKey)) {
          return versionRouter(req, res, next)
        }
      }

      return next()
    }
  }

  static checkVersionMatch (requestedVersion, routeVersion) {
    return semver.valid(requestedVersion) && semver.satisfies(requestedVersion, routeVersion)
  }
}

module.exports = versionRouter
