#!/usr/bin/env node

import "./init/index.js";

/**
 * Module dependencies.
 */

import app from '../src/app.js';
import debug from 'debug';
import http from 'http';
import { PORT } from "./init/server.js";

const serverDebug = debug('server:server');

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string'
    ? `Pipe ${PORT}`
    : `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  serverDebug(`Listening on ${bind}`);
  console.log(`✅ Server is running on http://localhost:${PORT}`);
};

/**
 * Get port from environment and store in Express.
 */
app.set('port', PORT);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Graceful shutdown
 */
const gracefulShutdown = () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);