'use strict'

const http = require('http')
const express = require('express')
const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const path = require('path') // para no crear rutas a mano y que sean compatibles con cualquier SO
const socketio = require('socket.io')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server) // integramos socketio y express
/* 
  socketio se encargar de crear un ruta dentro de mi servidor de express
  que contendra el codigo de javascript del cliente para luego meterlo en el html
  y se encargara de hacer la conexion con el servidor y obtener info bidireccional
*/

app.use(express.static(path.join(__dirname, 'public'))) // __dirname contiene la ruta desde la raiz hasta donde estamos posicionados ahora, y alado le indicamos donde queremor ir

// escuchamos el evento connect que cuando se conecta un cliente nos entrega un socket
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  // escucho el mensaje agent/message con tal payload que el cliente me dice a mi (servidor)
  socket.on('agent/message', payload => {
    console.log(payload)
  })

  // aca uso Ecmascript2016
  setInterval(() => { // emito un mensaje del servidor al cliente
    socket.emit('agent/message', { agent: 'xxx-yyyy' })
  }, 2000)
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
})
