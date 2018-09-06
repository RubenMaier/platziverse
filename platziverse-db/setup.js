'use strict'

const db = require('./')
// recordar correr npm "i debug --save" para instalarlo
const debug = require('debug')('platziverse:db:setup') // proyecto platziverse, modulo db, funcionalidad setup

async function setup () {
  const config = { // informacion que necesita sequelize para funcionar
    database: process.env.DB_NAME || 'platziverse', // queremos poder tener este modulo configurable
    username: process.env.DB_USER || 'platzi', // vamos a pasar variables de entorno
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres', // sequelize nos permite trabajar con mysql, oracle, etc... aca decimos
    // con que tipo de db trabajamos, y sequelize simplifica todo sin tener que tocar el codigo
    logging: s => debug(s), // hacemos un debug para saber que tipo de datos esta devolviendo la db
    // recordar correr "npm i debug --save"
    // para que se muestren log debo tener una variable de entorno configurada
    setup: true // esta propiedad es util para definir si crear la db o no
    // true: borra - false: no borra
  }

  await db(config).catch(handleFatalError) // obtenemos el objeto de db, si hay errores lo capturo

  console.log('Exito!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack) // para saber exactamente que error ocurrio
  process.exit(1) // matamos el proceso
}

setup()