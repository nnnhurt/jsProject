import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authMiddleware } from './middleware/auth.js';
import breedsRouter from './routes/breeds.js';
import imagesRouter from './routes/images.js';
import dogsRouter from './routes/dogs.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(authMiddleware);

app.use('/breeds', breedsRouter);
app.use('/images', imagesRouter);
app.use('/dogs', dogsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});


