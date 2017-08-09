'use strict'

const read = require('read')
const IOTA = require('iota.lib.js')
const iota = new IOTA()

function getSeed (cb) {
  read({ prompt: 'Enter your seed:', silent: true }, (err, seed) => {
    if (err) return err
    if (!iota.valid.isTrytes(seed)) {
      const err = new Error('Invalid seed')
      err.type = 'EUSAGE'
      return cb(err)
    }

    cb(null, seed)
  })
}

module.exports = getSeed
