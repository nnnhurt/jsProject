import { Router } from 'express';
import axios from 'axios';
import { Dog } from '../models/Dog.js';
import { User } from '../models/User.js';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';

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

export default router;


