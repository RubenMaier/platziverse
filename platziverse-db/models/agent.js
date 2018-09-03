'use strict'

const Sequelize = require('sequelize') // importo objetos para definir tipos de datos
const setupDatabase = require('../lib/db') // importandos la funcion

module.exports = function setupAgentModel (config) {
  const sequelize = setupDatabase(config) // obtenemos una instancia de la db

  return sequelize.define('agent', { // definimos el modelo
    uuid: {
      type: Sequelize.STRING,
      allowNull: false // esto define que el dato es necesario para crear el objeto,
      // o de lo contrario retorna error
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    hostname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    connected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // si no tiene un dato, entonces le pone 'false' por defecto
    }
  })
}
