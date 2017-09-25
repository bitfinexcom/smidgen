'use strict'

const assert = require('assert')

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')
const { testWasAddressUsed } = require('../addresses.js')
const { getBalanceForSeed } = require('./get-balance.js')

module.exports = (exports = transfer)

function transfer (
  iota,
  opts = { json: false, depth: 4, mwm: 14, force: false },
  address,
  amount,
  seed,
  cb
) {
  assert.equal(
    typeof address,
    'string',
    'address must be a string'
  )

  assert.equal(
    typeof amount,
    'number',
    'value must be a number'
  )

  assert.equal(
    typeof seed,
    'string',
    'value must be a string'
  )

  if (address.length === 81) {
    address = iota.utils.addChecksum(address)
  }

  const transfers = [{
    address: address,
    value: amount,
    message: '',
    tag: ''
  }]

  getBalanceForSeed(iota, { json: false }, seed, (err, balance) => {
    if (err) return cb(err)

    if (amount > balance) {
      const err = new Error(`Not enough IOTA available. Available: ${balance}i`)
      err.type = 'EUSAGE'
      return cb(err)
    }

    testWasAddressUsed(iota, address, (err, used) => {
      if (err) return cb(err)

      if (used && !opts.force) {
        const err = new Error([
          'Address was already used. Use --force if you really want to continue.',
          'Warning: This can lead to a loss of IOTA!'
        ].join('\n'))
        err.type = 'EUSAGE'
        return cb(err)
      }

      transfer()
    })
  })

  function transfer () {
    iota.api.sendTransfer(seed, opts.depth, opts.mwm, transfers, (err, data) => {
      if (err) return cb(err)

      cb(null, data)
    })
  }
}

const usage = 'Usage: smidgen transfer <value> <address> \n' +
  ' [--json | --depth | --mwm | --force | --provider]'
exports.cli = cli
exports.cli.usage = usage

function cli ([ amount, address ], cb) {
  amount = +amount

  const reason = validateInputs(smidgen.iota, address, amount)
  if (reason) {
    const err = new Error([
      reason,
      usage
    ].join('\n'))
    err.type = 'EUSAGE'
    return cb(err)
  }

  getSeed((err, seed) => {
    if (err) return cb(err)
    transfer(smidgen.iota, smidgen.config, address, amount, seed, (err, transaction) => {
      if (err) return cb(err)

      if (smidgen.config.json) {
        console.log(JSON.stringify({ ok: true, transaction }))
        return cb(null)
      }

      smidgen.log.info('', `Successfully sent ${amount}i to ${address}`)
      const hash = transaction[0].hash
      smidgen.log.info('', `Transaction sent, hash: ${hash}`)
      smidgen.log.info('', `Reattach with \`smidgen reattach ${hash}\``)
      return cb(null)
    })
  })
}

function validateInputs (iota, address, amount) {
  if (!address || !amount) {
    return 'Address and amount must be defined'
  }

  const val = parseInt(amount, 10)
  if (Number.isNaN(val)) {
    return 'Amount must be an integer'
  }

  if (Math.floor(amount) !== amount) {
    return 'Amount must be an integer'
  }

  if (!iota.valid.isAddress(address)) {
    return `Address "${address}" is invalid`
  }

  if (address.length === 90 && !iota.utils.isValidChecksum(address)) {
    return `Address "${address}" is invalid`
  }

  return null
}
