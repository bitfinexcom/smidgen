'use strict'

const { isTxConfirmed } = require('./transactions.js')

exports.testWasAddressUsed = testWasAddressUsed
function testWasAddressUsed (iota, address, cb) {
  iota.api.findTransactionObjects({ addresses: [ address ] }, (err, data) => {
    if (err) return cb(err)

    const foundSpent = data.filter((transaction) => {
      return transaction.value < 0
    })

    verifySpent(iota, foundSpent, (err, cb) => {

      cb(null, foundSpent.length > 0)
    })
  })
}

function verifySpent (iota, data, cb) {
  const txs = data.map((el) => {
    return el.hash
  })

  iota.api.getLatestInclusion(txs, (err, res) => {
    if (err) return cb(err)

    const spentValid = txs.filter((el, i) => {
      return res[i]
    })

    if (spentValid.length) return cb(null, true)

    const maybeInvalid = data.filter((el, i) => {
      return !res[i]
    })

    finalCheck(maybeInvalid, cb)
  })

  function finalCheck (maybeInvalid, cb) {
    getBundleFromTx(iota, maybeInvalid[0], (err, bundle) => {

    })
  }
}

function getBundleFromTx (iota, tx, cb) {
  console.log(tx)

  iota.api.findTransactions({ bundles: [ tx.bundle ] }, (err, transactions) => {
    if (err) return cb(err)
    console.log(transactions)

    iota.api.getBundle('NQDECISUYALXULHQS9ELDQKXVJ9OHT9KNUJSZBVVHLUIJR9LESOQHQTFMNUQCUAD9YXOVCYMP9IYA9999', (err, bundle) => {
      console.log(err, bundle)
      //const res =
    })

  })
}
