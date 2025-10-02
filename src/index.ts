// просто старт
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app } from './app.js';
import { connectToDatabase } from './lib/db.js';

const port = Number(process.env.PORT || 3000);

async function start() {
  await connectToDatabase();
  const server = http.createServer(app);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Dog Explorer API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});


