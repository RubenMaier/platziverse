"use strict"

// servicio de agente
module.exports = function setupAgent(AgentModel) { // exportamos una función
  function findById(id) {
    return AgentModel.findById(id)
  }

  return {
    findById
  }
}