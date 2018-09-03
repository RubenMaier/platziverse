'use strict'

// para instalar sequelize debo correr el comando:
// npm i sequelize pg pg-hstore --save
const Sequelize = require('sequelize') // importo objetos para definir tipos de datos
const setupDatabase = require('../lib/db') // importandos la funcion

module.exports = function setupMetricModel (config) {
  const sequelize = setupDatabase(config) // obtenemos una instancia de la db

  return sequelize.define('metric', {
    type: {
      type: Sequelize.STRING,
      allowNull: false // esto define que el dato es necesario para crear el objeto,
      // o de lo contrario retorna error
    },
    value: {
      type: Sequelize.TEXT, // ponemos text por si queremos pasar estructuras
      // complejas como json, etc...
      allowNull: false
    }
  })
}
