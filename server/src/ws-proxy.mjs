import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';

let tokenCache = {
  token: null,
  expireAt: null
};

async function getToken() {
  const now = Date.now();
  
  if (tokenCache.token && tokenCache.expireAt && now < tokenCache.expireAt - 60000) {
    return tokenCache.token;
  }

  const response = await fetch('https://openapi.vito.ai/v1/authenticate', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'client_id': process.env.RTZR_CLIENT_ID,
      'client_secret': process.env.RTZR_SECRET_KEY
    })
  });

  if (!response.ok) {
    throw new Error(`RTZR auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  tokenCache.token = data.access_token;
  tokenCache.expireAt = now + (data.expire_at * 1000);

  return data.access_token;
}

function setupWSProxy(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url && request.url.startsWith('/ws/rtzr')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (clientWs, request) => {
    console.log('Client WebSocket connected from:', request.url);
    let rtzrWs = null;
    let isClosing = false;
    
    try {
      const token = await getToken();
      console.log('Got RTZR token');
      
      const url = new URL(request.url, `http://${request.headers.host}`);
      const params = new URLSearchParams({
        encoding: url.searchParams.get('encoding') || 'OGG_OPUS',
        model_name: url.searchParams.get('model_name') || 'sommers_ko',
        use_punctuation: url.searchParams.get('use_punctuation') || 'true',
        domain: url.searchParams.get('domain') || 'CALL',
        sample_rate: url.searchParams.get('sample_rate') || '16000'
      });

      const rtzrUrl = `wss://openapi.vito.ai/v1/transcribe:streaming?${params}`;
      console.log('Connecting to RTZR:', rtzrUrl);
      
      rtzrWs = new WebSocket(rtzrUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      rtzrWs.on('open', () => {
        console.log('RTZR WebSocket connected');
      });

      rtzrWs.on('message', (data) => {
        // RTZR 응답 로깅
        console.log('RTZR message received:', data.toString());
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      });

      rtzrWs.on('close', (code, reason) => {
        const closeReason = code === 1005 ? 'Normal closure' : `Code: ${code}`;
        console.log('RTZR WebSocket closed:', closeReason);
        if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send('EOS');
          clientWs.close();
        }
        isClosing = true;
      });

      rtzrWs.on('error', (error) => {
        console.error('RTZR WebSocket error:', error);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close(1011, 'RTZR connection error');
        }
      });

      clientWs.on('message', (data) => {
        if (rtzrWs && rtzrWs.readyState === WebSocket.OPEN) {
          rtzrWs.send(data);
        }
      });

      clientWs.on('close', (code, reason) => {
        const closeReason = code === 1005 ? 'Normal closure' : `Code: ${code}`;
        console.log('Client WebSocket closed:', closeReason);
        isClosing = true;
        if (rtzrWs && rtzrWs.readyState === WebSocket.OPEN) {
          rtzrWs.close();
        }
      });

      clientWs.on('error', (error) => {
        console.error('Client WebSocket error:', error);
        if (rtzrWs && rtzrWs.readyState === WebSocket.OPEN) {
          rtzrWs.close();
        }
      });

    } catch (error) {
      console.error('WebSocket proxy setup error:', error);
      isClosing = true;
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, 'Proxy setup failed');
      }
      if (rtzrWs && rtzrWs.readyState === WebSocket.OPEN) {
        rtzrWs.close();
      }
    }
  });
}

export default setupWSProxy;