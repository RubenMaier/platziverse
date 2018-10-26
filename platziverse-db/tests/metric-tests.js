'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging () { }
}

let uuid = 'yyy-yyy-yyy'
let type = 'CPU'
let MetricStub = null
let AgentStub = null
let db = null
let sandbox = null

let uuidArgs = {
  where: { uuid }
}

let metricUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let typeUuidArgs = {
  attributes: [ 'id', 'type', 'value', 'createdAt' ],
  where: {
    type
  },
  limit: 20,
  order: [[ 'createdAt', 'DESC' ]],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let newMetric = {
  agentId: 1,
  type: 'CPU',
  value: '18%'
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  MetricStub = {
    belongsTo: sinon.spy()
  }

  AgentStub = {
    hasMany: sinon.spy()
  }

  // Model create Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)))
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all)) // chabon tene cuidado, lo que no tiene argumento ponelo ultimo
  // porque sino se caga todo, no se que onda viejo, pero considera que los argumentos vacios responden a cualquier argumento

  metricUuidArgs.include[0].model = AgentStub
  typeUuidArgs.include[0].model = AgentStub

  // Model findAll Stub

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'El servicio de Metricas deberia existir')
})

test.serial('Setup Metric', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany fue ejecutado')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'El argumento debería ser MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo fue ejecutado')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'El argumento debería ser AgentModel')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'Agent findOne deberia ser llamado en el modelo')
  t.true(AgentStub.findOne.calledOnce, 'Agent findOne debería ser llamado una vez')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'create deberia ser llamado en el modelo')
  t.true(MetricStub.create.calledOnce, 'create debería ser llamado una vez')
  t.true(MetricStub.create.calledWith(newMetric), 'create deberia ser llamado con el argumento args')

  t.deepEqual(metric, newMetric, 'deberia ser el mismo')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll deberia ser llamado en el modelo')
  t.true(MetricStub.findAll.calledOnce, 'findAll debería ser llamado una vez')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll deberia ser llamado con el argumento metricUuidArgs')

  t.deepEqual(metric, metricFixtures.findByAgentUuid(uuid), 'deberia ser el mismo')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll deberia ser llamado en el modelo')
  t.true(MetricStub.findAll.calledOnce, 'findAll debería ser llamado una vez')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll deberia ser llamado con el argumento typeUuidArgs')

  t.deepEqual(metric, metricFixtures.findByTypeAgentUuid(type, uuid), 'deberia ser el mismo')
})