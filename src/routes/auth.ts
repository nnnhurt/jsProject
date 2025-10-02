import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { User } from '../models/User.js';

const router = Router();

function signAccessToken(subject: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign({ sub: subject }, secret, { algorithm: 'HS256', expiresIn: '15m' });
}

function signRefreshToken(subject: string) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');
  return jwt.sign({ sub: subject, typ: 'refresh' }, secret, { algorithm: 'HS256', expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 32);
  const passwordHash = derived.toString('hex');
  const passwordSalt = salt.toString('hex');
  const user = await User.create({ username, passwordHash, passwordSalt });
  return res.status(201).json({ id: user.id, username: user.username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const derived = scryptSync(password, Buffer.from(user.passwordSalt, 'hex'), 32);
  const ok = timingSafeEqual(Buffer.from(user.passwordHash, 'hex'), derived);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  return res.json({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'refreshToken is required' });
  }
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const accessSecret = process.env.JWT_SECRET;
  if (!refreshSecret || !accessSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT secrets not set' });
  }
  try {
    const payload = jwt.verify(refreshToken, refreshSecret) as jwt.JwtPayload;
    if (payload.typ !== 'refresh' || typeof payload.sub !== 'string') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const newAccess = jwt.sign({ sub: payload.sub }, accessSecret, { algorithm: 'HS256', expiresIn: '15m' });
    return res.json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;


