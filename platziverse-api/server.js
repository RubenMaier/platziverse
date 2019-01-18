'use strict'

const debug = require('debug')('platziverse:api')
const http = require('http')
const chalk = require('chalk')
const express = require('express') // creara una funcion que se ejecutara cada vez que se genere una peticion a nuestro servidor
const asyncify = require('express-asyncify')
const { middlewareDeErrores, handleFatalError } = require('platziverse-utils')

const api = require('./api')

const puerto = process.env.POST || 3000
const app = asyncify(express()) // tambien necesito que mi express soporte funciones asincronas por lo que debo usar asyncify
const server = http.createServer(app)

// un middleware son funciones que se ejecuta antes de que la petición llegue a la ruta final
app.use('/api', api)

// middleware que maneja errores
app.use(middlewareDeErrores(debug))

if (!module.parent) { // se ejecuta si este archivo no es requerido por alguien mas
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(puerto, () => {
    console.log(`${chalk.green('[platziverse-api')} server escuchando en el puerto ${puerto}`)
  })
}

module.exports = server
