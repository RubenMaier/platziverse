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