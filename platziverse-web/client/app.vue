<template>
  <div>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid" :socket="socket"></agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
body {
  font-family: Arial;
  background: #f8f8f8;
  margin: 0;
}
</style>

<script>
// ya no es una variable global, sino que la requerimos del modulo
const io = require("socket.io-client"); // nos permite ejecutar socketio desde el lado del cliente
const socket = io(); // nos conectamos al servidor
const request = require("request-promise-native");
const { serverHost } = require("platziverse-utils");

module.exports = {
  data() {
    return {
      agents: [],
      error: null,
      socket // es una propiedad de nuestro componente de aplicacion y se lo pasamos al componente de metrica
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      const opciones = {
        method: "GET",
        url: `${serverHost}/agents`,
        json: true
      };
      let resultado;
      try {
        resultado = await request(opciones);
      } catch (e) {
        this.error = e.error.error;
        return;
      }
      this.agents = resultado;

      socket.on("agent/connected", payload => {
        const { uuid } = payload.agent;
        const existe = this.agents.find(agente => agente.uuid === uuid);
        if (!existe) {
          this.agents.push(payload.agent);
        }
      });
    }
  }
};
</script>
