// случайные изображения
import { Router } from 'express';
import axios from 'axios';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Dog images management
 */

/**
 * @swagger
 * /images/random:
 *   get:
 *     summary: Get a random dog image
 *     tags: [Images]
 *     description: Retrieve a random dog image from Dog CEO API
 *     responses:
 *       200:
 *         description: A random dog image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the random dog image
 *       502:
 *         description: Failed to fetch random image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch random image
 */
router.get('/random', async (_req, res) => {
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breeds/image/random`);
    res.json({ imageUrl: data?.message });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch random image' });
  }
});

/**
 * @swagger
 * /images/breed/{breed}/random:
 *   get:
 *     summary: Get a random image for a specific breed
 *     tags: [Images]
 *     description: Retrieve a random image for a specific breed from Dog CEO API
 *     parameters:
 *       - in: path
 *         name: breed
 *         required: true
 *         schema:
 *           type: string
 *         description: The breed name
 *     responses:
 *       200:
 *         description: A random image for the specified breed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 breed:
 *                   type: string
 *                   description: The breed name
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the breed image
 *       502:
 *         description: Failed to fetch breed image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch breed image
 */
router.get('/breed/:breed/random', async (req, res) => {
  const breed = req.params.breed;
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breed/${breed}/images/random`);
    res.json({ breed, imageUrl: data?.message });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch breed image' });
  }
});

export default router;


