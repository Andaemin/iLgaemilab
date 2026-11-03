import express from 'express';
import path from 'path';
import { dirname } from 'dirname-filename-esm';

const router = express.Router();
const __dirname = dirname(import.meta);

// Serve Vue app's index.html for the root route
router.get('/', (req, res) => {
  const clientDistPath = path.join(__dirname, '../../../client/dist/index.html');
  res.sendFile(clientDistPath);
});

// API root
router.get('/api', (req, res) => {
  res.json({
    message: 'API Server',
    version: '1.0.0',
    endpoints: {
      users: '/api/users'
    }
  });
});

export default router;