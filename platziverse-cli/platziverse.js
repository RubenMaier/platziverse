#!/usr/bin/env node
// le decimos esto para que yo pueda ejecutar esta aplicacion como un comando
// utiliza el binario de nodejs antes de lanzar el script
// en ves de ejecutarlo como "node platziverse.js" puedo poner "./platziverse.js"
// ojo que para ejecutarlo asi tengo que setearle permisos de ejecucion
// para eso debemos ejecutar "chmod +x platziverse.js"
'use strict'

/* eslint: la regla "new-cap" estará apagada, para evitar que nos tire error cuando un objeto
no tenga su metodo con mayuscula como es el caso de grid, tambien apago la de "no-unused-vars"
que es la que nos jode cuando tenemos variables declaradas no asignadas */

/* eslint new-cap: "off" */
/* eslint no-unused-vars: "off" */

const blessed = require('blessed') /* es la base que nos permite crear que nos permite crear
una base rica en la terminal */
const contrib = require('blessed-contrib') /* contiene los componentes o witches que nosotros
vamos a utilizar para crear las lineas o gráficas de visualización de nuestras métricas */
const platziverseAgent = require('platziverse-agent')
const moment = require('moment')

const agent = new platziverseAgent() // creamos una instancia
const agents = new Map()
const agentMetrics = new Map()

const screen = blessed.screen() // esto nos genera la pantalla con la cual trabajaremos
/* creamos un grid o un componente de grid que va a contener una fila  y 4 columnas. En una
columna vamos a poner un componente que es de tipo arbol para nosotros listar los agentes y
cada una de sus metricas (recordemos el modulo archi para pintar objetos de tipo arbol). En
el resto de contenidos de las otras filas de las restantes 3 columnas vamos a poner  un
componente de linea/gráfica. */

const grid = new contrib.grid({
    rows: 1,
    cols: 4,
    screen // le pasamos la instancia de donde generara este grid
})

const tree = grid.set(0, 0, 1, 1, contrib.tree, {
    label: 'Agentes conectados'
}) /* aca vamos a tener la lista de los agentes. Fila 0 columna 0 y le indicamos que ocupe todo
el espacio de la columna y la fila con ese 1 del tercer y cuarto argumento. El quinto argumento
indica el tipo que es y el sexto argumento es el parámetro de configuración */

const line = grid.set(0, 1, 1, 3, contrib.line, {
    label: 'Metrica',
    showLegend: true, // mostramos la leyenda de nuestra grafica
    minY: 0, // minimo valor de y
    xPadding: 5 // para tener el espacio entre cada uno de los valores
}) /* componente de la grafica. */

agent.on('agent/connected', payload => {
    const { uuid } = payload.agent
    if (!agents.has(uuid)) { // si no tenemos este agente con uuid en el mapa lo agregamos
        agents.set(uuid, payload.agent) // lo agregamos con la uuid y con la informacion del agente que nos llegó
        agentMetrics.set(uuid, {}) /* tambien agregamos un objeto asociado a este agente con uuid pero sin 
        las metricas puesto que estas llegan recien en el evento de 'agent/message' */
    }
    renderData() // se encarga de pintar esta informacion de los agente en el arbol
})

agent.on('agent/disconnected', payload => {
    const { uuid } = payload.agent
    if (agents.has(uuid)) { // si este agente esta en la lista lo borramos
        agents.delete(uuid) // borramos el agente
        agentMetrics.delete(uuid) // borramos las metricas de este agente
    }
    renderData()
})

agent.on('agent/message', payload => {
    const { uuid } = payload.agent
    const { timestamp } = payload // para saber el tiempo en que la metrica llego
    if (!agents.has(uuid)) { // que pasa si la app esta corriendo y llega un agente... lo agregamos
        agents.set(uuid, payload.agent)
        agentMetrics.set(uuid, {})
    }
    const metrics = agentMetrics.get(uuid) // obtenemos las metricas
    /* se supone el formato/estructura como:
    metrics = {
        rss: [200, 300, 200],
        promiseMetric: [0.1, 0.2, 0.3]
    } 
    */
    payload.metrics.forEach(m => { // m = unaMetrica
        const { type, value } = m // extraemos los valores que tiene
        if (!Array.isArray(metrics[type])) { // si no es un arreglo, lo hago arreglo
            metrics[type] = [] // arreglo vacio
        }
        const length = metrics[type].length
        if (length => 20) { // si hay 20 o mas
            metrics[type].shift() // eliminamos la primer posicion (funcion shift hace eso)
        }
        metrics[type].push({ // agregamos el valor metrics
            value,
            timestamp: moment(timestamp).format('HH:mm:ss') // lo formateamos
        })
    })
    renderData()
})

screen.key(['escape', 'q', 'C-c'], (caracter, tecla) => {
    process.exit(0) // finalización exitosa
}) /* capturamos teclas. En este caso son "escape", "q" o "ctrl+c" */

// nos conectamos luego de crear todo el layout
agent.connect() // ya deberia comenzar a recibir los datos de metrica, agente conectado, etc

tree.focus() // para interactuar con el telcado, donde este tenga el foco

// renderizamos todos nuestros componentes
screen.render()

function renderData() {
    const treeData = {} // crea un objeto que es el que le voy a pasar al tree y tiene la info de nuestros agentes
    for (let [uuid, val] of agents) { // recorro todo los agentes que tengo conectado
        const title = `${val.name} - (${val.pid})` /* si multiples agentes se conectan con el mismo nombre los
        identifico con el identificador del proceso (pid) */
        treeData[title] = {
            uuid,
            agent: true,
            children: {}
        }
        const metrics = agentMetrics.get(uuid)
        Object.keys(metrics).forEach(type => { // iteramos sobre las llaves del objeto
            const metric = { // definimos propiedades
                uuid,
                type,
                metric: true
            }
            const metricName = `${type}`
            treeData[title].children[metricName] = metric // la agrego como un hijo
            /* queda algo asi el objeto...
            {
                children: {
                    ress: {
                        uuid,
                        type,
                        metric: true
                    } 
                }
            }
            */
        })
    }
    tree.setData({
        extended: true, // lo muestro todo abierto
        children: treeData // el hijo es el objeto que cree
    })
    screen.render()
}