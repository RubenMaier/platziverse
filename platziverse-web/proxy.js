'use strict'

const express = require('express')
const request = require('request-promise-native')
const asyncify = require('express-asyncify')
const { endpoint, apiToken } = require('platziverse-utils')

const api = asyncify(express.Router())

api.get('/agents', async (req, res, next) => {
  const opciones = {
    methohd: 'GET',
    url: `${endpoint}/api/agents`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }
  let result
  try {
    result = await request(opciones)
  } catch (e) {
    return next(e)
  }
  res.send(result)
})

api.get('/agent/:uuid', (req, res) => {

})

api.get('/metrics/:uuid', (req, res) => {

})

api.get('/metrics/:uuid/:type', (req, res) => {

})

module.exports = api
