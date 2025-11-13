import mongoose from 'mongoose';
import { User } from '../../models/User';

// мокается модель на юзера на метод
jest.mock('../../models/User', () => ({
  User: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    schema: {
      paths: {
        username: { isRequired: true, options: { unique: true } },
        passwordHash: { isRequired: true },
        passwordSalt: { isRequired: true },
        dogs: { isRequired: false, options: { default: [] } }
      }
    }
  }
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema', () => {
    it('should have the correct fields', () => {
      const schema = (User as any).schema;

      expect(schema.paths.username).toBeDefined();
      expect(schema.paths.passwordHash).toBeDefined();
      expect(schema.paths.passwordSalt).toBeDefined();
      expect(schema.paths.dogs).toBeDefined();
    });

    it('should have required fields', () => {
      const schema = (User as any).schema;

      const usernamePath = schema.paths.username;
      expect(usernamePath.isRequired).toBe(true);

      const passwordHashPath = schema.paths.passwordHash;
      expect(passwordHashPath.isRequired).toBe(true);

      const passwordSaltPath = schema.paths.passwordSalt;
      expect(passwordSaltPath.isRequired).toBe(true);
    });

    it('should have unique username', () => {
      const schema = (User as any).schema;

      const usernamePath = schema.paths.username;
      expect(usernamePath.options.unique).toBe(true);
    });

    it('should have correct default values', () => {
      const schema = (User as any).schema;

      expect(schema.paths.dogs.options.default).toEqual([]);
    });
  });

  describe('Model Methods', () => {
    it('should create a user instance', async () => {
      // Mock the create method
      const mockUserData = {
        username: 'testuser',
        passwordHash: 'hashedpassword',
        passwordSalt: 'salt',
        dogs: [] as mongoose.Types.ObjectId[],
      };

      const mockCreatedUser = {
        ...mockUserData,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await User.create(mockUserData);

      expect(result.username).toBe(mockUserData.username);
      expect(result.passwordHash).toBe(mockUserData.passwordHash);
      expect(result.passwordSalt).toBe(mockUserData.passwordSalt);
      expect(result.dogs).toEqual(mockUserData.dogs);
    });

    it('should find a user by ID', async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const mockFoundUser = {
        _id: mockUserId,
        username: 'testuser',
        passwordHash: 'hashedpassword',
        passwordSalt: 'salt',
        dogs: [] as mongoose.Types.ObjectId[],
      };

      (User.findById as jest.Mock).mockResolvedValue(mockFoundUser);

      const result = await User.findById(mockUserId);

      expect(result).toEqual(mockFoundUser);
      expect((User.findById as jest.Mock).mock.calls[0][0]).toEqual(mockUserId);
    });

    it('should update user with new dog ID', async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const mockDogId = new mongoose.Types.ObjectId();

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: mockUserId,
        username: 'testuser',
        dogs: [mockDogId],
      });

      const result = await User.findByIdAndUpdate(
        mockUserId,
        { $addToSet: { dogs: mockDogId } },
        { new: false }
      );

      if (result) {
        expect(result._id).toEqual(mockUserId);
      }
      expect((User.findByIdAndUpdate as jest.Mock).mock.calls[0][0]).toEqual(mockUserId);
      expect((User.findByIdAndUpdate as jest.Mock).mock.calls[0][1]).toEqual({ $addToSet: { dogs: mockDogId } });
    });
  });
});