'use strict'

const test = require('ava')
const request = require('supertest') // es como una herramienta para hacer petciones http con aserciones
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const AgentFixtures = require('platziverse-fixtures/agent')

let sandbox = null
let server = null // aca vamos a hacer el stub
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => { // en este hook vamos a piratear el servidor
  sandbox = sinon.createSandbox()
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({ // cuando llame la funcion dbStub quiero que me retorne un objeto con mis Stub de Metrica y Agente como servicios falsos
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(AgentFixtures.connected)) // cuando ejecute findConnected me va a devolver AgentFixtures.connected

  const api = proxyquire('../api', {
    'platziverse-db': dbStub // cada vez que hagan un require de platziverse-db usted me debe retornar dbStub
  }) // obtenemos el modulo de api pero con proxyquire para poder sorbeescribirlo con los Stub

  server = proxyquire('../server', {
    './api': api // retorno la api que creamos antes para asi devolverla ya con los stubs
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore() // asi sandbox esta creado entonces lo reinicio
})

test.serial.cb('/api/agents', t => {
  request(server) // aca le deberiamos pasar una instancia del servidor que vamos a utilizar
    .get('/api/agents') // ejecuto una peticion a la siguiente url
    .expect(200) // deberia devolverme 200
    .expect('Content-Type', /json/) // el contenido deberia ser un json
    .end((err, res) => { // aserciones encadenadas
      t.falsy(err, 'No retornó un error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(AgentFixtures.connected) // tine que venir este fixture
      t.deepEqual(body, expected, 'El body es igual a lo que esperabamos') // compara que sean inguales
      t.end() // solo necesito el .end con los .cb puesto que debo indicarle que termina el callback
    })
}) // cb = callback, utilizamos supertest que trabaja con callback no con async-await

test.serial.todo('/api/agent/:uuid')
test.serial.todo('/api/agent/:uuid - not found')

test.serial.todo('/api/metrics/:uuid')
test.serial.todo('/api/metrics/:uuid - not found')

test.serial.todo('/api/metrics/:uuid/:type')
test.serial.todo('/api/metrics/:uuid/:type - not found')
