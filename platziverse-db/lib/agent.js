'use strict'

// servicio de agente
module.exports = function setupAgent (AgentModel) { // exportamos una función
  function findById (id) {
    return AgentModel.findById(id)
  }

  async function createOrUpdate (agent) {
    const condicion = { // es un objeto sequelize
      where: {
        uuid: agent.uuid // esto es similar a un "select X where uuid = uuid form Y"
      }
    }
    // obtenemos un agente existente
    const existingAgent = await AgentModel.findOne(condicion) // findOne nos retorna la primer ocurrencia que cumpla con la condicion que se acaba de pasar

    if (existingAgent) { // si existe entonces lo actualizo
      const updated = await AgentModel.update(agent, condicion) // update me retorna el numero de filas que actualizo, asi que updated contiene ese numero
      return updated ? AgentModel.findOne(condicion) : existingAgent // si se actualizo, retorno el agente actualizado pero directamente desde instancia de la DB
      // si no se pudo actualizar, entonces retorno el agente que ya estaba en la DB
    }

    const result = await AgentModel.create(agent) // si no existia, lo creamos
    return result.toJSON() // retornamos el objeto json del modelo agregado en la DB porque sequelize sino me devuelve un monton de pelotudeces mas
  }

  return {
    findById,
    createOrUpdate
  }
}
