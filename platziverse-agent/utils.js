'use strict'

function parsePayload (payload) {
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

module.exports = {
  parsePayload
}
