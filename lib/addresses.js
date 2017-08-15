'use strict'

exports.testWasAddressUsed = testWasAddressUsed
function testWasAddressUsed (iota, address, cb) {
  iota.api.findTransactionObjects({ addresses: [ address ] }, (err, data) => {
    if (err) return cb(err)

    cb(null, data.length > 1)
  })
}
