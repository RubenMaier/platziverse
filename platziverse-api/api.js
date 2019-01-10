'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')

const api = express.Router() // instancia de router en express

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
