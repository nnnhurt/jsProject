import { Router } from 'express';
import { Dog } from '../models/Dog.js';

const router = Router();

// POST /dogs - create a new dog
router.post('/', async (req, res) => {
  try {
    const { name, breed } = req.body ?? {};
    if (typeof name !== 'string' || typeof breed !== 'string') {
      return res.status(400).json({ error: 'Invalid body: name and breed are required' });
    }
    const dog = await Dog.create({ name, breed });
    return res.status(201).json({ id: dog.id, name: dog.name, breed: dog.breed, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create dog' });
  }
});

// POST /dogs/:id/pet - increase happiness by 20, max 100
router.post('/:id/pet', async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    dog.happinessLevel = Math.min(100, dog.happinessLevel + 20);
    await dog.save();
    return res.json({ id: dog.id, name: dog.name, breed: dog.breed, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to pet dog' });
  }
});

// GET /dogs/:id - get dog by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    return res.json({ id: dog.id, name: dog.name, breed: dog.breed, happinessLevel: dog.happinessLevel });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get dog' });
  }
});

export default router;


