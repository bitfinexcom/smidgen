'use strict'

const smidgen = require('../smidgen.js')
const pkg = require('../../package.json')
const versionIotaLib = pkg.dependencies['iota.lib.js']

exports.cli = cliHelp
exports.cli.usage = 'Usage: smidgen help'

const omitCmds = [ 'crypto' ]

function cliHelp ([ cmd ], cb) {
  if (cmd) {
    printDetail(cmd)
    return cb(null)
  }
  const cmds = Object.keys(smidgen.commands)
    .filter((cmd) => {
      return omitCmds.indexOf(cmd) === -1
    })
    .join(', ')

  console.log(getMainHelpText(cmds))
  cb(null)
}

function printDetail (cmd) {
  try {
    console.log(smidgen.commands[cmd].cli.usage)
  } catch (e) {
    throw new Error('no help available for ' + cmd)
  }
}

function getMainHelpText (cmds) {
  return `Usage:
smidgen <command>

Available Commands:
${cmds}

Get detailed help with:
smidgen help <command>

smidgen@${pkg.version} - iota.lib.js@${versionIotaLib} - conf: ${smidgen.smidgenconf}`
}
