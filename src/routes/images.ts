import { Router } from 'express';
import axios from 'axios';

const router = Router();

// GET /images/random
router.get('/random', async (_req, res) => {
  try {
    const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
    res.json({ imageUrl: data?.message });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch random image' });
  }
});

// GET /breeds/:breed/images/random -> mirror under /breeds router, but also support here
router.get('/breed/:breed/random', async (req, res) => {
  const breed = req.params.breed;
  try {
    const { data } = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`);
    res.json({ breed, imageUrl: data?.message });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch breed image' });
  }
});

export default router;


