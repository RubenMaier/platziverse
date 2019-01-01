"use strict";

const db = require("./");
// recordar correr "npm i inquirer"
const inquirer = require("inquirer"); // nos permite hacer preguntas en consola y mediante respuestas tomar decisiones
// recordar correr "npm i chalk"
const chalk = require("chalk"); // permite estilizar cosas en la consola
const config_db = require("./config.js");

const prompt = inquirer.createPromptModule(); // creamos un objeto de prompt (nos permite hacer preguntas en forma de promesas)

async function setup() {
  const respuesta = await prompt([
    {
      type: "confirm", // confirmación (sí o no)
      name: "setup", // la respuesta la guarda en una propiedad llamada "setup"
      message: "Esto va a destruir la base de datos, ¿Esta seguro?" // mensaje de la pregunta
    }
  ]); // recibimos la respuesta del usuario aca

  if (!respuesta.setup) {
    return console.log("No pasa nada, no la borramos");
  }

  const config = config_db("platziverse:db:setup", true);

  await db(config).catch(manejoDeError); // obtenemos el objeto de db, si hay errores lo capturo

  console.log("Exito!");
  process.exit(0);
}

function manejoDeError(err) {
  console.error(`${chalk.red("[error]")} ${err.message}`); // mostramos el mensaje de error con chalk de forma mas bonita en color rojo
  console.error(`${chalk.gray(err.stack)}`); // para saber exactamente que error ocurrio
  process.exit(1); // matamos el proceso
}

setup();
