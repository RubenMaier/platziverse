'use strict'

const http = require('http')
const express = require('express')
const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const path = require('path') // para no crear rutas a mano y que sean compatibles con cualquier SO

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

app.use(express.static(path.join(__dirname, 'public'))) // __dirname contiene la ruta desde la raiz hasta donde estamos posicionados ahora, y alado le indicamos donde queremor ir

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// manejo de llamadas sincronas como de promesas
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('platziverse-web')} servidor esuchando en el puerto ${port}`)
})
