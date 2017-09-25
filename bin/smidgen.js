#!/usr/bin/env node

'use strict'

const nopt = require('nopt')

const smidgen = require('../lib/smidgen.js')
const handleError = require('../lib/handle-error.js')

process.on('uncaughtException', handleError)

const parsed = nopt({
  'json': [ Boolean ],
  'depth': [ Number ],
  'mwm': [ Number ],
  'watch': [ Boolean ],
  'force': [ Boolean ],
  'provider': [ String ],
  'threshold': [ Number ],
  'security': [ Number ],
  'balance': [ Number ],
  'amount': [ Number ]

}, {}, process.argv, 2)

const cmd = parsed.argv.remain.shift()

smidgen.load(parsed, (err) => {
  if (err) return handleError(err)

  if (!cmd || !smidgen.cli[cmd]) {
    return smidgen.cli.help([], () => {})
  }

  smidgen
    .cli[cmd](parsed.argv.remain, (err) => {
      if (err) handleError(err)
    })
})
