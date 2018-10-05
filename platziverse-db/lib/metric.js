'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function create (uuid, metric) {
    const condicion = {
      where: {
        uuid
      }
    }
    const existingAgent = await AgentModel.findOne(condicion) // veamos si el agente existe en la DB
    if (existingAgent) { // si el agente existe...
      Object.assign(metric, {
        agentId: existingAgent.id // le asignamos a nuestro objeto de metrica el ID del agente obtenido de la DB
        // es lo mismo que escribir "metric.agentId = agent.id"
      })
      const result = await MetricModel.create(metric) // intentamos almacenar la metrica en la DB
      return result.toJSON()
    }
  }

  async function findByAgentUuid (uuid) { // traeme todos los tipos de metrica que existan en la db pertenecientes al agente uuid
    let condicion = { // buscame todos los que cumplan con ...
      attributes: ['type'], // estos son los atributos que quiero que retorne la consulta
      group: ['type'], // quiero que me los agrupe por tipo (sino me mandaria cpu, cpu cpu..., memoria, memoria, memoria... etc)
      include: [{
        attributes: [], // ¿que info del agente queres obtener? ninguna, por eso no pongo parametros
        model: AgentModel, // esta es la tabla o modelo con el que quiero ahcer mi "join"
        where: {
          uuid // ¿bajo que condicion quiero "joinear"?
        }
      }],
      raw: true // que me retorne solo json (no objetos complejos)
      // las consultas de join con sequelize no respetan el "raw" que definimos antes en index.js, asi que debemos especificarlo
    }
    return MetricModel.findAll(condicion)
  }

  async function findByTypeAgentUuid (type, uuid) { // buscamos por tipo de metrica y por id de agente
    let condicion = {
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: { // filtramos las metricas por tipo
        type
      },
      limit: 20, // le pido que me retorne solo las primeras 20 metricas
      order: [
        ['createdAt', 'DESC'] // quiero que me los ordene por fecha de creacion y que esté en forma decendente
        // (los ultimos datos agregados son los primeros que aparecen en el listado)
      ],
      include: [{ // el join es igual que antes...
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    }
    return MetricModel.findAll(condicion)
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
