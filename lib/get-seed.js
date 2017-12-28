'use strict'

const read = require('read')
const IOTA = require('iota.lib.js')
const iota = new IOTA()

function getSeed (cb) {
  read({ prompt: 'Enter your seed:', silent: true }, (err, seed) => {
    if (err) return err

    if (!seed.length) {
      const err = new Error([
        'Seems you pressed "Enter" without copy & pasting your seed.',
        '',
        'Did you copy & paste the seed into the terminal?'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (seed.length < 81) {
      const err = new Error([
        'Seed must be at least 81 chars.',
        '',
        'Did you copy & paste the seed into the terminal?'
      ].join('\n'))
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (!iota.valid.isTrytes(seed)) {
      const err = new Error('Invalid seed')
      err.type = 'EUSAGE'
      return cb(err)
    }

    cb(null, seed)
  })
}

module.exports = getSeed
