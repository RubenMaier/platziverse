#
cli = command line interface
app de consola creada con node

en el package.json cambiamos la propiedad "main" por la propiedad "bin"
con la finalidad de que cuando yo instale este modulo con "-g" el sistema agarrara
ese archivo que defina en la propiedad "bin" (de binario) y lo va a poner en el path
de nuestro sistema operativo, esta utilidad es platziverse.js