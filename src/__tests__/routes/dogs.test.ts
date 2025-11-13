import request from 'supertest';
import express from 'express';
import dogsRouter from '../../routes/dogs';
import { Dog } from '../../models/Dog';
import { User } from '../../models/User';
import axios from 'axios';

// мокается для запросов
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../models/Dog');
jest.mock('../../models/User');

const app = express();
app.use(express.json());

app.use((req, _res, next) => {
  (req as any).user = { sub: 'mock-user-id' };
  next();
});

app.use('/dogs', dogsRouter);

describe('Dogs Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /dogs', () => {
    it('should create a new dog', async () => {
      // Mock breed validation API
      mockAxios.get.mockResolvedValueOnce({
        data: {
          message: {
            'golden': [],
            'labrador': [],
          }
        }
      });

      // Mock dog creation
      const mockDog = {
        _id: 'mock-dog-id',
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 50,
        save: jest.fn(),
      };
      
      (Dog.create as jest.Mock).mockResolvedValue(mockDog);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/dogs')
        .send({
          name: 'Buddy',
          breed: 'golden',
          colors: ['brown'],
          imageUrl: 'https://example.com/image.jpg'
        })
        .expect(201);

      expect(response.body).toEqual({
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 50
      });
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/dogs')
        .send({
          breed: 'golden', // missing name
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid body: name and breed are required'
      });
    });

    it('should return 400 for invalid breed', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          message: {
            'labrador': [],
          }
        }
      });

      const response = await request(app)
        .post('/dogs')
        .send({
          name: 'Buddy',
          breed: 'invalid-breed',
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid breed. Use /breeds to list available breeds.'
      });
    });

    it('should return 502 if breed validation fails', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app)
        .post('/dogs')
        .send({
          name: 'Buddy',
          breed: 'golden',
        })
        .expect(502);

      expect(response.body).toEqual({
        error: 'Failed to validate breed against external API'
      });
    });
  });

  describe('POST /dogs/:id/pet', () => {
    it('should increase dog happiness level', async () => {
      const mockDog = {
        _id: 'mock-dog-id',
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (Dog.findById as jest.Mock).mockResolvedValue(mockDog);

      const response = await request(app)
        .post('/dogs/mock-dog-id/pet')
        .expect(200);

      expect(response.body).toEqual({
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 70 // 50 + 20
      });
    });

    it('should cap happiness level at 100', async () => {
      const mockDog = {
        _id: 'mock-dog-id',
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 90,
        save: jest.fn().mockResolvedValue(true),
      };

      (Dog.findById as jest.Mock).mockResolvedValue(mockDog);

      const response = await request(app)
        .post('/dogs/mock-dog-id/pet')
        .expect(200);

      expect(response.body).toEqual({
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 100 // capped at 100
      });
    });

    it('should return 404 if dog not found', async () => {
      (Dog.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/dogs/nonexistent-id/pet')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Dog not found'
      });
    });
  });

  describe('GET /dogs/:id', () => {
    it('should return a dog by ID', async () => {
      const mockDog = {
        _id: 'mock-dog-id',
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 50,
      };

      (Dog.findById as jest.Mock).mockResolvedValue(mockDog);

      const response = await request(app)
        .get('/dogs/mock-dog-id')
        .expect(200);

      expect(response.body).toEqual({
        id: 'mock-dog-id',
        name: 'Buddy',
        breed: 'golden',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: 'mock-user-id',
        happinessLevel: 50
      });
    });

    it('should return 404 if dog not found', async () => {
      (Dog.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/dogs/nonexistent-id')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Dog not found'
      });
    });
  });
});