import { Router } from 'express';
import axios from 'axios';
import { Dog } from '../models/Dog';
import { User } from '../models/User';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';

/**
 * @swagger
 * tags:
 *   name: Dogs
 *   description: User's dogs management
 */

/**
 * @swagger
 * /dogs:
 *   post:
 *     summary: Create a new dog
 *     tags: [Dogs]
 *     description: Creates a new dog for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The dog's name
 *                 example: Buddy
 *               breed:
 *                 type: string
 *                 description: The dog's breed
 *                 example: golden
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The dog's colors
 *                 example: ["golden", "white"]
 *               imageUrl:
 *                 type: string
 *                 description: URL of the dog's image
 *                 example: "https://example.com/dog.jpg"
 *     responses:
 *       201:
 *         description: Dog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The dog's ID
 *                 name:
 *                   type: string
 *                   description: The dog's name
 *                 breed:
 *                   type: string
 *                   description: The dog's breed
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The dog's colors
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the dog's image
 *                 owner:
 *                   type: string
 *                   description: The owner's ID
 *                 happinessLevel:
 *                   type: number
 *                   description: The dog's happiness level
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid body: name and breed are required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Failed to create dog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create dog
 */
router.post('/', async (req, res) => {
  try {
    const { name, breed, colors, imageUrl } = req.body ?? {};
    if (typeof name !== 'string' || typeof breed !== 'string') {
      return res.status(400).json({ error: 'Invalid body: name and breed are required' });
    }
    if (colors !== undefined && !Array.isArray(colors)) {
      return res.status(400).json({ error: 'Invalid body: colors must be an array of strings' });
    }
    if (Array.isArray(colors) && !colors.every((c) => typeof c === 'string')) {
      return res.status(400).json({ error: 'Invalid body: colors must be an array of strings' });
    }

    try {
      const { data } = await axios.get(`${DOG_CEO_BASE}/breeds/list/all`);
      const breedsObject = data?.message || {};
      const isValidBreed = Object.prototype.hasOwnProperty.call(breedsObject, breed);
      if (!isValidBreed) {
        return res.status(400).json({ error: 'Invalid breed. Use /breeds to list available breeds.' });
      }
    } catch (err) {
      return res.status(502).json({ error: 'Failed to validate breed against external API' });
    }

    const userPayload = (req as any).user as { sub?: string } | undefined;
    const ownerId = userPayload?.sub;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let finalImageUrl: string | null = null;
    if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
      finalImageUrl = imageUrl.trim();
    } else {
      try {
        const { data } = await axios.get(`${DOG_CEO_BASE}/breed/${breed}/images/random`);
        finalImageUrl = typeof data?.message === 'string' ? data.message : null;
      } catch {
        finalImageUrl = null;
      }
    }

    const dog = await Dog.create({ name, breed, colors: colors ?? [], imageUrl: finalImageUrl, owner: ownerId });

    try {
      await User.findByIdAndUpdate(ownerId, { $addToSet: { dogs: dog._id } }, { new: false });
    } catch {}

    return res.status(201).json({ id: dog.id, name: dog.name, breed: dog.breed, colors: dog.colors, imageUrl: dog.imageUrl, owner: dog.owner, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create dog' });
  }
});

/**
 * @swagger
 * /dogs/{id}:
 *   get:
 *     summary: Get a specific dog by ID
 *     tags: [Dogs]
 *     description: Retrieves details of a specific dog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The dog's ID
 *     responses:
 *       200:
 *         description: Dog details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The dog's ID
 *                 name:
 *                   type: string
 *                   description: The dog's name
 *                 breed:
 *                   type: string
 *                   description: The dog's breed
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The dog's colors
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the dog's image
 *                 owner:
 *                   type: string
 *                   description: The owner's ID
 *                 happinessLevel:
 *                   type: number
 *                   description: The dog's happiness level
 *       404:
 *         description: Dog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Dog not found
 *       500:
 *         description: Failed to get dog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to get dog
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    return res.json({ id: dog.id, name: dog.name, breed: dog.breed, colors: dog.colors, imageUrl: dog.imageUrl, owner: dog.owner, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get dog' });
  }
});

/**
 * @swagger
 * /dogs/{id}/pet:
 *   post:
 *     summary: Pet a specific dog
 *     tags: [Dogs]
 *     description: Increases the happiness level of a specific dog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The dog's ID
 *     responses:
 *       200:
 *         description: Dog pet successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The dog's ID
 *                 name:
 *                   type: string
 *                   description: The dog's name
 *                 breed:
 *                   type: string
 *                   description: The dog's breed
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The dog's colors
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the dog's image
 *                 owner:
 *                   type: string
 *                   description: The owner's ID
 *                 happinessLevel:
 *                   type: number
 *                   description: The dog's happiness level (increased by 20)
 *       404:
 *         description: Dog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Dog not found
 *       500:
 *         description: Failed to pet dog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to pet dog
 */
router.post('/:id/pet', async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    dog.happinessLevel = Math.min(100, dog.happinessLevel + 20);
    await dog.save();
    return res.json({ id: dog.id, name: dog.name, breed: dog.breed, colors: dog.colors, imageUrl: dog.imageUrl, owner: dog.owner, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to pet dog' });
  }
});

export default router;


