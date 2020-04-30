'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const passport = require('./config/passport')

const app = express()

app.use(logger('dev')) // Log requests (GET, POST, ...)
app.use(express.urlencoded({ extended: true })) // needed to retrieve html form fields
app.use(cookieParser()) // needed to retrieve html form fields
app.use(express.json()) // needed to parse input json
app.use(passport.initialize()) // initialise the authentication middleware

/**
 * Load routes
 */
const webRoutes = require('./routes/index')
app.use('/', webRoutes)
const api = require('./routes/api')
app.use('/api', api)

/**
 * Create HTTPs server.
 */
const https = require('https')
const fs = require('fs')

const tlsConfig = require('./config/tls/')
const credentials = {
  key: fs.readFileSync(tlsConfig.privateKey),
  cert: fs.readFileSync(tlsConfig.certificate)
}
var server = https.createServer(credentials, app)

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(8443)
server.on('listening', onListening)

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  console.log('Listening on ' + bind)
}
