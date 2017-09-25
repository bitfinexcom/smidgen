'use strict'

const smidgen = require('../smidgen.js')
const getSeed = require('../get-seed.js')

module.exports = (exports = generateAddress)
function generateAddress (
  iota,
  seed,
  opts = { json: false, depth: 4, mwm: 14 },
  cb
) {
  if (!iota.valid.isTrytes(seed)) {
    return cb(new Error('Invalid seed'))
  }

  iota.api.getNewAddress(seed, (err, newAddress) => {
    if (err) return cb(err)

    const transfers = [{
      address: newAddress,
      value: 0,
      message: '',
      tag: ''
    }]

    iota.api.sendTransfer(seed, opts.depth, opts.mwm, transfers, (err, attached) => {
      if (err) return cb(err)

      const res = iota.utils.addChecksum(newAddress)
      if (opts.json) {
        return cb(null, { address: res })
      }

      return cb(null, res)
    })
  })
}

const usage = 'Usage: smidgen generate-address [--json | --depth | --mwm | --provider]'
exports.cli = cli
exports.cli.usage = usage
function cli (_, cb) {
  getSeed((err, seed) => {
    if (err) return cb(err)

    if (!smidgen.config.json) {
      smidgen.log.info('', 'Generating address...')
    }

    generateAddress(smidgen.iota, seed, smidgen.config, (err, address) => {
      if (err) {
        if (/Could not complete request/.test(err.message)) {
          const er = new Error([
            'Request timed out.',
            'Try a different provider.'
          ].join('\n'))
          return cb(er)
        }

        return cb(err)
      }

      if (!smidgen.config.json) {
        smidgen.log.info('info', '', 'Address generation finished and attached to tangle.')
        smidgen.log.info('info', '', 'Attached to:')
        console.log(address)
        return cb(null)
      }

      console.log(JSON.stringify(address))
      return cb(null)
    })
  })
}
