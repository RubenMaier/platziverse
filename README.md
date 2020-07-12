# Criterios de arquitectura:
Plataforma de IoT con protocolos de tiempo real (WebSocket y MqTT)

**Componentes:**
- DB *(comunicación, almacenamiento de agentes y métricas)*
- MqTT Server *(Es el componente encargado de recibir las métricas y retransmitirlas, es decir, un bróker de mensajería)*
- AGENT *(Es cualquier app node.js que informa métricas a la capa de comunicación)*
- API server *(Carga la aplicación por primera vez con las métricas almacenadas y las informa para su graficación mediante JWT)*
- WEB *(Expone los agentes y sus métricas por medio de gráficos)*

**Relación entre componentes:**

![Diagrama de arquitectura](/documentation/diagrama-de-arquitectura.png?raw=true)

# Configuración del entorno
## Instalaciones requeridas en el ambiente:
- Node.js
- Postgresql
- Redis
- Ansible

## Pre-ejecución:
**Crear las tablas necesarias en la DB con el siguiente comando:**
En mac:
```
psql postgres
CREATE ROLE platzi WITH LOGIN PASSWORD 'platzi';
CREATE DATABASE platziverse;
GRANT ALL PRIVILEGES ON DATABASE platziverse TO platzi;
\quit
```
En windows:
```
psql -U postgres
CREATE ROLE platzi WITH LOGIN PASSWORD 'platzi';
CREATE DATABASE platziverse;
GRANT ALL PRIVILEGES ON DATABASE platziverse TO platzi;
\quit
```
**Correr en el componente de "platizverse-db" el siguiente comando:**
En mac:
```
npm run setup-mac
npm run test-mac
```
En windows:
```
npm run setup-win
npm run test-win
```
## Ejecución:
### Consola 1:
Ingresar al modulo de "platziverse-mqtt" y ejecutar el comando:
En mac:
```
npm run start-dev-mac
```
En windows:
```
npm run start-dev-win
```
### Consola 2:
Ingresar al modulo de "platziverse-api" y ejecutar el comando:
En mac:
```
npm run start-dev-mac
```
En windows:
```
npm run start-dev-win
```
### Consola 3: 
Ingresar al modulo de "platziverse-agent" y ejecutar el comando:
```
node examples
```
### Consola 4: 
Ingresar al modulo de "platziverse-cli" y ejecutar el comando:
```
node platziverse.js
```
### Consola 5: 
Ingresar al modulo de "platziverse-web" y ejecutar el comando:
```
node run start dev
```

## Pos-ejecución:

Ya puede observar los cambios de métricas por agente en la pagina web, que por defecto se encontrará en el enlace: http://localhost:8080. Ademas también puede visualizar por medio del modulo de *platizverse-cli*, una interfaz de consola con la cual puede interactuar y monitorear los mismos datos que desde la pagina web.
