'use strict'

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')

module.exports = (exports = getBalance)
function getBalance (iota, opts = { json: false }, seed, cb) {
  const startIndex = 0
  const endIndex = 49

  iota.api.getInputs(seed, { start: startIndex, end: endIndex }, (err, inputs) => {
    if (err) return cb(err)

    const balance = inputs.totalBalance

    if (opts.json) {
      return cb(null, { balance: balance })
    }

    cb(null, balance)
  })
}

exports.cli = cli
function cli (_, cb) {
  getSeed((err, seed) => {
    if (err) return cb(err)

    getBalance(smidgen.iota, smidgen.config, seed, (err, res) => {
      if (err) return cb(err)

      if (smidgen.config.json) {
        console.log(JSON.stringify(res))
        return cb(null)
      }

      const converted = smidgen.iota.utils.convertUnits(res, 'i', 'Mi')

      console.log(`Balance: ${res} (${converted} Mi)`)
      return cb(null)
    })
  })
}
