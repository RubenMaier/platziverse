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
const agentFixtures = require('platziverse-fixtures/agent')

// no queremos una conexion real a la DB
// queremos una DB de prueba...
let config = {
  logging: function () {} // desabilitamos el logging
}

// objeto que representa el modelo y tiene los metodos correspondientes
let MetricStub = {
  belongsTo: sinon.spy()
} // un spy es un espia que controla la función y nos permite poder hacer consultas
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

let uuid = 'yyy-yyy-yyy'

let uuidArgs = {
  where: {
    uuid
  }
}

let connectedArgs = {
  where: {
    connected: true
  }
}

let usernameArgs = {
  where: {
    username: 'platzi',
    connected: true
  }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

// ava tiene "hooks"...

test.beforeEach(async () => { // este hook se corre antes de correr cada uno de los test (ojo, si estan en serie, sino es en paralelo)
  // podemos correr funciones antes de cada uno de los test:
  sandbox = sinon.sandbox.create() // creamos el sandbox cada vez que se ejecuta un test

  // aca lo implementamos
  AgentStub = {
    hasMany: sandbox.spy()
  }

  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))

  // inyectemos estos dos stubs a nuestro modelo con poxyquire
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  }) // cuando yo requiera el objeto de '../' que sería de index.js, sobreescribe con los stubs

  /* Dejamos esto de lado porque usamos el proxyquire ahora
  * // antes de cada uno de los test ejecuta la siguiente funcion asincrona
  * const setupDatabase = require('../') // requiere el modulo de configuracion de DB (que seria el index)
  */
  db = await setupDatabase(config) // define una variable global de DB
})

test.afterEach(() => { // esto se ejecuta luego de correr cada uno de los test... (ojo, si estan en serie)
  sandbox && sinon.sandbox.restore() // si existe el sandbox luego de correr el test,
  // entonces lo reiniciamos y recreamos el sandbox
})

// aca vamos a poner la seguidilla de test que se van a ejecutar:

test('este test pasa siempre', t => { // es un pequeño test que no falla nunca
  t.pass() // le decimos que lo pase
}) // recordar definir el script para correr las pruebas en el package.json
// el flag --verbose me permite obtener infromacion de cada test ejecutado por el script

test.serial('Agent', t => {
  t.truthy(db.Agent, 'El servicio de Agente deberia existir') // existe un valor distinto de 0 o vacio
})

test.serial('Setup Agent', t => {
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

test.serial('Agent#createOrUpdate - cuando el usuario existe', async t => {
  let agent = await db.Agent.createOrUpdate(single)
  t.true(AgentStub.findOne.called, 'findOne debe ser llamado en el modelo')
  t.true(AgentStub.findOne.calledTwice, 'findone debe haber sido llamado 2 veces para ser actualizado')
  t.true(AgentStub.update.calledOnce, 'update debe haber sido llamado 1 sola veces para ser actualizado')
  t.deepEqual(agent, single, 'El agente debería ser el mismo')
})

test.serial('Agent#createOrUpdate - cuando el usuario es nuevo', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)
  t.true(AgentStub.findOne.called, 'findOne deberia ser llamado en el modelo')
  t.true(AgentStub.findOne.calledOnce, 'findOne deberia ser llamado 1 vez')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne deberia ser llamado con uuid como argumento')
  t.true(AgentStub.create.called, 'create deberia ser llamado en el modelo')
  t.true(AgentStub.create.calledOnce, 'create deberia ser llamado 1 vez')
  t.true(AgentStub.create.calledWith(newAgent), 'create debe ser llamado con argumentos especificos')
  t.deepEqual(agent, newAgent, 'El agente debería ser el mismo')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'findOne deberia ser llamado en el modelo')
  t.true(AgentStub.findOne.calledOnce, 'findOne deberia ser llamado 1 vez')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne deberia ser llamado con uuid como argumento')
  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'El agente debería ser el mismo')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()
  t.true(AgentStub.findAll.called, 'findAll deberia ser llamado en el modelo')
  t.true(AgentStub.findAll.calledOnce, 'findAll deberia ser llamado 1 vez')
  t.true(AgentStub.findAll.calledWith(), 'findAll deberia ser llamado sin argumentos')
  t.is(agents.length, agentFixtures.all.length, 'deberían tener la misma cantidad de agentes')
  t.deepEqual(agents, agentFixtures.all, 'los agentes deberían ser los mismos')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'findAll deberia ser llamado en el modelo')
  t.true(AgentStub.findAll.calledOnce, 'findAll deberia ser llamado 1 vez')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll deberia ser llamado con el argumento connected')
  t.is(agents.length, agentFixtures.connected.length, 'deberían tener la misma cantidad de agentes')
  t.deepEqual(agents, agentFixtures.connected, 'los agentes deberían ser los mismos')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')
  t.true(AgentStub.findAll.called, 'findAll deberia ser llamado en el modelo')
  t.true(AgentStub.findAll.calledOnce, 'findAll deberia ser llamado 1 vez')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll deberia ser llamado con el argumento username')
  t.is(agents.length, agentFixtures.platzi.length, 'deberían tener la misma cantidad de agentes')
  t.deepEqual(agents, agentFixtures.platzi, 'los agentes deberían ser los mismos')
})
