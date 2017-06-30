'use strict'

const log = require('npmlog')
const pkg = require('../package.json')

function handleError (err) {
  if (!err) {
    process.exit(1)
  }

  if (err.type === 'EUSAGE') {
    err.message && log.error(err.message)
    process.exit(1)
  }

  err.message && log.error(err.message)

  if (err.stack) {
    log.error('', err.stack)
    log.error('', '')
    log.error('', '')
    log.error('', 'smidgen:', pkg.version, 'node:', process.version)
    log.error('', 'please open an issue including this log on ' + pkg.bugs.url)
  }
  process.exit(1)
}

module.exports = handleError
