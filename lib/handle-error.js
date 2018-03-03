'use strict'

const log = require('npmlog')
const pkg = require('../package.json')
const versionIotaLib = pkg.dependencies['iota.lib.js']

function handleError (err) {
  if (!err) {
    process.exit(1)
  }

  if (/COMMAND attachToTangle/.test(err.message)) {
    err = new Error([
      'Could not attach to Tangle.',
      'To attach to the Tangle you need to connect to a full node.',
      'Use --provider to switch node.'
    ].join('\n'))
    err.type = 'EUSAGE'
  }
  
  if (/Request Error: reference transaction is too old/.test(err.message)) {
    err = new Error([
      'Could not promote transaction.',
      'The transaction is too old to promote, try with reattach.'
    ].join('\n'))
    err.type = 'EUSAGE'
  }
  
  if (/Request Error: starting tip failed consistency check/.test(err.message)) {
    err = new Error([
      'Could not promote transaction.',
      'Starting tip failed consistency check.'
    ].join('\n'))
    err.type = 'EUSAGE'
  }

  if (/Invalid Response/.test(err.message)) {
    err = new Error([
      'Received invalid response from node.',
      'Retry command or try to use another node.',
      '',
      'Use --provider to switch node.'
    ].join('\n'))
    err.type = 'EUSAGE'
  }

  if (/Not enough balance/.test(err.message)) {
    err = new Error([
      'It seems the address has not enough balance. This is not an error in smidgen.',
      'You can check your balance with: `smidgen get-balance <your-address>`',
      '',
      'Maybe one or more transfers to this address are not confirmed by the network yet?',
      'Try reattaching / replaying the bundle.',
      '',
      'After a recent snapshot, run: `smidgen regenerate-addresses`'
    ].join('\n'))
    err.type = 'EUSAGE'
  }

  if (err.type === 'EUSAGE') {
    if (Array.isArray(err.message.split('\n'))) {
      err.message.split('\n').forEach(el => log.error(el))
    } else if (err.message) {
      log.error(err.message)
    }
    process.exit(1)
  }

  err.message && log.error(err.message)

  if (err.stack) {
    log.error('', err.stack)
    log.error('', '')
    log.error('', '')
    log.error('', 'smidgen:', pkg.version, '- iota.lib.js:', versionIotaLib, '- node:', process.version)
    log.error('', 'please open an issue including this log on ' + pkg.bugs.url)
  }
  process.exit(1)
}

module.exports = handleError
