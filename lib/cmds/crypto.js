'use strict'

module.exports = (exports = print)

function print () {
  console.log(msg)
}

exports.cli = cli
function cli (_, cb) {
  print()
  cb(null)
}

const msg = `

        ^
       <o>
    ››     ‹‹
  ››  crypto  ‹‹
 ››  we trust  ‹‹
`
