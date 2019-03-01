#!/usr/bin/env node
// le decimos esto para que yo pueda ejecutar esta aplicacion como un comando
// utiliza el binario de nodejs antes de lanzar el script
// en ves de ejecutarlo como "node platziverse.js" puedo poner "./platziverse.js"
// ojo que para ejecutarlo asi tengo que setearle permisos de ejecucion
// para eso debemos ejecutar "chmod +x platziverse.js"
'use strict'

const minimist = require('minimist')
const args2 = require('args')

console.log('Hola viejo!')

console.log(process.argv) /* objeto de argumentos (en consola nos va a mostrar en primer lugar
cual es el binario de node que nosotros estamos ejecutando luego nos va a mostrar cual es el 
script que estamos ejecutando, a partir del tercer argumento los que aparezcan (incluyendo al
tercero) serán todos los que yo mismo valla agregando a la hora de ejecutar la aplicación.
Ojo pero no es la mejor forma, tenemos modulos que nos ayudan a mejorar el trabajo como
"minimist" que es una especie de parser de argv */

const args = minimist(process.argv)
console.log(args)
// notese que ahora tengo todo parseado si llamo por ejemplo a "./platziverse.js -- host 12313 --user Ruben"


// otro modulo es "args" que me permite crear modulos bastante desarrollados

args2
    .option('port', 'The port on which the app will be running', 3000)
    .option('reload', 'Enable/disable livereloading')
    .command('serve', 'Serve your static site', ['s'])

args2.parse(process.argv)

/* notese que con este nuevo modo si llamamos por ejemplo "./platziverse.js -h" nos desplegará
una lista de ayuda con lo que podemos hacer y con los comentarios correspondientes" */
