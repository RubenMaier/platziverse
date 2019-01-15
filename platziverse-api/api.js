'use strict'

const debugDB = require('debug')('platziverse:api:db')
const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const { crearConfig } = require('platziverse-utils')
const asyncify = require('express-asyncify')

const api = asyncify(express.Router()) // instancia de router en express
// tuve que llamar a las rutas con asyncify porque node no soporta middlewares con async-await todavia, y esta herramienta
// me proporciona una solucion a este problema

let servicios, Agent, Metric

const config = crearConfig(false, debugDB)

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

api.get('/agents', async (req, res, next) => {
  debug('consulta de /agents')
  let agents = []
  try {
    agents = await Agent.findConnected()
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
