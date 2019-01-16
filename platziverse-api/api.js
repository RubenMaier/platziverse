'use strict'

const debugDB = require('debug')('platziverse:api:db')
const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const { crearConfig } = require('platziverse-utils')
const asyncify = require('express-asyncify')
const auth = require('express-jwt') // middleware para autenticar rutas (aseguramos ruta por ruta)

const api = asyncify(express.Router()) // instancia de router en express
// tuve que llamar a las rutas con asyncify porque node no soporta middlewares con async-await todavia, y esta herramienta
// me proporciona una solucion a este problema

let servicios, Agent, Metric

const config = crearConfig(false, debugDB)

config.auth = {
  secret: process.env.SECRET || 'platzi'
}

api.use('*', async (req, res, next) => {
  if (!servicios) {
    debug('Conectando la DB')
    try {
      servicios = await db(config)
    } catch (err) {
      return next(err)
    }
    Agent = servicios.Agent
    Metric = servicios.Metric
  }
  next()
})

// auth tiene como argumento la llave secreta con la que son encriptados los jwt
api.get('/agents', auth(config.auth), async (req, res, next) => { // la ruta puede tener asociado tantos middleware como gustemos separados por como ANTES del handler que en este caso es esa funcion async
  debug('consulta de /agents')
  const { user } = req
  if(!user || !user.username) {
    return next(new Error('No autorizado'))
  }
  let agents = []
  try {
    if(user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (e) {
    return next(e)
  }
  res.send(agents) // el método send me permite enviarle al usuario un objeto que le llega en formato json
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`consulta de /agent/${uuid}`)
  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    // ejecuto la funcion next de esta ruta
    const err = new Error(`Agente no encontrado con la uuid ${uuid}`)
    return next(err)
  }
  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`consulta de /metrics/${uuid}`)
  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`No se encontraron metricas para el agente con uuid ${uuid}`))
  }
  res.send(metrics)
})

api.get('/metrics/:uuid/:tipo', async (req, res, next) => {
  const { uuid, tipo } = req.params
  debug(`consulta de /metrics/${uuid}/${tipo}`)
  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(tipo, uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`No se encontraron metricas de tipo ${tipo} para el agente con uuid ${uuid}`))
  }
  res.send(metrics)
})

module.exports = api
