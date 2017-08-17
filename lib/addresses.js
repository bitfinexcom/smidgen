'use strict'

exports.testWasAddressUsed = testWasAddressUsed
function testWasAddressUsed (iota, address, cb) {
  iota.api.findTransactionObjects({ addresses: [ address ] }, (err, data) => {
    if (err) return cb(err)

    const foundSpent = data.filter((transaction) => {
      return transaction.value < 0
    })

    cb(null, foundSpent.length > 0)
  })
}
