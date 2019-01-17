'use strict'

const http = require('http')
const express = require('express')
const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const path = require('path') // para no crear rutas a mano y que sean compatibles con cualquier SO
const socketio = require('socket.io')
const PlatziverseAgent = require('platziverse-agent')
const { pipe } = require('platziverse-utils')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server) // integramos socketio y express
/*
  socketio se encargar de crear un ruta dentro de mi servidor de express
  que contendra el codigo de javascript del cliente para luego meterlo en el html
  y se encargara de hacer la conexion con el servidor y obtener info bidireccional
*/
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public'))) // __dirname contiene la ruta desde la raiz hasta donde estamos posicionados ahora, y alado le indicamos donde queremor ir

// escuchamos el evento connect que cuando se conecta un cliente nos entrega un socket
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket) // ttodos los eventos del agente los mande al socket

  /*  con pipe reemplace esto
  redirijo un mensaje del agente al servidor
  agent.on('agent/message', payload => {
    socket.emit('agent/message', payload)
  })

  agent.on('agent/connected', payload => {
    socket.emit('agent/connected', payload)
  })

  agent.on('agent/disconnected', payload => {
    socket.emit('agent/disconnected', payload)
  })
  */
})

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// manejo de llamadas sincronas como de promesas
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('platziverse-web')} servidor esuchando en el puerto ${port}`)
  agent.connect() // conecto el agente una vez iniciado el servidor
})
