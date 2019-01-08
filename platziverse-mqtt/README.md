# definimos los tipos de mensajes

crearemos un agente que se conectara a nuestro servidor asi que
vamos a necesitar el siguiente mensaje:

## `agent/connected`

estructura de una gente conectado (sera un json)

```js
{
  agent: {
    uuid, // auto generar
    username, // definir por configuración
    name, // definir por configuración
    hostname, // obtener del sistema operativo
    pid; // obtener del proceso
  }
}
```

también vamos a querer manejar cuando este agente se desconecte:

## `agent/disconnected`

```js
{
  agent: {
    uuid
  }
}
```

vamos a querer un evento cada vez que ese agente nos mande un
mensaje, ese mensaje va a contener las métricas que ese agente
va a reportar:

## `agent/message`

```js
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp // generar cuando creamos el mensaje
}
```

# modulo 6
## video 3
Instalamos mqtt con el comando:
npm install -g mqtt
Para mandar un mensaje debemos usar:
mqtt pub -t 'agent/message' -h localhost -m 'Aca va el mensaje'

# modulo 6
## video 4
A partir de ahora vamos a intentar integrar este modulo con el de DB
podemos referenciar este modulo desde npm, github, o como quereamos, en este caso vamos a referenciarlo de manera local
para eso usamos el patron de monorepo, añadimos platziverse-db al package.json de platziverse-mqtt

#modulo 6
## video 5
el comando "redis-cli" me levanta redis en windows 10

#modulo 6
## video 7
probamos agregar un agente con una metrica por mqtt con el siguiente comando:
mqtt pub -t 'agent/message' -m '{"agent": {"uuid": "jjj", "name": "test", "username": "platzi", "hostname": "platziargentina", "pid": 10}, "metrics": [{"type": "memoria", "value": "1001"}, {"type": "temp", "value": "33"}]}'

para windows ver comentarios del video y hay un ejemplo
mqtt pub -t agent/message -m {\"agent\":{\"uuid\":\"yyy\",\"name\":\"test\",\"username\":\"platzi\",\"pid\":10,\"hostname\":\"alp-pc\"},\"metrics\":[{\"type\":\"memoria\",\"value\":\"1001\"},{\"type\":\"temp\",\"value\":\"22\"}]}
noten que no coloco las comillas simples al iniciar el mensaje y uso un scape para cada comilla doble del json. Esta es la unica  manera que logre hacer funcionar el mqtt client y guardara el agent y las metricas


mqtt pub -t agent/message -m 
{
    \"agent\":
    {
        \"uuid\":\"yyy\",
        \"name\":\"test\",
        \"username\":\"platzi\",
        \"pid\":10,
        \"hostname\":\"alp-pc\"
    },
    \"metrics\":[
    {
        \"type\":\"memoria\",
        \"value\":\"1001\"
    },
    {
        \"type\":\"temp\",
        \"value\":\"22\"
    }]
}