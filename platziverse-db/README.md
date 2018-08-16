# platziverse-db

## Uso

``` js
const setupDatabase = require('platziverse-db')

setupDabase(config).then(db => {
    const { Agent, Metric} = db

    // antes de ecmascript6 se hacia asi:
    // const Agent = db.Agent
    // const Metric = db.Metric
    
}).catch(err => console.error(err))
```

##Comandos corridos:
``
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
``

##Comandos con los que se subio el proyecto:
``
git remote add origin "agrego el link de git despues de crear el archivo"
git add .
git commit -m "mensaje"
git tag 6.1.0
git push origin master
git push origin master --tags
``