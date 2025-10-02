// случайные изображения
import { Router } from 'express';
import axios from 'axios';

const router = Router();

const DOG_CEO_BASE = process.env.DOG_CEO_API_BASE || 'https://dog.ceo/api';

router.get('/random', async (_req, res) => {
  try {
    const { data } = await axios.get(`${DOG_CEO_BASE}/breeds/image/random`);
    res.json({ imageUrl: data?.message });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch random image' });
  }
});

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


