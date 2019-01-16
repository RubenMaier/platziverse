'use strict'

// autenticacion
// nos permite crear jwt y verificar que esten correctos

// con esto no autenticamos las rutas, ojo!!

const jwt = require('jsonwebtoken')

function firmar (payload, secret, callback) { // sign | secret = llave secreta con la que firmamos el jwt
  jwt.sign(payload, secret, callback)
}

function verificar (payload, secret, callback) { // verify
  jwt.verify(payload, secret, callback)
}

module.exports = {
  firmar,
  verificar
}
