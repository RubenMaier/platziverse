'use strict'

const utils = require('../../utils/extend')

const extend = utils.extend

const agent = { // creamos un objeto de un agente
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [ // tambien creamos un arreglo de agentes por si queremos listarlos o crear algo loco
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test' }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' })
] // de momento le ponemos 4 agentes, 3 son clonados del primero con algunos atributos cambiados

module.exports = {
  single: agent, // me devuelve solo 1 agente y el primero creado
  all: agents, // me devuelve todos los agentes
  connected: agents.filter(a => a.connected), // me devuelve todos los conectados
  platzi: agents.filter(a => a.username === 'platzi'), // me devuelve todos los agentes del usuario platzi
  byUuid: id => agents.filter(a => a.uuid === id).shift(), //  me devuelve el agente que cumpla con la uiid X pero solo el primer elemento
  byId: id => agents.filter(a => a.id === id).shift() // me devuelve el agente que cumpla con la id X pero solo el primer elemento
}
