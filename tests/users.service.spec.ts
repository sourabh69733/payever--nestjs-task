import { config } from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { EmailService } from '../src/email/email.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as crypto from 'crypto';
import * as fs from 'fs';

config();

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let httpService: HttpService;

  const mockUser = {
    _id: '1',
    name: 'John Doe',
    email: 'test@example.com',
    avatar: '',
    avatarHash: '',
    save: jest.fn(),
  };

  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    save: jest.fn(),
  };

  const mockReqresResponse = {
    data: {
      data: {
        id: '1',
        email: 'janet.weaver@reqres.in',
        first_name: 'Janet',
        last_name: 'Weaver',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
      },
    },
  };

  const mockHttpService = {
    get: jest.fn().mockReturnValue(of(mockReqresResponse)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        EmailService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'test@example.com',
      id: '1',
      avatar: 'https://reqres.in/img/faces/1-image.jpg',
    };

    const userRes = await userModel.create(createUserDto);

    expect(userRes).toEqual(mockUser);
    expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should retrieve a user by ID', async () => {
    const userId = '1';
    const user = await service.findOne(userId);

    expect(user).toEqual(mockReqresResponse.data.data);
  });

  it('should delete user avatar', async () => {
    const userId = '1';
    const mockUser = {
      _id: userId,
      avatarHash: 'hashed-avatar',
      save: jest.fn(),
    };

    mockUserModel.findById.mockResolvedValue(mockUser);

    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    await service.deleteAvatar(userId);

    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    expect(fs.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining('uploads/hashed-avatar.png'),
    );
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should retrieve and store user avatar', async () => {
    const userId = '1';
    const avatarUrl = 'https://reqres.in/img/faces/1-image.jpg';
    const avatarBuffer = Buffer.from('avatar-image');
    const mockUser = {
      _id: userId,
      avatar: avatarUrl,
      avatarHash: '',
      save: jest.fn(),
    };

    mockUserModel.findById.mockResolvedValue(mockUser);
    jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
    mockHttpService.get = jest.fn().mockReturnValueOnce(
      of({
        data: avatarBuffer,
      }),
    );

    jest.spyOn(crypto, 'createHash').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('hashed-avatar'),
    } as any);

    const avatar = await service.getAvatar(userId);

    expect(avatar).toBe(avatarBuffer.toString('base64'));
  });
});
