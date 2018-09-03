// funcion de setup de base de datos

// objeto nativo de sequelize para hacer los modelos
// otro objeto para hacer los servicios (metodos custom que usaremos para hacer consultas)
// estos servicios consumen a los modelos

'use strict'

const Sequelize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (config) { // defino un singleton
  if (!sequelize) {
    sequelize = new Sequelize(config)
  }
  return sequelize
}
