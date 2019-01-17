'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca') // para crear el servidor
const redis = require('redis')
const chalk = require('chalk') // para tener colores en la terminal
const db = require('platziverse-db')

const { parsePayload, crearConfig } = require('platziverse-utils') // somo me extrae la funcion parsePayload de la libreria utilidades

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  // archivo de configuracion para servidor mosca
  port: 1883, // puerto donde correra el servidor mqtt
  backend // informacion del backend
}

const config = crearConfig(false, debug)

// instanciamos el servidor
const server = new mosca.Server(settings) // es un eventEmitter (agregamos funcionalidades cuando el servidor me lance eventos)

// servicios que por ahora estaran indefinidos
let Agent, Metric

// creamos una referencia de todos los agentes que tenemos conectados
const clients = new Map()

// como recibiremos los distintos eventos a la red (cliente conectandose o desconectandose, publicando mensajes en el servidor, etc)
server.on('clientConnected', client => {
  // evento de cliente que se conecta al servidor
  debug(`Cliente conectado con id: ${client.id}`) // id que autogenera mqtt
  clients.set(client.id, null) // almaceno el cliente conectado al mapa
})

server.on('clientDisconnected', async client => {
  // evento de cliente que se desconecta del servidor
  debug(`Cliente desconectado con id: ${client.id}`) // id que autogenera mqtt
  const agent = clients.get(client.id) // obtenemos el agente del mapa
  if (agent) {
    // si el agente existe y esta desconectado...
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent) // actualiza siempre porque si el objeto esta en el objeto de clients entonces esta en la DB
    } catch (e) {
      return handleError(e)
    }
    clients.delete(client.id) // como se desconecto ya no lo necesitamos en esta lista, asi que lo quitamos
    server.publish({
      // notificamos el evento de desconexion
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Cliente con id ${client.id} associado al agente con id ${agent.uuid} fue marcado como desconectado`)
  }
})

server.on('published', async (packet, client) => {
  debug(`${chalk.red(`Topic: ${packet.topic}`)}`)
  // mensaje publicado dado un paquete y un cliente
  // topic es el tipo el mensaje (agentConnected, agentDisconnected o agentMessage)
  switch (packet.topic) {
    case 'agent/connected':
      debug(`${chalk.green('Payload connected:')} ${packet.payload}`)
      break
    case 'agent/disconnected':
      debug(`${chalk.blue(`Payload disconnected:`)} ${packet.payload}`) // payload es el contenido
      break
    case 'agent/message':
      debug(`${chalk.yellow(`Payload message:`)} ${packet.payload}`)
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e) // salgo e la funcion y solo espero agentes con buena informacion, el resto los ignoro
        }
        debug(`Agente con id ${agent.uuid} guardado`)
        // notificamos que el agente fue conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          // le notificamos a todos nuestros clientes (hacemos un broucast) que estan conectados
          // y escuchando en el evento de agente conectado que un agente se conecto
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
        // almacenamos las metricas AHORA EN PARALELO
        try {
          await Promise.all(payload.metrics.map(payloadMetric => Metric.create(agent.uuid, payloadMetric)))
        } catch (e) {
          // si tenemos un error la ignoramos
          return handleError(e)
        }
      }
      break
    default:
      debug(`${chalk.gray(`TOPIC RARO: ${packet.topic}`)}`)
      break
  }
})

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric
  // este evento es lanzado cuando el servidor este listo e inicializado
  console.log(`${chalk.green('[platziverse-mqtt]')} server corriendo`)
})

/*
 * como trabajamos con emisores de eventos (eventEmitter) debemos tener en cuenta que tenemos que
 * agregar un manejador de errores por si el servidor responde asi, por lo tanto creamos un manejador
 * de errores fatales
 */
server.on('error', handleFatalError)

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1) // tiramos el servidor cerrando el proceso
}
function handleError(err) {
  console.error(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack) // no mata al proceso
}

// cuando tenemos un excepcion que no fue manejada (pasa a nivel del proceso) lo debemos manejar...
process.on('uncaughtException', handleFatalError)

// lo mismo para las promesas
process.on('unhandledRejection', handleFatalError)
