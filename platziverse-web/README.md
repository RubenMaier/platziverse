npm i --save-dev envify
npm i --save-dev uglify-js (quite este comando porque ya no funca bien el modulo, o al menos a mi no me anda)
npm i --save-dev babel-preset-stage-3 (este iba como necesidad para transformar codigo ecmascript6)


envify (extencion de browserify) me permite transformar las variables de entorno que estan en el codigo del lado del cliente al valor asignado cuando yo ejecuto esa transformacion con el build

unglify sirve para minificar el codigo contruido por el comando build del packege.json, esto lo logra comprimiento "-c" y reduciendo el nombre de las variables "-m"