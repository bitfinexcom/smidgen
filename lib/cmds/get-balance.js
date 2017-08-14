'use strict'

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const singleLineLog = require('single-line-log').stdout

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

    if (smidgen.config.watch) {
      return watchBalance(smidgen.iota, smidgen.config, seed, cb)
    }

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

function watchBalance (iota, config, seed, cb) {
  let msg = ''
  let seconds = 0
  const interval = 15
  let intervalStarted = false

  singleLineLog('updating...')

  function startInterval () {
    setInterval(() => {
      seconds++
      if (smidgen.config.json) {
        return singleLineLog(msg)
      }

      singleLineLog(msg + `${seconds}s since last update`)
    }, 1000)
  }

  const startIndex = 0
  const endIndex = 49
  iota.api.getAccountData(seed, { start: startIndex, end: endIndex }, (err, data) => {
    if (err) return cb(err)

    tick(data.addresses)
  })

  function tick (addresses) {
    const threshold = 100
    iota.api.getBalances(addresses, threshold, (err, data) => {
      if (err) return cb(err)

      const res = data.balances.reduce((acc, el) => {
        acc = acc + +el
        return acc
      }, 0)

      if (smidgen.config.json) {
        msg = JSON.stringify(res)
        return cb(null)
      }

      const converted = smidgen.iota.utils.convertUnits(res, 'i', 'Mi')

      msg = `Balance: ${res} i (${converted} Mi) - `

      if (!intervalStarted) startInterval()
      intervalStarted = true

      if (seconds < interval) {
        setTimeout(() => {
          tick(addresses)
        }, (interval - seconds) * 1000)
        seconds = 0
        return
      }

      seconds = 0
      tick(addresses)
    })
  }
}
