'use strict'

// exportamos la funcion de test
const test = require('ava') // recordar que debemos instalarlo con npm a modo de dependencia de desarrollo:
// instalamos "npm install --save-dev ava"

// queremos probar los modelos sin conectarnos a la DB posta
// creamos un: servicios -> modelos -> conexion a DB
// stubs: objeto similar al objeto original (al modelo) contiene los metodos,
// pero estan previamente los argumentos y las respuestas especificados por una libreria
// para esto usaremos:
// npm i sinon --save-dev
const sinon = require('sinon')

// necesitamos sobreescribir los modelos desnde afuera, pero no tenemos acceso a ello porque
// los requerimos en el index y no en el agent-tests
// para eso usaremos:
// npm i proxyquire --save-dev
// utilidad que nos permite requerir un modulo pero sobreescribir los require
const proxyquire = require('proxyquire')

// fixtures -> es un set de datos falsos (set de datos de prueba) con los que trabajaremos
const agentFixtures = require('./fixtures/agent')

// no queremos una conexion real a la DB
// queremos una DB de prueba...
let config = {
  logging: function () {} // desabilitamos el logging
}

// objeto que representa el modelo y tiene los metodos correspondientes
let MetricStub = {
  belongsTo: sinon.spy()
} // un spy es un espia que ocntrola la función y nos permite poder hacer consultas
// saber cuantas veces fue llamada, o con que argumentos, etc...

// clonamos el objeto single
// esto lo hacemos para que cuando estemos haciendo los stubs, no estemos
//  con la unica instancia que nos retorna AgentFixtures
let single = Object.assign({}, agentFixtures.single)

let id = 1

let AgentStub = null

// queremos verificar que el agente exista
// este agente es el que va a devolver la funcion de config de la base de datos
// cada vez que ejecutamos un test necesitamos hacer una instancia de la DB
let db = null

// sanbox es un ambiente especifico de sinon que solo va a funcionar para un caso particular
// luego de ejecutar la prueba reiniciamos el sandbox con el fin de que si queremos garantizar
// que una funcion fue llamada solo una vez, entonces reiniciemos el estado de esos stubs y se corra
// un test diferente
let sandbox = null

// ava tiene "hooks", podemos correr funciones antes de cada uno de los test:
test.beforeEach(async () => {
  sandbox = sinon.sandbox.create() // creamos el sandbox cada vez que se ejecuta un test
  // aca lo implementamos
  AgentStub = {
    hasMany: sandbox.spy()
  }

  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // inyectemos es tos dos stubs a nuestro modelo con poxyquire
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  }) // cuando yo requiera el objeto de '../' que sería de index.js,
  // sobreescribe con los stubs

  /* Dejamos esto de lado porque usamos el proxyquire ahora
  * // antes de cada uno de los test ejecuta la siguiente funcion asincrona
  * const setupDatabase = require('../') // requiere el modulo de configuracion de DB (que seria el index)
  */
  db = await setupDatabase(config) // define una variable global de DB
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore() // si existe el sandbox luego de correr el test,
  // entonces lo reiniciamos y recreamos
})

test('Agent', t => {
  t.truthy(db.Agent, 'El servicio de Agente deberia existir') // existe un valor distinto de 0 o vacio
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany fue ejecutada') // garantizan que fue llamada
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'El argumento debería ser el MetricModel') // garantiza que fue llamada con X parametro
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo fue ejecutada')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'El argumento debería ser el AgentModel')
}) // hacemos esto de ponerlo en 'serie' para asegurar que nuestro entorno de stubs no este saturado
// recordar que ava corre de forma paralela los test

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id) // obtenemos un agente
  // usamos las mismas pruebas que hicimos con spy pero con stub
  t.true(AgentStub.findById.called, 'findById debe haber sido llamada')
  t.true(AgentStub.findById.calledOnce, 'findById debe ser llamada solo una vez')
  t.true(AgentStub.findById.calledWith(id), 'findById debe ser llamada con el id especifico')
  // comparo si el objeto que obtengo es igual al agente que obtengo con el id "id"
  t.deepEqual(agent, agentFixtures.byId(id), 'Deberian ser los mismos objetos')
})

test('este test pasa siempre', t => { // es un pequeño test que no falla nunca
  t.pass() // le decimos que lo pase
}) // recordar definir el script para correr las pruebas en el package.json
// el flag --verbose me permite obtener infromacion de cada test ejecutado por el script