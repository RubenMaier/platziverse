module.exports = function(entorno, valor) {
  // recordar correr npm "i debug --save" para instalarlo
  const debug = require("debug")(entorno); // proyecto platziverse, modulo db, funcionalidad setup

  return {
    // informacion que necesita sequelize para funcionar
    database: process.env.DB_NAME || "platziverse", // queremos poder tener este modulo configurable
    username: process.env.DB_USER || "platzi", // vamos a pasar variables de entorno
    password: process.env.DB_PASS || "platzi",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres", // sequelize nos permite trabajar con mysql, oracle, etc... aca decimos
    // con que tipo de db trabajamos, y sequelize simplifica todo sin tener que tocar el codigo
    logging: s => debug(s), // hacemos un debug para saber que tipo de datos esta devolviendo la db
    // recordar correr "npm i debug --save"
    // para que se muestren log debo tener una variable de entorno configurada
    setup: valor // esta propiedad es util para definir si crear la db o no
    // true: borra - false: no borra
  };
};
