#!/usr/bin/env node

/**
 * npm install node-fetch@2 ws dotenv openai cors
 * npm run dev
 */

import dotenv from 'dotenv';
dotenv.config(); // 기본 .env 파일 로드

// 환경변수 로드 확인
console.log('🔑 환경변수 로드 확인:');
console.log(`   NAVER_CLIENT_ID: ${process.env.NAVER_CLIENT_ID ? '설정됨' : '미설정'}`);
console.log(`   NAVER_CLIENT_SECRET: ${process.env.NAVER_CLIENT_SECRET ? '설정됨' : '미설정'}`);
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨' : '미설정'}`);
console.log(`   🏛️ KOREAN_DICT_API_KEY: ${process.env.KOREAN_DICT_API_KEY ? '설정됨' : '미설정'}`);
console.log(`   📸 UNSPLASH_ACCESS_KEY: ${process.env.UNSPLASH_ACCESS_KEY ? '설정됨' : '미설정'}`);

import http from 'http';
import app from './src/app.js';
import setupWSProxy from './src/ws-proxy.mjs';

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || '8081');
app.set('port', port);

const server = http.createServer(app);

setupWSProxy(server);

server.listen(port);

server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  
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
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('🚀 Server listening on ' + bind);
});