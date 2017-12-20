'use strict'

const assert = require('assert')
const async = require('async')

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const { testWasAddressUsed } = require('../addresses.js')
const { getBalanceForSeed } = require('./get-balance.js')

module.exports = (exports = transfer)

function transfer (
  iota,
  opts = { json: false, depth: 4, mwm: 14, force: false },
  transfers,
  seed,
  cb
) {
  assert.ok(
    Array.isArray(transfers),
    'transfers must be an array'
  )

  const fullTransfers = getFullTransferObjects(iota, transfers)
  const overallOutput = getOverallOutput(fullTransfers)

  getBalanceForSeed(iota, { json: false }, seed, (err, balance) => {
    if (err) return cb(err)

    if (overallOutput > balance) {
      const err = new Error(`Not enough IOTA available. Available: ${balance}i`)
      err.type = 'EUSAGE'
      return cb(err)
    }

    if (opts.force) return transfer()

    checkTransfers(iota, fullTransfers, (err, res) => {
      if (err) return cb(err)

      if (!res.length) return transfer()

      const msg = res.map((el) => {
        return `Was used: ${el.address}`
      })

      msg.unshift('Seems the following addresses were used already:')
      msg.push('Use --force if you really want to continue.')
      msg.push('Warning: This can lead to a loss of IOTA!')

      const usageErr = new Error(msg.join('\n'))
      usageErr.type = 'EUSAGE'

      return cb(usageErr)
    })
  })

  function transfer () {
    iota.api.sendTransfer(seed, opts.depth, opts.mwm, fullTransfers, (err, data) => {
      if (err) return cb(err)

      cb(null, data)
    })
  }
}

function checkTransfers (iota, fullTransfers, cb) {
  const task = (transfer, cb) => {
    testWasAddressUsed(iota, transfer.address, (err, used) => {
      if (err) return cb(err)

      const res = { address: transfer.address, used: used }
      return cb(null, res)
    })
  }

  const limit = 5
  async.mapLimit(fullTransfers, limit, task, (err, res) => {
    if (err) return cb(err)

    const usedAddresses = res.filter((el) => {
      return el.used
    })

    cb(null, usedAddresses)
  })
}

exports.getFullTransferObjects = getFullTransferObjects
function getFullTransferObjects (iota, transfers, opts = { removeChecksum: false }) {
  const meta = { message: '', tag: '' }

  const fullTransfers = transfers.map((t) => {
    if (!opts.removeChecksum && t.address.length === 81) {
      t.address = iota.utils.addChecksum(t.address)
    }

    if (opts.removeChecksum) {
      t.address = iota.utils.noChecksum(t.address)
    }

    return Object.assign({}, meta, t)
  })

  return fullTransfers
}

exports.getOverallOutput = getOverallOutput
function getOverallOutput (transfers) {
  const overallOutput = transfers.reduce((acc, el) => {
    acc = acc + el.value
    return acc
  }, 0)

  return overallOutput
}

const usage = 'Usage: smidgen transfer <value> <address> [value address ...]\n' +
  ' [--json | --depth | --mwm | --force | --provider]'
exports.cli = cli
exports.cli.usage = usage

function cli (outputs, cb) {
  const parsedOutputs = parseOutputs(outputs)

  const errors = parsedOutputs.reduce((acc, el) => {
    const { address, value } = el

    const err = validateInputs(smidgen.iota, address, value)

    if (err) acc.push(err)

    return acc
  }, [])

  if (errors.length) {
    const err = new Error([
      errors[0],
      usage
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  getSeed((err, seed) => {
    if (err) return cb(err)

    transfer(smidgen.iota, smidgen.config, parsedOutputs, seed, (err, transaction) => {
      if (err) return cb(err)

      if (smidgen.config.json) {
        console.log(JSON.stringify({ ok: true, transaction }))
        return cb(null)
      }

      const hash = transaction[0].hash
      smidgen.log.info('', `Transaction sent, hash: ${hash}`)
      smidgen.log.info('', `Reattach with \`smidgen reattach ${hash}\``)
      return cb(null)
    })
  })
}

exports.validateInputs = validateInputs
function validateInputs (iota, address, amount) {
  if (!address || !amount) {
    return new Error('Address and amount must be defined')
  }

  const val = parseInt(amount, 10)
  if (Number.isNaN(val)) {
    return new Error('Amount must be an integer, got:' + amount)
  }

  if (Math.floor(amount) !== amount) {
    return new Error('Amount must be an integer, got:' + amount)
  }

  if (!iota.valid.isAddress(address)) {
    return new Error(`Address "${address}" is invalid`)
  }

  if (address.length === 90 && !iota.utils.isValidChecksum(address)) {
    return new Error(`Address "${address}" is invalid`)
  }

  return null
}

exports.parseOutputs = parseOutputs
function parseOutputs (outputs) {
  const o = outputs.reduce((acc, el, i) => {
    if ((i + 1) % 2 === 0) { // address
      const tmp = acc.pop()
      tmp.address = el
      acc.push(tmp)
      return acc
    }

    const item = { value: +el }

    acc.push(item)
    return acc
  }, [])

  return o
}
