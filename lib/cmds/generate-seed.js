'use strict'

const unif = require('secure-random-uniform')
const smidgen = require('../smidgen.js')

module.exports = (exports = generateSeed)
function generateSeed (iota, opts = { json: false }, cb) {
  const alphabet = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let seed = ''
  for (let i = 0; i < 81; i++) seed += alphabet[unif(alphabet.length)]

  if (opts.json) {
    return cb(null, { seed: seed })
  }

  return cb(null, seed)
}

const usage = 'Usage: smidgen generate-seed [--json] '
exports.cli = cli
exports.cli.usage = usage
function cli (_, cb) {
  generateSeed(smidgen.iota, smidgen.config, (err, res) => {
    if (err) return cb(err)

    if (smidgen.config.json) {
      console.log(JSON.stringify(res))
      return cb(null)
    }

    console.log(res)
    return cb(null)
  })
}
