'use strict'

const db = require('../')

async function run () {
    const config = { // defino el objeto de configuracion (igual al del setup)
        database: process.env.DB_NAME || 'platziverse',
        username: process.env.DB_USER || 'platzi',
        password: process.env.DB_PASS || 'platzi',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
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

    console.log('--agent--')
    console.log(agent)

    const agents = await Agent.findAll()
        .catch(manejoDeError)
    
    console.log('--agents--')
    console.log(agents)

    const metrics = await Metric.findByAgentUuid(agent.uuid)
        .catch(manejoDeError)

    console.log('--metrics--')
    console.log(metrics)

    const metric = await Metric.create(agent.uuid, {
        type: 'memory',
        value: '300'
    }).catch(manejoDeError)

    console.log('--metric--')
    console.log(metric)

    const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid)
        .catch(manejoDeError)

    console.log('--metrics--')
    console.log(metricsByType)
}

function manejoDeError (err) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1) // matamos el script si algo falla
}

run() // ejecuto la funcion de ejemplo
// ejecutamos el ejemplo desde consola con el comando:
// 'node examples/index.js'