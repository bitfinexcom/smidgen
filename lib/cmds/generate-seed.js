'use strict'

const crypto = require('crypto')
const smidgen = require('../smidgen.js')

module.exports = (exports = generateSeed)
function generateSeed (iota, opts = { json: false }, cb) {
  let seed = ''

  const characters = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const randomValues = crypto.randomBytes(256)

  for (let i = 0; i < 256 && seed.length < 81; i++) {
    const rid = randomValues[i]
    if (rid > 242) continue
    seed += characters.charAt(rid % 27)
  }

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
