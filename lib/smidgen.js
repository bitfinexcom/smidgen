'use strict'

const fs = require('fs')
const path = require('path')

const commandsDir = path.join(__dirname, 'cmds')

const smidgen = {
  config: null
}

module.exports = (exports = smidgen)

let commandFuncs = {}
let cliFuncs = {}

Object.defineProperty(smidgen, 'commands', {
  get: () => {
    if (!smidgen.config) {
      throw new Error('run smidgen.load before')
    }
    return commandFuncs
  }
})

Object.defineProperty(smidgen, 'cli', {
  get: () => {
    if (!smidgen.config) {
      throw new Error('run smidgen.load before')
    }
    return cliFuncs
  }
})

exports.load = load
function load (opts, cb) {
  fs.readdir(commandsDir, (err, res) => {
    if (err) return err
    const c = populateCommands(cliFuncs, commandFuncs, res)
    cliFuncs = c.cliFuncs
    commandFuncs = c.commandFuncs

    // fake config until file based config is implemented
    smidgen.config = opts

    cb(null, smidgen)
  })
}

exports.populateCommands = populateCommands
function populateCommands (cliFuncs, commandFuncs, list) {
  const cli = {}
  const command = {}

  list.filter((file) => {
    return /\.js$/.test(file)
  }).forEach((file) => {
    const cmdName = path.basename(file, '.js')
    const cmd = require(path.join(commandsDir, file))

    cli[cmdName] = cmd.cli
    command[cmdName] = cmd
  })

  return {
    cliFuncs: cli,
    commandFuncs: command
  }
}
