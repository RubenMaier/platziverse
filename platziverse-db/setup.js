'use strict'

const db = require('./')
const debug = require('debug')('platziverse:db:setup')
// recordar correr "npm i inquirer"
const inquirer = require('inquirer') // nos permite hacer preguntas en consola y mediante respuestas tomar decisiones
// recordar correr "npm i chalk"
const chalk = require('chalk') // permite estilizar cosas en la consola
const { crearConfigDB, handleFatalError } = require('platziverse-utils')

const prompt = inquirer.createPromptModule() // creamos un objeto de prompt (nos permite hacer preguntas en forma de promesas)

async function setup() {
  const respuesta = await prompt([
    {
      type: 'confirm', // confirmación (sí o no)
      name: 'setup', // la respuesta la guarda en una propiedad llamada "setup"
      message: 'Esto va a destruir la base de datos, ¿Esta seguro?' // mensaje de la pregunta
    }
  ]) // recibimos la respuesta del usuario aca

  if (!respuesta.setup) {
    return console.log('No pasa nada, no la borramos')
  }

  const configDB = crearConfigDB(true, debug)

  await db(configDB).catch(handleFatalError) // obtenemos el objeto de db, si hay errores lo capturo

  console.log('Exito!')
  process.exit(0)
}

setup()
