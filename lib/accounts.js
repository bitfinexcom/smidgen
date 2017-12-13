'use strict'

exports.maybeGetKeyIndex = maybeGetKeyIndex
function maybeGetKeyIndex (iota, opts = { security: 2, validation: true }, seed, cb) {
  if (opts.validation === false) return cb(null, 0)

  iota.api.getAccountData(seed, opts, (err, res) => {
    if (err) return cb(err)

    if (res.inputs.length === 0) {
      return cb(null, 0)
    }

    return cb(null, res.inputs[0].keyIndex)
  })
}
