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