'use strict'

// esto se ejecuta con el comando
// "node examples/index.js"

const db = require('../')

async function run () {
  const config = { // defino el objeto de configuracion (igual al del setup)
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    operatorsAliases: false
  }

  // obtengamos el servico de agente y metrica
  const { Agent, Metric } = await db(config)
    .catch(manejoDeError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(manejoDeError)

  await Agent.createOrUpdate({
    uuid: 'rrr',
    name: 'ruben',
    username: 'ruben',
    hostname: 'ruben',
    pid: 2,
    connected: true
  }).catch(manejoDeError)

  console.log('--agent--')
  console.log(agent)
  console.log('')

  const agents = await Agent.findAll()
    .catch(manejoDeError)

  console.log('--agents--')
  console.log(agents)
  console.log('')

  console.log('creamos una memory')
  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(manejoDeError)

  console.log('creamos una CPU')

  await Metric.create('rrr', {
    type: 'CPU',
    value: '3'
  }).catch(manejoDeError)

  await Metric.create(agent.uuid, {
    type: 'CPU',
    value: '6'
  }).catch(manejoDeError)

  console.log('--metric--')
  console.log(metric)
  console.log('')

  const metrics = await Metric.findByAgentUuid('rrr')
    .catch(manejoDeError)

  console.log('--metrics findByAgentUuid--')
  console.log(metrics)
  console.log('')

  const metricsByType = await Metric.findByTypeAgentUuid('CPU', 'rrr')
    .catch(manejoDeError)

  console.log('--metrics findByTypeAgentUuid--')
  console.log(metricsByType)
  console.log('')
}

function manejoDeError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1) // matamos el script si algo falla
}

run() // ejecuto la funcion de ejemplo
// ejecutamos el ejemplo desde consola con el comando:
// 'node examples/index.js'
