<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400"
      :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
.metric {
  border: 1px solid white;
  margin: 0 auto;
}
.metric-type {
  font-size: 28px;
  font-weight: normal;
  font-family: "Roboto", sans-serif;
}
canvas {
  margin: 0 auto;
}
</style>
<script>
const request = require("request-promise-native");
const LineChart = require("./line-chart");
const moment = require("moment"); // me permite formatear fechas de una forma amigable para el usuario
const randomColor = require("random-material-color");

module.exports = {
  name: "metric",
  components: {
    LineChart
  },
  props: ["uuid", "type", "socket"], // recibimos estos valores como una propiedad

  data() {
    return {
      datacollection: {},
      error: null,
      color: null
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      const { uuid, type } = this;
      this.color = randomColor.getColor();
      const opciones = {
        method: "GET",
        url: `http://localhost:8080/metrics/${uuid}/${type}`,
        json: true
      };
      let resultado;
      try {
        resultado = await request(opciones);
      } catch (e) {
        this.error = e.error.error; // e.error contiene el error del request y e.error.error contiene el error de nuestra api
        return; // no sigo ejecutando el componente
      }
      const labels = [];
      const data = [];
      if (Array.isArray(resultado)) {
        resultado.forEach(metrica => {
          labels.push(moment(metrica.createdAt).format("HH:mm:ss")); // instante en el que se tomo la metrica
          data.push(metrica.value); // valor de la metrica
        });
      }
      this.datacollection = {
        labels,
        datasets: [
          {
            backgroundColor: this.color,
            label: type,
            data
          }
        ]
      };

      this.iniciarTiempoReal();
    },

    iniciarTiempoReal() {
      const { type, uuid, socket } = this;
      socket.on("agent/message", payload => {
        // recibimos solo de este agente y esta metrica
        if (payload.agent.uuid === uuid) {
          const metric = payload.metrics.find(metrica => metrica.type === type);
          // copia de valores actuales
          const labels = this.datacollection.labels;
          const data = this.datacollection.datasets[0].data; // tenemos solo 1 dataset
          // corremos la grafica, vamos a empezar viendo 20 metricas
          const length = labels.length || data.length; // tamaño actual (ambos deberian ser iguales)
          if (length >= 20) {
            labels.shift(); // elimino los 2 primeros elementos de ese arreglo
            data.shift();
          }
          labels.push(moment(metric.createdAt).format("HH:mm:ss")); // y añadimos un nuevo elemento
          data.push(metric.value);
          this.datacollection = {
            // redefino el datacollection para que el componente se renderice en su propiedad de reactividad
            labels,
            datasets: [
              {
                backgroundColor: this.color,
                label: type,
                data
              }
            ]
          };
        }
      });
    },

    handleError(err) {
      this.error = err.message;
    }
  }
};
</script>
