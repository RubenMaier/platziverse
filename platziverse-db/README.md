# platziverse-db

## configuración

### 1
instalar: postgres, redis, vagrant y 
### 2
correr:
npm i
### 3
correr:
npm run setup-mac
### 4
y puedes correr:
npm run test-mac
o
node examples/index.js


## Uso

``` js
const setupDatabase = require('platziverse-db') // me retorna una funcion que me
                                                // va a devolver el objeto de base
                                                // de datos db

setupDabase(config).then(db => {
    const { Agent, Metric} = db // mi objeto db tiene dos objetos (el agente y la metrica)
                                // objet structuring:
                                // antes de ecmascript6 se hacia asi...
                                // const Agent = db.Agent
                                // const Metric = db.Metric
}).catch(err => console.error(err))
```

##Comandos corridos:
``` js
mkdir platizverse
cd platizverse
ls
git init
mkdir platizverse-db
cd plativerse-db
npm init
ls
touch index.js // me crea un archivo
code . // me abre visual studio code con ese espacio de trabajo
touch README.md
```

##Comandos con los que se subio el proyecto:
``` js
git remote add origin "agrego el link de git despues de crear el archivo"
git add .
git commit -m "mensaje"
git tag 6.1.0
git push origin master
git push origin master --tags
```




## depuracion de funciones asincronas
utilizamos la libreria "longjohn"
stack trace del event loop + stack trace normal
ojo con usarlo en entornos de produccion porque genera mucho overhead

## cumplimos el reto de pasarle una variable al comando
Ahora al usar
"npm run setup-mac -- --yes" ignoramos la validación de si queremos o no hacerlo
Usamos la libreria minimist para parcear los argumentos que le pasamos al comando