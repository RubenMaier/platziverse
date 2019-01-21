<template>
  <div>
    <metric uuid="c93e45ca-b6dd-4c45-9a91-674d27c31b66" type="callbackMetric" :socket="socket"></metric>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid"></agent>
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
    initialize() {}
  }
};
</script>
