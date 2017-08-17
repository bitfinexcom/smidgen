'use strict'

const smidgen = require('../smidgen.js')
const pkg = require('../../package.json')

exports.cli = cliHelp

const omitCmds = [ 'crypto' ]

function cliHelp (cb) {
  const cmds = Object.keys(smidgen.commands)
    .filter((cmd) => {
      return omitCmds.indexOf(cmd) === -1
    })
    .join(', ')

  console.log(getMainHelpText(cmds))
  cb(null)
}

function getMainHelpText (cmds) {
  return `Usage:
smidgen <command>

Available Commands:
${cmds}

smidgen@${pkg.version}`
}
