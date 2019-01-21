<template>
  <div>
    <agent uuid="040e3470-6a32-44bd-9c72-b8d8ba80f64a" :socket="socket"></agent>
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
