'use strict' // usamos el modo estricto de javascript para evitar errores
// y crear un marco de trabajo, ademas usaremos luego lint
// para validar y obligarnos a escribir asi

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')

// usamos un modulo que nos permite poner como default un objeto de configuracion
// debemos instalar el modulo con: "npm i --save defaults"
const defaults = require('defaults')

const setupAgent = require('./lib/agent')
const setupModel = require('./lib/metric')

module.exports = async function (config) { // exportamos una funcion que recibe una configuracion
  // le aplicamos ciertos parametros por defacto a los parametros de configuracion
  // redefinimos config
  config = defaults(config, {
    // debemos instalar sqlite con: "npm i sqlite3 --save-dev"
    dialect: 'sqlite', // por defecto definimos otra DB para no usar la posta (usamos sqlite para pruebas)
    pool: { // me permite definir el limte de conexiones con las que quiero trabajar
      max: 10,
      min: 0,
      idle: 10000 // si con la conexion no pasa nada en 10 segundos la saca del pool de conexiones
    },
    query: {
      raw: true // quiero que solo me devuelva objetos sencillos, sin tanto bardo
    },
    operatorsAliases: false
  }) // si config no esta definido le asigna el objeto de alado

  const sequelize = setupDatabase(config)

  // lo definimos asi para poder a futuro hacer uso de los stubs y mocks asi le agregamos
  // funciones falsas para hacer pruebas sin conectarlo necesariamente a la base de datos:
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel) // defino que el modelo de agente tiene muchas metricas
  MetricModel.belongsTo(AgentModel) // defino que el modelo de metrica pertenece a un agente

  await sequelize.authenticate() // validamos si la db esta conectado

  // configuramos la db
  // toda la definicion de los modelos que haya en la db si no existen, las crea
  if (config.setup) {
    await sequelize.sync({ force: true }) // si la db existe, borro y creo una nueva
  }

  const Agent = setupAgent(AgentModel) // creamos los objetos
  const Metric = setupModel(MetricModel, AgentModel)

  return {
    Agent, // y cuando llamen a la funcion los retornamos
    Metric
  }
}