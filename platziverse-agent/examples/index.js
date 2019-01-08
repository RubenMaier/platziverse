// como implementamos nuestro agente...
const PlatziverseAgent = require('../') // yo obtengo platziverse-agent

const agent = new PlatziverseAgent({
    name: 'myApp',
    username: 'admin',
    interval: 2000 // cada 2 milisegundo queremos que se emitan mensajes
}) // creo una instancia

// implementamos la api con:

// funciones sincronas
agent.addMetric('rss', function getRss() { // rss es la metrica, resident set sai
    return process.memoryUsage().ress // lo obtenemos de process, en este caso me devuelve un json con los datos de memoria de este proceso
})

// funciones asincronas
agent.addMetric('promiseMetric', function getRandomPromise() {
    return Promise.resolve(Math.random())
})

// funciones asincronas con callback para transmitir valores
agent.addMetric('callbackMetric', function getRandomCallaback (callback) {
    setTimeout(() => {
        callback(null, Math.random())
    }, 1000)
})

agent.connect() // me conecto

// estos eventos son unicamente de este agente
agent.on('connected', handler) // el handler es el manejador
agent.on('disconnected', handler)
agent.on('message', handler)

// estos eventos son de otros agentes que estan enviando a mi servidor mqtt
// estos eventos los emito solo cuando mi uuid es distnto al de otro uuid (es decir, no son mis mensajes)
agent.on('agent/connected', handler)
agent.on('agent/discconnected', handler)
agent.on('agent/message', handler)

function handler (payload) { // leo eventos de ese agente, ejemplo si recibo un agent message
    console.log(payload)
}

setTimeout(() => agent.disconnect(), 20000) // despues de 20 segundo me desconecto