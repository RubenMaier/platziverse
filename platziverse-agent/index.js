'use strict'

const EventEmitter = require('events') // viene en el core de nodejs
const debug = require('debug')('platziverse:agent')
const mqtt = require('mqtt') // es el cliente en este caso y no lo usamos como consola sino como libreria
const defaults = require('defaults')
const { parsePayload } = require('./utils')
const uuid = require('uuid')

// configuro parametros por defecto
const opcionesDefaults = {
  name: 'untitled',
  username: 'platzi',
  interval: 5000, // 5 segundos
  mqtt: { // host de comunicacion 
    host: 'mqtt://localhost' // en este caso se encuentra local
  }
}

class PlatziverseAgent extends EventEmitter {
  constructor(opciones) {
    super()

    this._timer = null // referencia interna del timer que vamos a tener
    this._started = false // comenzamos con el timer no inicializado (sin arrancar)
    this._opciones = defaults(opciones, opcionesDefaults) // referencia interna de las opciones
    this._cliente = null
    this._agenteID = null
  }

  connect() {
    if (!this._started) { // lo hace algo si el timer no esta conectado o activado
      const opciones = this._opciones // solo para no andar escribiendo tanto
      this._cliente = mqtt.connect(opciones.mqtt.host)
      const cliente = this._cliente
      // nos suscribimos a cada uno de los topicos
      cliente.subscribe('agent/message')
      cliente.subscribe('agent/connect')
      cliente.subscribe('agent/disconnect') // este mismo cliente nos notificara cuando recibamos mensajes del servidor mqtt
      cliente.on('connect', () => { // cuando este cliente se conecte ejecutamos el siguiente bloque
        // solo emito esto si estoy conectado a mi servidor mqtt
        this._started = true // luego de iniciar el timer, efectivamente marcamos que esto si inicializo
        this._agenteID = uuid.v4() // creamos un id unico para nuestro agente ayudandonos de una libreria llamada 'uuid'
        this.emit('connected', this._agenteID) // esto se transmite solo en este agente, no al servidor mqtt, ojo
        this._timer = setInterval(() => { // creamos el intervalo
          this.emit('agent/message', 'Esto es un mensaje que te va a poner a gozar') // emitimos un evento cada X cantidad de tiempo
        }, opciones.interval) // El tiempo lo tomamos de las opciones que nos pasan
      })
      cliente.on('massage', (topic, payload) => { // vemos si redistibuirlo o no
        payload = parsePayload(payload) // convertimos de string a JSON object
        // retransmito el mensaje, o no, dependiendo de ciertas condiciones
        let broadcast = false // por defecto no retransmito
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/massage':
            broadcast = payload && payload.agent && payload.agent.uuid != this._agenteID // asi me aseguro de no retransmitir mis propios mensajes
            break
        }
        if (broadcast) {
          this.emit(topic, paylaod) // lo retransmito si es correcto
        }
      })
      this._cliente.on('error', () => this.disconnect()) // si ocurre un error nos desconectamos
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
