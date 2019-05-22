'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');

const passport = require('./config/passport');

const app = express();
app.use(logger('dev')); // Log requests (GET, POST, ...)
app.use(express.urlencoded({ extended: true })); // needed to retrieve html form fields
app.use(cookieParser()); // needed to retrieve html form fields
app.use(passport.initialize()); // initialise the authentication middleware

/**
 * Load routes
 */
const routes = require('./routes/index');
app.use('/', routes);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(3000);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
