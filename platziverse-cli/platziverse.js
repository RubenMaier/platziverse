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

screen.key(['escape', 'q', 'C-c'], (caracter, tecla) => {
    process.exit(0) // finalización exitosa
}) /* capturamos teclas. En este caso son "escape", "q" o "ctrl+c" */

// renderizamos todos nuestros componentes
screen.render()
