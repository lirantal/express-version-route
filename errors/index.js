'use strict'
class RouteVersionUnmatchedError extends Error {
  get name () {
    return this.constructor.name
  }
}

module.exports = {
  RouteVersionUnmatchedError
}
