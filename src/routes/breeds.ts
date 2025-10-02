import { Router } from 'express';
import axios from 'axios';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';
const THE_DOG_API_BASE = process.env.THE_DOG_API_BASE || 'https://api.thedogapi.com/v1';

// GET /breeds - list all breeds from Dog CEO API
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

// GET /breeds/:breed/images/random - image for a breed
router.get('/:breed/images/random', async (req, res) => {
  const breed = req.params.breed;
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breed/${breed}/images/random`);
    return res.json({ breed, imageUrl: data?.message });
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch breed image' });
  }
});

// GET /breeds/:breed/info - info from The Dog API
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


