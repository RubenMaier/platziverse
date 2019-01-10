'use strict'

const debug = require('debug')('platziverse:api')
const http = require('http')
const chalk = require('chalk')
const express = require('express') // creara una funcion que se ejecutara cada vez que se genere una peticion a nuestro servidor

const api = require('./api')

const puerto = process.env.POST || 3000
const app = express()
const server = http.createServer(app)

// un middleware son funciones que se ejecuta antes de que la petición llegue a la ruta final
app.use('/api', api)

// middleware que maneja errores
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)
  if (err.message.match(/no encontrado/)) {
    return res.status(404).send({ error: err.message }) // en este caso el codigo que le enviamos le indica que no se encontro algo
  }
  return res.status(500).send({ error: err.message }) // le comunico server error
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack) // muestro el stack traise
  process.exit(1) // matamos el proceso, el uno es el "exit could" que me indica que se termino con error
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(puerto, () => {
  console.log(`${chalk.green('[platziverse-api')} server escuchando en el puerto ${puerto}`)
})
