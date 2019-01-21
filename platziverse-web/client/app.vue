<template>
  <div>
    <metric uuid="7362e7b0-c1f9-4600-9821-176b6d4745a8" type="promiseMetric"></metric>
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
module.exports = {
  data() {
    return {
      agents: [],
      error: null
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
