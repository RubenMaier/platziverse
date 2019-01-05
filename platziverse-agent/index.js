'use strict'

const EventEmitter = require('events') // viene en el core de nodejs

class PlatziverseAgent extends EventEmitter {
    constructor() {
        super()
    }
}

module.exports = PlatziverseAgent