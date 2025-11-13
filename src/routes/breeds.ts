import { Router } from 'express';
import axios from 'axios';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';
const THE_DOG_API_BASE = process.env.THE_DOG_API_BASE || 'https://api.thedogapi.com/v1';

/**
 * @swagger
 * tags:
 *   name: Breeds
 *   description: Dog breeds management
 */

/**
 * @swagger
 * /breeds:
 *   get:
 *     summary: List all dog breeds
 *     tags: [Breeds]
 *     description: Retrieve a list of all dog breeds from Dog CEO API
 *     responses:
 *       200:
 *         description: A list of dog breeds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 breeds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of breed names
 *       502:
 *         description: Failed to fetch breeds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch breeds
 */
router.get('/', async (_req, res) => {
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breeds/list/all`);
    const breedsObject = data?.message || {};
    const breeds = Object.keys(breedsObject);
    return res.json({ breeds });
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch breeds' });
  }
});

/**
 * @swagger
 * /breeds/{breed}/images/random:
 *   get:
 *     summary: Get a random image for a specific breed
 *     tags: [Breeds]
 *     description: Retrieve a random image URL for the specified breed
 *     parameters:
 *       - in: path
 *         name: breed
 *         required: true
 *         schema:
 *           type: string
 *         description: The breed name
 *     responses:
 *       200:
 *         description: A random image for the breed
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
router.get('/:breed/images/random', async (req, res) => {
  const breed = req.params.breed;
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breed/${breed}/images/random`);
    return res.json({ breed, imageUrl: data?.message });
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch breed image' });
  }
});

/**
 * @swagger
 * /breeds/{breed}/info:
 *   get:
 *     summary: Get detailed information for a specific breed
 *     tags: [Breeds]
 *     description: Retrieve detailed information about the specified breed from The Dog API
 *     parameters:
 *       - in: path
 *         name: breed
 *         required: true
 *         schema:
 *           type: string
 *         description: The breed name
 *     responses:
 *       200:
 *         description: Detailed information about the breed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 breed:
 *                   type: string
 *                   description: The breed name
 *                 weight:
 *                   type: string
 *                   description: Weight range of the breed
 *                 height:
 *                   type: string
 *                   description: Height range of the breed
 *                 life_span:
 *                   type: string
 *                   description: Life span of the breed
 *                 temperament:
 *                   type: string
 *                   description: Temperament of the breed
 *       404:
 *         description: Breed not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Breed not found
 *       502:
 *         description: Failed to fetch breed info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch breed info
 */
router.get('/:breed/info', async (req, res) => {
  const breed = req.params.breed;
  try {
    const apiKey = process.env.THE_DOG_API_KEY;
    const { data } = await axios.get(`${THE_DOG_API_BASE}/breeds/search`, {
      params: { q: breed },
      headers: apiKey ? { 'x-api-key': apiKey } : undefined
    });
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: 'Breed not found' });
    }
    const b = data[0];
    return res.json({
      breed,
      weight: b.weight?.metric ?? null,
      height: b.height?.metric ?? null,
      life_span: b.life_span ?? null,
      temperament: b.temperament ?? null
    });
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch breed info' });
  }
});

export default router;


