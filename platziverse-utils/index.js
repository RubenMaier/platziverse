'use strict'

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

function crearConfig(valor, debug) {
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

module.exports = {
  crearConfig,
  parsePayload,
  extend
}
