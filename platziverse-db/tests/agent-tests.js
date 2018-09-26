'use strict'

// exportamos la funcion de test
const test = require('ava') // recordar que debemos instalarlo con npm a modo de dependencia de desarrollo:
// instalamos "npm install --save-dev ava"

test('este test pasa siempre', t => { // es un pequeño test que no falla nunca
  t.pass() // le decimos que lo pase
}) // recordar definir el script para correr las pruebas en el package.json
// el flag --verbose me permite obtener infromacion de cada test ejecutado por el script

// queremos verificar que el agente exista
// este agente es el que va a devolver la funcion de config de la base de datos
// cada vez que ejecutamos un test necesitamos hacer una instancia de la DB

let db = null

// no queremos una conexion real a la DB
// queremos una DB de prueba...
let config = {
  logging: function () {} // desabilitamos el logging
}

// ava tiene "hooks", podemos correr funciones antes de cada uno de los test:
test.beforeEach(async () => { // antes de cada uno de los test ejecuta la siguiente funcion asincrona
  const setupDatabase = require('../') // requiere el modulo de configuracion de DB (que seria el index)
  db = await setupDatabase(config) // define una variable global de DB
})

test('Agent', t => {
  t.truthy(db.Agent, 'El servicio de Agente deberia existir') // existe un valor distinto de 0 o vacio
})
