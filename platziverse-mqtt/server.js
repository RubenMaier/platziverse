"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca"); // para crear el servidor
const redis = require("redis");
const chalk = require("chalk"); // para tener colores en la terminal

const backend = {
  type: "redis",
  redis,
  return_buffers: true
};

const settings = {
  // archivo de configuracion para servidor mosca
  port: 1883, // puerto donde correra el servidor mqtt
  backend // informacion del backend
};

// instanciamos el servidor
const server = new mosca.Server(settings); // es un eventEmitter (agregamos funcionalidades cuando el servidor me lance eventos)

server.on("ready", () => {
  // este evento es lanzado cuando el servidor este listo e inicializado
  console.log(`${chalk.green("[platziverse-mqtt]")} server corriendo`);
});
