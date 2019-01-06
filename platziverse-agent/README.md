
# platziverse-agent

## Uso

``` js
// como implementamos nuestro agente...
const PlatziverseAgent = require('platziverse-agent') // yo obtengo platziverse-agent
const agent = new PlatziverseAgent({
    interval: 2000 // cada 2 milisegundo queremos que se emitan mensajes
}) // creo una instancia

agent.connect() // me conecto

agent.on('agent/message', payload => { // leo eventos de ese agente, ejemplo si recibo un agent message
    console.log(payload)
})

setTimeout(() => agent.disconnect(), 20000) // despues de 20 segundo me desconecto

```

# modulo 7

## video 1
para probarlo ejecutamos el comando "node" en la terminal y agregamos:

const PlatziverseAgent = require('./')
const agent = new PlatziverseAgent()
agent.on('agent/message', console.log)
agent.emit('agent/message', 'este es un mensaje')

entonces se emitira el evento

## video 2
usamos la terminal de node con "node" como comando y agregamos:

const PlatziverseAgent = require('./')
const agent = new PlatziverseAgent({ interval: 2000 })
agent.on('agent/message', console.log)
agent.connect()

y ahora me implimiria en pantalla el mensaje cada 2 segundos y con

agent.disconnect()

dejaria de repetir el mensaje