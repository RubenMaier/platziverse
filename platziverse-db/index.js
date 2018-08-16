'use strict'

module.exports = function (config) {
  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }

  // antes de ecmascript6 se hacia asi:
  // return {
  //     Agent: Agent,
  //     Metric: Metric
  // }

  // recordar correr el comando:
  // npm i --save-dev standard
  // (este flag "--save-dev" se coloca para decirle que lo agregue como dependencia de desarrollo)
  // el objetivo de esto es poder hacer uso del a herramienta "lind" que nos permitira llevar acabo
  // buenas practicas de desarrollo

  // modificar tambien el arhivo package.json luego de haber corrido el comando y agregar el siguiente script:
  // "lint": "standard"

  // tener en cuenta que con el comando:
  // npm run lint -- --fix
  // podemos corregir los errores detectados al correr el script creado anteriormente
}
