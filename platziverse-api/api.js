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

api.get('/agents', (req, res) => {
  debug('Una consulta vino de /agents')
  res.send({}) // el método send me permite enviarle al usuario un objeto que le llega en formato json
})

api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params
  if (uuid !== 'yyy') {
    // ejecuto la funcion next de esta ruta
    const err = new Error('Agente no encontrado')
    return next(err)
  }
  res.send({ uuid })
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params
  res.send({ uuid })
})

api.get('/metrics/:uuid/:tipo', (req, res) => {
  const { uuid, tipo } = req.params
  res.send({ uuid, tipo })
})

module.exports = api
