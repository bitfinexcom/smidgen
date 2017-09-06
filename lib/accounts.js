'use strict'

exports.getKeyIndex = getKeyIndex
function getKeyIndex (iota, opts = { security: 2 }, seed, cb) {
  iota.api.getAccountData(seed, opts, (err, res) => {
    if (err) return cb(err)

    if (res.inputs.length === 0) {
      return cb(null, 0)
    }

    return cb(null, res.inputs[0].keyIndex)
  })
}
