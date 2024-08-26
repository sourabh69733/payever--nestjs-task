// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { EmailService } from '../email/email.service';
// import * as amqp from 'amqplib';
// import { User } from './schemas/user.schema';
// import * as fs from 'fs';
// import { HttpService } from '@nestjs/common';
// import { of } from 'rxjs';

// jest.mock('amqplib');
// jest.mock('fs');

// describe('UsersService', () => {
//   let service: UsersService;
//   let userModel: Model<User>;
//   let emailService: EmailService;
//   let connection: amqp.Connection;
//   let channel: amqp.Channel;

//   const mockUser = {
//     _id: 'user123',
//     email: 'test@example.com',
//     avatar: null,
//     avatarHash: null,
//     save: jest.fn(),
//   };

//   const mockUserModel = {
//     save: jest.fn().mockResolvedValue(mockUser),
//     findById: jest.fn().mockResolvedValue(mockUser),
//   };

//   const mockEmailService = {
//     sendEmail: jest.fn(),
//   };

//   const mockHttpService = {
//     get: jest.fn().mockReturnValue(
//       of({
//         data: {
//           data: { avatar: 'https://example.com/avatar.png' },
//         },
//       }),
//     ),
//   };

//   beforeEach(async () => {
//     connection = await amqp.connect('amqp://localhost');
//     channel = await connection.createChannel();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersService,
//         {
//           provide: getModelToken(User.name),
//           useValue: mockUserModel,
//         },
//         { provide: EmailService, useValue: mockEmailService },
//         { provide: HttpService, useValue: mockHttpService },
//       ],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//     userModel = module.get<Model<User>>(getModelToken(User.name));
//     emailService = module.get<EmailService>(EmailService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should create a user and send an email', async () => {
//     const createUserDto = { email: 'test@example.com' };

//     await service.create(createUserDto as any);

//     expect(userModel.save).toHaveBeenCalled();
//     expect(emailService.sendEmail).toHaveBeenCalledWith('test@example.com');
//     expect(channel.sendToQueue).toHaveBeenCalledWith(
//       'userEvents',
//       Buffer.from(
//         JSON.stringify({ userId: mockUser._id, action: 'USER_CREATED' }),
//       ),
//     );
//   });

//   it('should retrieve and store user avatar', async () => {
//     const userId = 'user123';
//     const avatarBuffer = Buffer.from('avatar-image');

//     jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(avatarBuffer);
//     jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {});
//     jest.spyOn(crypto, 'createHash').mockReturnValue({
//       update: jest.fn().mockReturnThis(),
//       digest: jest.fn().mockReturnValue('hashed-avatar'),
//     } as any);

//     const avatar = await service.getAvatar(userId);

//     expect(mockHttpService.get).toHaveBeenCalled();
//     expect(fs.writeFileSync).toHaveBeenCalled();
//     expect(avatar).toBe(avatarBuffer.toString('base64'));
//   });

//   it('should delete user avatar from file system and db', async () => {
//     const userId = 'user123';

//     await service.deleteAvatar(userId);

//     expect(fs.unlinkSync).toHaveBeenCalledWith(mockUser.avatar);
//     expect(mockUser.save).toHaveBeenCalled();
//     expect(mockUser.avatar).toBeNull();
//     expect(mockUser.avatarHash).toBeNull();
//   });
// });
