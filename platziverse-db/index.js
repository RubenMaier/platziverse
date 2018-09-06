'use strict' // usamos el modo estricto de javascript para evitar errores
// y crear un marco de trabajo, ademas usaremos luego lint
// para validar y obligarnos a escribir asi

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')

module.exports = async function (config) { // exportamos una funcion que recibe una configuracion
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config) // lo definimos asi para poder a futuro hacer uso de
  const MetricModel = setupMetricModel(config) // los stubs y mocks asi le agregamos funciones
  // falsas para hacer pruebas sin conectarlo necesariamente a la base de datos

  AgentModel.hasMany(MetricModel) // defino que el modelo de agente tiene muchas metricas
  MetricModel.belongsTo(AgentModel) // defino que el modelo de metrica pertenece a un agente

  await sequelize.authenticate() // validamos si la db esta conectado

  // configuramos la db
  // toda la definicion de los modelos que haya en la db si no existen, las crea
  if (config.setup) {
    await sequelize.sync({ force: true }) // si la db existe, borro y creo una nueva
  }

  const Agent = {} // creamos los objetos
  const Metric = {}

  return {
    Agent, // y cuando llamen a la funcion los retornamos
    Metric
  }

  // antes de ecmascript6 se hacia asi:
  // return {
  //     Agent: Agent,
  //     Metric: Metric
  // }

  // recordar correr el comando:
  // npm i --save-dev standard
  // (este flag "--save-dev" se coloca para decirle que lo agregue
  // como dependencia de desarrollo)
  // el objetivo de esto es poder hacer uso del a herramienta "lind"
  // que nos permitira llevar acabo
  // buenas practicas de desarrollo

  // modificar tambien el arhivo package.json luego de haber corrido
  // el comando y agregar el siguiente script:
  // "lint": "standard"

  // tener en cuenta que con el comando:
  // npm run lint -- --fix
  // podemos corregir los errores detectados al correr el script
  // creado anteriormente
}
