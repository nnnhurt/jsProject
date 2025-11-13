// инициализация экспресса
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { jwtMiddleware } from './middleware/auth';
import breedsRouter from './routes/breeds';
import imagesRouter from './routes/images';
import dogsRouter from './routes/dogs';
import authRouter from './routes/auth';

export const app = express();
// создается приложение, подключаются роутеры.
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRouter);

app.use('/breeds', breedsRouter);
app.use('/images', imagesRouter);
app.use('/dogs', jwtMiddleware, dogsRouter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Simple health check to verify the API is running
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Swagger UI middleware
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { options } from './swaggerOptions';

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});


