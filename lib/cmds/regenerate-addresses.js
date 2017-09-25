'use strict'

const { series } = require('async')
const singleLineLog = require('single-line-log').stdout

const smidgen = require('../smidgen.js')
const generateAddress = require('./generate-address.js')
const getSeed = require('../get-seed.js')

module.exports = (exports = regenerateAddresses)

function regenerateAddresses (
  iota,
  seed,
  opts = { amount: 25, json: false, depth: 4, mwm: 14 },
  cb
) {
  let counter = opts.amount

  if (!opts.json) {
    singleLineLog(`${counter} addresses left`)
  }

  const tasks = []
  for (let i = 0; i < opts.amount; i++) {
    const task = (cb) => {
      generateAddress(iota, seed, opts, (err, data) => {
        counter--
        if (!opts.json) {
          singleLineLog(`${counter} addresses left`)
        }

        if (err) return cb(err)

        cb(null, data)
      })
    }

    tasks.push(task)
  }

  series(tasks, (err, res) => {
    if (err) return cb(err)
    cb(null, res)
  })
}

const usage = 'Usage: smidgen regenerate-addresses ' +
              '    [--amount | --json | --depth | --mwm | --provider]'
exports.cli = cli
exports.cli.usage = usage

function cli (_, cb) {
  getSeed((err, seed) => {
    if (err) return cb(err)

    if (!smidgen.config.json) {
      smidgen.log.info('', `Regenerating ${smidgen.config.amount} addresses...`)
    }

    regenerateAddresses(smidgen.iota, seed, smidgen.config, (err, res) => {
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
        console.log('')
        smidgen.log.info('info', '', 'Address generation finished and attached to tangle.')
        smidgen.log.info('info', '', 'Attached to:')
        res.forEach((el) => {
          console.log(el)
        })

        return cb(null)
      }

      console.log(JSON.stringify(res))
      return cb(null)
    })
  })
}
