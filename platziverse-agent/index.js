'use strict'

const EventEmitter = require('events') // viene en el core de nodejs
const debug = require('debug')('platziverse:agent')
const mqtt = require('mqtt') // es el cliente en este caso y no lo usamos como consola sino como libreria
const defaults = require('defaults')
const { parsePayload } = require('./utils')
const uuid = require('uuid')
const os = require('os')
const util = require('util')

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
    this._metricas = new Map()
  }

  addMetric(tipo, funcion) {
    this._metricas.set(tipo, funcion)
  }

  removeMetric(type) {
    this._metricas.delete(tipo)
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
        this._timer = setInterval(async () => { // creamos el intervalo
          if(this._metricas.size > 0) { // si tengo al menos una metrica...
            let mensaje = {
              agent: {
                uuid: this._agenteID,
                username: opciones.username,
                name: opciones.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              },
              metrics: [], // enviamos las metricas como array vacio
              timestamp: new Date().getTime()
            }
            for(let [ metrica, funcion] of this._metricas) { // iteramos todas las metricas que tenemos en el mapa de metricas (hacemos destructuring)
              if(funcion.length == 1) { // si tiene un argumento es porque es callback
                funcion = util.promisify(funcion) // convertimos funciones de callback a funciones de promesa (a partir de node 8)
              }
              mensaje.metrics.push({
                type: metrica,
                value: await Promise.resolve(funcion())
              })
            }
            debug('Enviando', mensaje)
            cliente.publish('agent/message', JSON.stringify(mensaje))
            this.emit('mesagge', mensaje)
          }
        }, opciones.interval) // El tiempo lo tomamos de las opciones que nos pasan
      })
      cliente.on('message', (topic, payload) => { // vemos si redistibuirlo o no
        payload = parsePayload(payload) // convertimos de string a JSON object
        // retransmito el mensaje, o no, dependiendo de ciertas condiciones
        let broadcast = false // por defecto no retransmito
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
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
      this._cliente.end()
    }
  }
}

module.exports = PlatziverseAgent
