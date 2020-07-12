'use strict'

const chalk = require('chalk')

const secretKey = {
  secret: process.env.SECRET || 'platzi'
}

const endpoint = process.env.API_ENDPOINT || 'http://localhost:3001'
const apiToken = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBsYXR6aSIsImFkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwiaWF0IjoxNTQ3NzY1MTc5fQ.XU7u5t1q0-M2pnCLvfLsMU9LuoRs1Ey5wLNVWOmLnQ8'
const serverHost = process.env.SERVER_HOST || 'http://localhost:8080'
/*
para crear ese token hicimos lo siguiente:
1) con la terminal nos fuimos al directorio platziverse-api
2) ejecutamos node
3) escribimos lo siguiente:
var auth = require('./auth')
auth.firmar({username: 'platzi', admin: true, permissions: ['metrics:read']}, 'platzi', console.log)
4) el retorno de esta ejecucion nos genero el token de interes
*/

function parsePayload(payload) {
  // si el payload es un buffer...
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8') // necesitamos que sea un string para hacer un jsonParse
  }

  // chequeamos por si las dudas si el payload no es un json y llega a ser otra estructura...
  try {
    payload = JSON.parse(payload)
  } catch (e) {
    payload = null
  }
  return payload
} // payload = contenido

function extend(obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function crearConfigDB(valor, debug) {
  return {
    // informacion que necesita sequelize para funcionar
    database: process.env.DB_NAME || 'platziverse', // queremos poder tener este modulo configurable
    username: process.env.DB_USER || 'platzi', // vamos a pasar variables de entorno
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres', // sequelize nos permite trabajar con mysql, oracle, etc... aca decimos
    // con que tipo de db trabajamos, y sequelize simplifica todo sin tener que tocar el codigo
    logging: s => debug(s), // hacemos un debug para saber que tipo de datos esta devolviendo la db
    // recordar correr "npm i debug --save"
    // para que se muestren log debo tener una variable de entorno configurada
    setup: valor // esta propiedad es util para definir si crear la db o no
    // true: borra - false: no borra
  }
}

function pipe(EmiterFuente, EmiterTarget) { // pipe entre el agente y el socket.io
  if (!EmiterFuente || !EmiterTarget) {
    throw TypeError('Por favor envia un EventEmitter como argumentos')
  }

  const emit = EmiterFuente.emit // creo que .emit y ._emit son dos formas de referenciar a lo mismo
  // el posta era : const emit = EmiterFuente._emit = EmiterFuente.emit

  /*
    En la constante emit se obtiene el método original emit ya que este sera sobreescrito en el EmiterFuente.

    En el EmiterFuente sera sobreescrito para que al momento que se le invoque su metodo .emit con ciertos argumentos
    tambien se emita el metodo .emit del objeto EmiterTarget con esos mismos argumentos.
    El .emit del EmiterFuente es llamado puesot que EmiterFuente en este caso es el agent que es una instancia de la
    clase PlatziverseAgent donde en diversos momento se invoca a this.emit(topic, payload) y entonces lo sobreescribimos
    para obtener esos argumentos y pasarlo mediante el método apply al contexto de target y de la constante emit y sean emitidos
    inmediatamente juntas.

    Arguments es un objeto de javascript que recibe todos los argumentos de la función
  */

  EmiterFuente.emit = function () { // la redefinimos
    emit.apply(EmiterFuente, arguments) // ejecuta la funcion emit con los parametros "arguments" en forma matricial y la funcion tendra como su this al elemento EmiterFuente
    EmiterTarget.emit.apply(EmiterTarget, arguments) // hacemos ejecutar tambien el del Target con los mismos argumentos para replicar
    // return EmiterFuente
  }
}

function middlewareDeErrores(debug) {
  return function (err, req, res, next) {
    debug(`Error: ${err.message}`)
    if (err.message.match(/no encontrado/)) {
      return res.status(404).send({ error: err.message }) // en este caso el codigo que le enviamos le indica que no se encontro algo
    }
    return res.status(500).send({ error: err.message }) // le comunico server error
  }
}

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack) // muestro el stack traise
  process.exit(1) // matamos el proceso, el uno es el "exit could" que me indica que se termino con error
}

module.exports = {
  crearConfigDB,
  parsePayload,
  extend,
  secretKey,
  pipe,
  endpoint,
  apiToken,
  middlewareDeErrores,
  handleFatalError,
  serverHost
}
