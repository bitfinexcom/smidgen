'use strict'

const crypto = require('crypto')

module.exports = (exports = generateSeed)
function generateSeed (opts = { json: false }) {
  let seed = ''

  const characters = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const randomValues = crypto.randomBytes(256)

  for (let i = 0; i < 256 && seed.length < 81; i++) {
    const rid = randomValues[i]
    if (rid > 242) continue
    seed += characters.charAt(rid % 27)
  }

  if (opts.json) {
    return { seed: seed }
  }

  return seed
}

exports.cli = cli
function cli (opts = { json: false }, cb) {
  console.log(generateSeed(opts))
}
