"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca"); // para crear el servidor
const redis = require("redis");
const chalk = require("chalk"); // para tener colores en la terminal
const db = require("platziverse-db");
const configDB = require("platziverse-db/config.js");

const { parsePayload } = require("./utils"); // somo me extrae la funcion parsePayload de la libreria utilidades

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

const config = configDB("platziverse:mqtt", false);

// servicios que por ahora estaran indefinidos
let Agent, Metric;

// instanciamos el servidor
const server = new mosca.Server(settings); // es un eventEmitter (agregamos funcionalidades cuando el servidor me lance eventos)

// creamos una referencia de todos los agentes que tenemos conectados
const clients = new Map();

server.on("ready", async () => {
  const services = await db(config).catch(handleFatalError);
  Agent = services.Agent;
  Metric = services.Metric;
  // este evento es lanzado cuando el servidor este listo e inicializado
  console.log(`${chalk.green("[platziverse-mqtt]")} server corriendo`);
});

// como recibiremos los distintos eventos a la red (cliente conectandose o desconectandose, publicando mensajes en el servidor, etc)
server.on("clientConnected", client => {
  // evento de cliente que se conecta al servidor
  debug(`Cliente conectado con id: ${client.id}`); // id que autogenera mqtt
  clients.set(client.id, null); // almaceno el cliente conectado al mapa
});

server.on("clientDisconnected", client => {
  // evento de cliente que se desconecta del servidor
  debug(`Cliente desconectado con id: ${client.id}`); // id que autogenera mqtt
});

server.on("published", (packet, client) => {
  // mensaje publicado dado un paquete y un cliente
  debug(`Recibido por el cliente de id: ${packet.topic}`); // topic es el tipo el mensaje (agentConnected, agentDisconnected o agentMessage)

  switch (packet.topic) {
    case "agent/connected":
    case "agent/disconnected":
      debug(`Informacion que nos ha llegado: ${packet.payload}`); // payload es el contenido
      break;
    case "agent/message":
      debug(`Informacion que nos ha llegado: ${packet.payload}`);
      const payload = parsePayload(packet.payload);
      if (payload) {
        payload.agent.connected = true;
        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
        } catch (e) {
          return handleError(e); // salgo e la funcion y solo espero agentes con buena informacion, el resto los ignoro
        }
        debug(`Agente con id ${agent.uuid} guardado`);
        // notificamos que el agente fue conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent);
          // le notificamos a todos nuestros clientes (hacemos un broucast) que estan conectados
          // y escuchando en el evento de agente conectado que un agente se conecto
          server.publish({
            topic: "agent/connected",
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          });
        }
      }
      break;
  }
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
function handleError(err) {
  console.error(`${chalk.red("[error]")} ${err.message}`);
  console.error(err.stack); // no mata al proceso
}

// cuando tenemos un excepcion que no fue manejada (pasa a nivel del proceso) lo debemos manejar...
process.on("uncaughtException", handleFatalError);

// lo mismo para las promesas
process.on("unhandledRejection", handleFatalError);
