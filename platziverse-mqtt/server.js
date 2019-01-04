'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca') // para crear el servidor
const redis = require('redis')
const chalk = require('chalk') // para tener colores en la terminal
const db = require('./../platziverse-db')

const { parsePayload } = require('./utils') // somo me extrae la funcion parsePayload de la libreria utilidades

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

const config = { // vuelvo al modelo clasico sin exportar de manera loca asi termino con el curso y despues veo que onda
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

// instanciamos el servidor
const server = new mosca.Server(settings) // es un eventEmitter (agregamos funcionalidades cuando el servidor me lance eventos)

// servicios que por ahora estaran indefinidos
let Agent, Metric

// creamos una referencia de todos los agentes que tenemos conectados
const clients = new Map()

// como recibiremos los distintos eventos a la red (cliente conectandose o desconectandose, publicando mensajes en el servidor, etc)
server.on('clientConnected', client => {
  // evento de cliente que se conecta al servidor
  debug(`Cliente conectado con id: ${client.id} RRRRRRRRRR`) // id que autogenera mqtt
  clients.set(client.id, null) // almaceno el cliente conectado al mapa
})

server.on('clientDisconnected', async client => {
  // evento de cliente que se desconecta del servidor
  debug(`Cliente desconectado con id: ${client.id} TTTTTTTTTTTT`) // id que autogenera mqtt
})

server.on('published', async (packet, client) => {
  // mensaje publicado dado un paquete y un cliente
  // topic es el tipo el mensaje (agentConnected, agentDisconnected o agentMessage)
  switch (packet.topic) {
    case 'agent/connected':
      debug(`${chalk.white(`Recibido por el cliente de id: ${packet.topic} ASD1`)}`)
    case 'agent/disconnected':
      debug(`${chalk.white(`Recibido por el cliente de id: ${packet.topic} ASD1`)}`)
      debug(`Informacion que nos ha llegado: ${packet.payload} ASD2`) // payload es el contenido
      break
    case 'agent/message':
      debug(`${chalk.white(`Recibido por el cliente de id: ${packet.topic} ASD1`)}`)
      debug(`${chalk.yellow(`Informacion que nos ha llegado: ${packet.payload} ASD3`)}`)
      const payload = parsePayload(packet.payload)
      debug(`${chalk.blue(`Aca va el payload: ${payload}`)}`)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e) // salgo e la funcion y solo espero agentes con buena informacion, el resto los ignoro
        }
        debug(`Agente con id ${agent.uuid} guardado ASD4`)
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
        // almacenamos las metricas
        for (let metric of payload.metrics) { // itero sobre el arreglo y for of me soporta async await
          let m // almacenamos una metrica
          try { // garantizamos que la metrica sea efectivamente creada
            m = await Metric.create(agent.uuid, metric)
          } catch (e) { // si tenemos un error la ignoramos
            return handleError(e)
          }
          debug(`La metrica ${m.id} fue almacenada en el agente ${agent.uuid}`)
        }
      }
      break
    default:
      debug(`${chalk.gray(`Recibido por el cliente de id: ${packet.topic} ASD1`)}`)
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

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1) // tiramos el servidor cerrando el proceso
}
function handleError (err) {
  console.error(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack) // no mata al proceso
}

// cuando tenemos un excepcion que no fue manejada (pasa a nivel del proceso) lo debemos manejar...
process.on('uncaughtException', handleFatalError)

// lo mismo para las promesas
process.on('unhandledRejection', handleFatalError)
