'use strict'

const test = require('ava')
const request = require('supertest') // es como una herramienta para hacer petciones http con aserciones

const server = require('../server')

test.serial.cb('/api/agents', t => {
  request(server) // aca le deberiamos pasar una instancia del servidor que vamos a utilizar
    .get('/api/agents') // ejecuto una peticion a la siguiente url
    .expect(200) // deberia devolverme 200
    .expect('Content-Type', /json/) // el contenido deberia ser un json
    .end((err, res) => { // aserciones encadenadas
      t.falsy(err, 'No retornó un error')
      let body = res.body
      t.deepEqual(body, {}, 'el body que un objeto vacio como esperabamos')
      t.end() // solo necesito el .end con los .cb puesto que debo indicarle que termina el callback
    })
}) // cb = callback, utilizamos supertest que trabaja con callback no con async-await
