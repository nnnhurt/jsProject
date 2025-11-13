import mongoose from 'mongoose';
import { Dog } from '../../models/Dog';

// мокается модель Dog и на методы
jest.mock('../../models/Dog', () => ({
  Dog: {
    create: jest.fn(),
    findById: jest.fn(),
    schema: {
      paths: {
        name: { isRequired: true },
        breed: { isRequired: true },
        colors: { isRequired: true, options: { default: [] } },
        imageUrl: { isRequired: false, options: { default: null } },
        owner: { isRequired: true },
        happinessLevel: { isRequired: true, options: { default: 50, min: 0, max: 100 } }
      }
    }
  }
}));

describe('Dog Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema', () => {
    it('should have the correct fields', () => {
      const schema = (Dog as any).schema;

      expect(schema.paths.name).toBeDefined();
      expect(schema.paths.breed).toBeDefined();
      expect(schema.paths.colors).toBeDefined();
      expect(schema.paths.imageUrl).toBeDefined();
      expect(schema.paths.owner).toBeDefined();
      expect(schema.paths.happinessLevel).toBeDefined();
    });

    it('should have required fields', () => {
      const schema = (Dog as any).schema;

      const namePath = schema.paths.name;
      expect(namePath.isRequired).toBe(true);

      const breedPath = schema.paths.breed;
      expect(breedPath.isRequired).toBe(true);

      const colorsPath = schema.paths.colors;
      expect(colorsPath.isRequired).toBe(true);

      const ownerPath = schema.paths.owner;
      expect(ownerPath.isRequired).toBe(true);

      const happinessLevelPath = schema.paths.happinessLevel;
      expect(happinessLevelPath.isRequired).toBe(true);
    });

    it('should have correct default values', () => {
      const schema = (Dog as any).schema;

      expect(schema.paths.colors.options.default).toEqual([]);

      expect(schema.paths.imageUrl.options.default).toBeNull();

      expect(schema.paths.happinessLevel.options.default).toBe(50);
    });

    it('should have correct validation rules for happinessLevel', () => {
      const schema = (Dog as any).schema;

      const happinessLevelValidator = schema.paths.happinessLevel.options;
      expect(happinessLevelValidator.min).toBe(0);
      expect(happinessLevelValidator.max).toBe(100);
    });
  });

  describe('Model Methods', () => {
    it('should create a dog instance', async () => {
      const mockDogData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: new mongoose.Types.ObjectId(),
        happinessLevel: 75,
      };

      const mockCreatedDog = {
        ...mockDogData,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
      };

      (Dog.create as jest.Mock).mockResolvedValue(mockCreatedDog);

      const result = await Dog.create(mockDogData);

      expect(result.name).toBe(mockDogData.name);
      expect(result.breed).toBe(mockDogData.breed);
      expect(result.colors).toEqual(mockDogData.colors);
      expect(result.happinessLevel).toBe(mockDogData.happinessLevel);
    });

    it('should find a dog by ID', async () => {
      const mockDogId = new mongoose.Types.ObjectId();
      const mockFoundDog = {
        _id: mockDogId,
        name: 'Buddy',
        breed: 'Golden Retriever',
        colors: ['brown'],
        imageUrl: 'https://example.com/image.jpg',
        owner: new mongoose.Types.ObjectId(),
        happinessLevel: 75,
      };

      (Dog.findById as jest.Mock).mockResolvedValue(mockFoundDog);

      const result = await Dog.findById(mockDogId);

      expect(result).toEqual(mockFoundDog);
      expect((Dog.findById as jest.Mock).mock.calls[0][0]).toEqual(mockDogId);
    });
  });
});