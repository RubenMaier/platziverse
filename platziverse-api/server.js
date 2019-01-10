'use strict'

const http = require('http')
const express = require('express') // creara una funcion que se ejecutara cada vez que se genere una peticion a nuestro servidor
const chalk = require('chalk')
const debug = require('debug')('platziverse:api')

const api = require('./api')

const app = express()
const server = http.createServer(app)

// un middleware son funciones que se ejecuta antes de que la petición llegue a la ruta final
app.use('/api', api)

// middleware que maneja errores
app.use((err, req, res, next) => {
  debug(`Error: ${err.mensaje}`)
  if (err.mensaje.match(/no encontrado/)) {
    res.status(404).send({ error: err.mensaje }) // en este caso el codigo que le enviamos le indica que no se encontro algo
  }
  res.status(500).send({ error: err.mensaje }) // le comunico server error
})

function handlerFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.ensaje}`)
  console.error(err.stack) // muestro el stack traise
  process.exit(1) // matamos el proceso, el uno es el "exit could" que me indica que se termino con error
}

process.on('uncaughtException', handlerFatalError)
process.on('unhandledRejection', handlerFatalError)

const puerto = process.env.POST || 3000
server.listen(puerto, () => {
  console.log(`${chalk.green('[platziverse-api')} server escuchando en el puerto ${puerto}`)
})
