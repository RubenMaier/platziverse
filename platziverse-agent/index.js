'use strict'

const EventEmitter = require('events') // viene en el core de nodejs

class PlatziverseAgent extends EventEmitter {
  constructor(opciones) {
    super()

    this._timer = null // referencia interna del timer que vamos a tener
    this._started = false // comenzamos con el timer no inicializado (sin arrancar)
    this._opciones = opciones // referencia interna de las opciones
  }

  connect() {
    if (!this._started) { // lo hace algo si el timer no esta conectado o activado
      const opciones = this._opciones // solo para no andar escribiendo tanto
      this._started = true // luego de iniciar el timer, efectivamente marcamos que esto si inicializo
      this.emit('connected')
      this._timer = setInterval(() => { // creamos el intervalo
        this.emit('agent/message', 'Esto es un mensaje que te va a poner a gozar') // emitimos un evento cada X cantidad de tiempo
      }, opciones.interval) // El tiempo lo tomamos de las opciones que nos pasan
    }
  }

  disconnect() {
    if (this._started) { // nos desconectamo solo si el servicio esta inicializado
      clearInterval(this._timer) // paramos el intervalo con la referencia
      this._started = false // marcamos el estado como off
      this.emit('disconnect') // emitimos el evento de desconexion
    }
  }
}

module.exports = PlatziverseAgent
