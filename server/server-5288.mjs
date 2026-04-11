#!/usr/bin/env node

/**
 * Server running on port 5288 for serving Vue client
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import http from 'http';
import express from 'express';
import path from 'path';
import { dirname } from 'dirname-filename-esm';
import setupWSProxy from './src/ws-proxy.mjs';

const __dirname = dirname(import.meta);

const app = express();
const port = 5288;

// Serve static files from Vue build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch all routes for Vue SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const server = http.createServer(app);

// Setup WebSocket proxy for RTZR
setupWSProxy(server);

server.listen(port);

server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;

  const bind = 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  console.log('🚀 Vue client server listening on port ' + port);
  console.log('📦 Serving files from: ' + path.join(__dirname, '../client/dist'));
});