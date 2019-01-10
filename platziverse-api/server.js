'use strict'

const http = require('http')
const express = require('express') // creara una funcion que se ejecutara cada vez que se genere una peticion a nuestro servidor
const chalk = require('chalk')

const api = require('./api')

const app = express()
const server = http.createServer(app)

// un middleware son funciones que se ejecuta antes de que la petición llegue a la ruta final
app.use('/api', api)

const puerto = process.env.POST || 3000
server.listen(puerto, () => {
  console.log(`${chalk.green('[platziverse-api')} server escuchando en el puerto ${puerto}`)
})
