"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca"); // para crear el servidor
const redis = require("redis");
const chalk = require("chalk"); // para tener colores en la terminal
const db = require("platziverse-db");

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

const config = {
  database: process.env.DB_NAME || "platziverse",
  username: process.env.DB_USER || "platzi",
  password: process.env.DB_PASS || "platzi",
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  logging: s => debug(s)
};

// servicios que por ahora estaran indefinidos
let Agent, Metric;

// instanciamos el servidor
const server = new mosca.Server(settings); // es un eventEmitter (agregamos funcionalidades cuando el servidor me lance eventos)

// como recibiremos los distintos eventos a la red (cliente conectandose o desconectandose, publicando mensajes en el servidor, etc)
server.on("clientConnected", client => {
  // evento de cliente que se conecta al servidor
  debug(`Cliente conectado con id: ${client.id}`); // id que autogenera mqtt
});

server.on("clientDisconnected", client => {
  // evento de cliente que se desconecta del servidor
  debug(`Cliente desconectado con id: ${client.id}`); // id que autogenera mqtt
});

server.on("published", (packet, client) => {
  // mensaje publicado dado un paquete y un cliente
  debug(`Recibido por el cliente de id: ${packet.topic}`); // topic es el tipo el mensaje (agentConnected, agentDisconnected o agentMessage)
  debug(`Informacion que nos ha llegado: ${packet.payload}`); // payload es el contenido
});

server.on("ready", async () => {
  const services = await db(config).catch(handleFatalError);
  Agent = services.Agent;
  Metric = services.Metric;
  // este evento es lanzado cuando el servidor este listo e inicializado
  console.log(`${chalk.green("[platziverse-mqtt]")} server corriendo`);
});

/*
 * como trabajamos con emisores de eventos (eventEmitter) debemos tener en cuenta que tenemos que
 * agregar un manejador de errores por si el servidor responde asi, por lo tanto creamos un manejador
 * de errores fatales
 */
server.on("error", handleFatalError);

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1); // tiramos el servidor cerrando el proceso
}

// cuando tenemos un excepcion que no fue manejada (pasa a nivel del proceso) lo debemos manejar...
process.on("uncaughtException", handleFatalError);

// lo mismo para las promesas
process.on("unhandledRejection", handleFatalError);
