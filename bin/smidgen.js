#!/usr/bin/env node

'use strict'

const nopt = require('nopt')

const smidgen = require('../lib/smidgen.js')
const handleError = require('../lib/handle-error.js')

process.on('uncaughtException', handleError)

const parsed = nopt({
  'json': [ Boolean ]
}, {'v': 'v'}, process.argv, 2)

const cmd = parsed.argv.remain.shift()

smidgen.load(parsed, (err) => {
  if (err) throw err

  if (!cmd || !smidgen.cli[cmd]) {
    return smidgen.cli.help(() => {})
  }

  smidgen
    .cli[cmd](smidgen.config, () => {})
})
