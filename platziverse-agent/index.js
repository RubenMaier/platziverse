'use strict'

const EventEmitter = require('events') // viene en el core de nodejs
const debug = require('debug')('platziverse:agent')
const mqtt = require('mqtt') // es el cliente en este caso y no lo usamos como consola sino como libreria
const defaults = require('defaults')
const { parsePayload } = require('platziverse-utils')
const uuid = require('uuid')
const os = require('os')
const util = require('util')

// configuro parametros por defecto
const opcionesDefaults = {
  name: 'untitled',
  username: 'platzi',
  interval: 5000, // 5 segundos
  mqtt: { // host de comunicacion
    host: 'mqtt://localhost' // en este caso se encuentra local (aca se encuentra el servidor mqtt)
  }
}

class PlatziverseAgent extends EventEmitter {
  constructor (opciones) {
    super()

    this._timer = null // referencia interna del timer que vamos a tener
    this._started = false // comenzamos con el timer no inicializado (sin arrancar)
    this._opciones = defaults(opciones, opcionesDefaults) // referencia interna de las opciones
    this._cliente = null
    this._agenteID = null
    this._metricas = new Map()
  }

  addMetric (tipo, funcion) {
    this._metricas.set(tipo, funcion)
  }

  removeMetric (tipo) {
    this._metricas.delete(tipo)
  }

  connect () {
    if (!this._started) { // lo hace algo si el timer no esta conectado o activado
      this._cliente = mqtt.connect(this._opciones.mqtt.host) // nos conectamos al cliente
      // nos suscribimos a cada uno de los topicos
      this._cliente.subscribe('agent/message')
      this._cliente.subscribe('agent/connected')
      this._cliente.subscribe('agent/disconnected') // este mismo cliente nos notificara cuando recibamos mensajes del servidor mqtt
      this._cliente.on('connect', () => { // el cliente mqtt tiene un evento de connect y cuando nos conectemos a él ejecutamos lo siguiente..
        // solo emito esto si estoy conectado a mi servidor mqtt
        this._agenteID = uuid.v4() // creamos un id unico para nuestro agente ayudandonos de una libreria llamada 'uuid'
        this.emit('connected', this._agenteID) // esto se transmite solo en este agente, no al servidor mqtt, ojo
        this._timer = setInterval(async () => { // creamos el intervalo
          this._started = true // luego de iniciar el timer, efectivamente marcamos que esto si inicializo
          if (this._metricas.size > 0) { // si tengo al menos una metrica...
            let mensaje = {
              agent: {
                uuid: this._agenteID,
                username: this._opciones.username,
                name: this._opciones.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              },
              metrics: [], // enviamos las metricas como array vacio
              timestamp: new Date().getTime()
            }
            for (let [metrica, funcion] of this._metricas) { // iteramos todas las metricas que tenemos en el mapa de metricas (hacemos destructuring)
              if (funcion.length === 1) { // si tiene un argumento es porque es callback
                funcion = util.promisify(funcion) // convertimos funciones de callback a funciones de promesa (a partir de node 8)
              }
              mensaje.metrics.push({
                type: metrica,
                value: await Promise.resolve(funcion())
              })
            }
            debug('Enviando', mensaje)
            this._cliente.publish('agent/message', JSON.stringify(mensaje))
            this.emit('message', mensaje)
          }
        }, this._opciones.interval) // El tiempo lo tomamos de las opciones que nos pasan
      })
      // cuando este cliente reciba un mensaje...
      this._cliente.on('message', (topic, payload) => { // vemos si redistibuirlo o no
        payload = parsePayload(payload) // convertimos de string a JSON object
        // retransmito el mensaje, o no, dependiendo de ciertas condiciones
        let broadcast = false // por defecto no retransmito
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agenteID // asi me aseguro de no retransmitir mis propios mensajes
            break
        }
        if (broadcast) {
          this.emit(topic, payload) // lo retransmito si es correcto
        }
      })
      this._cliente.on('error', () => this.disconnect()) // si ocurre un error nos desconectamos
    }
  }

  disconnect () {
    if (this._started) { // nos desconectamo solo si el servicio esta inicializado
      clearInterval(this._timer) // paramos el intervalo con la referencia
      this._started = false // marcamos el estado como off
      this.emit('disconnected', this._agenteID) // emitimos el evento de desconexion
      this._cliente.end()
    }
  }
}

module.exports = PlatziverseAgent
