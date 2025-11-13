import request from 'supertest';
import express from 'express';
import breedsRouter from '../../routes/breeds';
import axios from 'axios';

// мокается axios чтобы не происходило настоящих апи запросов
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.use('/breeds', breedsRouter);

describe('Breeds Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /breeds', () => {
    it('should return a list of breeds', async () => {
      // мокается апи респонсы
      mockAxios.get.mockResolvedValue({
        data: {
          message: {
            'affenpinscher': [],
            'african': [],
            'airedale': [],
            'akita': [],
          }
        }
      });

      const response = await request(app)
        .get('/breeds')
        .expect(200);

      expect(response.body).toEqual({
        breeds: ['affenpinscher', 'african', 'airedale', 'akita']
      });
      expect(mockAxios.get).toHaveBeenCalledWith('https://dog.ceo/api/breeds/list/all');
    });

    it('should return an error if API call fails', async () => {
      // Mock API failure
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/breeds')
        .expect(502);

      expect(response.body).toEqual({
        error: 'Failed to fetch breeds'
      });
    });
  });

  describe('GET /breeds/:breed/images/random', () => {
    it('should return a random image for a breed', async () => {
      // Mock API response
      mockAxios.get.mockResolvedValue({
        data: {
          message: 'https://example.com/image.jpg'
        }
      });

      const response = await request(app)
        .get('/breeds/golden/images/random')
        .expect(200);

      expect(response.body).toEqual({
        breed: 'golden',
        imageUrl: 'https://example.com/image.jpg'
      });
      expect(mockAxios.get).toHaveBeenCalledWith('https://dog.ceo/api/breed/golden/images/random');
    });

    it('should return an error if API call fails', async () => {
      // Mock API failure
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/breeds/golden/images/random')
        .expect(502);

      expect(response.body).toEqual({
        error: 'Failed to fetch breed image'
      });
    });
  });

  describe('GET /breeds/:breed/info', () => {
    it('should return breed information', async () => {
      // Mock API response
      mockAxios.get.mockResolvedValue({
        data: [
          {
            weight: { metric: '25-34' },
            height: { metric: '58-61' },
            life_span: '10-12 years',
            temperament: 'Outgoing, Mischievous, Alert, Dignified, Intelligent, Happy'
          }
        ]
      });

      const response = await request(app)
        .get('/breeds/golden/info')
        .expect(200);

      expect(response.body).toEqual({
        breed: 'golden',
        weight: '25-34',
        height: '58-61',
        life_span: '10-12 years',
        temperament: 'Outgoing, Mischievous, Alert, Dignified, Intelligent, Happy'
      });
    });

    it('should return 404 if breed is not found', async () => {
      // Mock empty array response
      mockAxios.get.mockResolvedValue({
        data: []
      });

      const response = await request(app)
        .get('/breeds/nonexistent/info')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Breed not found'
      });
    });

    it('should return an error if API call fails', async () => {
      // Mock API failure
      mockAxios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/breeds/golden/info')
        .expect(502);

      expect(response.body).toEqual({
        error: 'Failed to fetch breed info'
      });
    });
  });
});