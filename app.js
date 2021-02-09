'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const passport = require('./config/passport')

const app = express()
app.use(logger('dev')) // Log requests (GET, POST, ...)
app.use(express.urlencoded({ extended: true })) // needed to retrieve html form fields
app.use(cookieParser()) // needed to retrieve html form fields
app.use(passport.initialize()) // initialise the authentication middleware

/**
 * Load routes
 */
const routes = require('./routes/index')
app.use('/', routes)

/**
 * Create HTTPs server.
 */
const https = require('https')
const fs = require('fs')

const tlsConfig = require('./config/tls/config')
const credentials = {
  key: fs.readFileSync(tlsConfig.privateKey),
  cert: fs.readFileSync(tlsConfig.certificate)
}
var server = https.createServer(credentials, app)

/**
 * Listen on localhost 443/tcp
 */
const port = 8443
const addr = 'localhost'
server.listen(port, addr)
server.on('listening', onListening)

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
  console.log(`Listening on https://${addr}:${port}`)
}
