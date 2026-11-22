'use strict'

const test = require('ava')
const versionRouter = require('../index')

const selections = [
  { name: 'exact match', version: '1.2.3', key: '1.2.3', options: {} },
  { name: 'maximum version', version: '1.2', key: '1.2.3', options: { useMaxVersion: true } },
  { name: 'default route', version: '3.0.0', key: 'default', options: {} },
  { name: 'default after no maximum', version: '3.0', key: 'default', options: { useMaxVersion: true } }
]

function routeWithHandlers (selection, handlers) {
  const routes = new Map([
    ['1.2.0', () => { throw new Error('The older route must not run') }],
    [selection.key, handlers]
  ])
  return versionRouter.route(routes, selection.options)
}

for (const selection of selections) {
  test(`${selection.name}: runs array handlers in order with the same request and response`, t => {
    const req = { version: selection.version }
    const res = { steps: [] }
    const middleware = routeWithHandlers(selection, [
      (request, response, next) => {
        t.is(request, req)
        t.is(response, res)
        response.steps.push('first')
        return next()
      },
      (request, response) => {
        t.is(request, req)
        t.is(response, res)
        response.steps.push('second')
        return response
      }
    ])

    t.is(middleware(req, res, () => t.fail('The response ended the chain')), res)
    t.deepEqual(res.steps, ['first', 'second'])
  })

  test(`${selection.name}: stops when a handler does not call next`, t => {
    const middleware = routeWithHandlers(selection, [
      () => 'response',
      () => t.fail('The following handler must not run')
    ])

    t.is(middleware({ version: selection.version }, {}, () => t.fail('Must not continue')), 'response')
  })

  test(`${selection.name}: continues after the final handler`, t => {
    const middleware = routeWithHandlers(selection, [
      (req, res, next) => next(),
      (req, res, next) => next()
    ])
    let calls = 0

    const result = middleware({ version: selection.version }, {}, err => {
      t.is(err, undefined)
      calls++
      return 'continued'
    })

    t.is(result, 'continued')
    t.is(calls, 1)
  })

  test(`${selection.name}: an empty array continues to the outer middleware`, t => {
    const middleware = routeWithHandlers(selection, [])
    let calls = 0

    const result = middleware({ version: selection.version }, {}, () => {
      calls++
      return 'continued'
    })

    t.is(result, 'continued')
    t.is(calls, 1)
  })

  for (const signal of [new Error('handler failed'), 'route', 'router']) {
    test(`${selection.name}: forwards next(${String(signal)}) without running later handlers`, t => {
      const middleware = routeWithHandlers(selection, [
        (req, res, next) => next(signal),
        () => t.fail('The signal must leave the array')
      ])
      let calls = 0

      const result = middleware({ version: selection.version }, {}, err => {
        t.is(err, signal)
        calls++
        return 'forwarded'
      })

      t.is(result, 'forwarded')
      t.is(calls, 1)
    })
  }

  test(`${selection.name}: waits for an asynchronous next call`, async t => {
    const steps = []
    const middleware = routeWithHandlers(selection, [
      (req, res, next) => {
        steps.push('first')
        setImmediate(next)
      },
      (req, res, next) => {
        steps.push('second')
        next()
      }
    ])

    await new Promise(resolve => {
      middleware({ version: selection.version }, {}, resolve)
    })

    t.deepEqual(steps, ['first', 'second'])
  })
}
