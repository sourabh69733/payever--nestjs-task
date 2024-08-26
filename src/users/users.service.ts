import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateUserDto from '../dto/createUser';
import { User } from '../schemas/user.schema';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { join } from 'path';
import { EmailService } from '../email/email.service';
import * as amqp from 'amqplib';

@Injectable()
export class UsersService {
  private connection: amqp.Connection;
  private eventChannel: amqp.Channel;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private httpService: HttpService,
    private emailService: EmailService,
  ) {
    this.connectRabbitMQ();
  }

  async connectRabbitMQ() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URI);
    this.eventChannel = await this.connection.createChannel();

    await this.eventChannel.assertQueue('eventQueue', { durable: true });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = {
      ...createUserDto,
      _id: createUserDto.id,
    };
    delete user['id'];

    const createdUser = new this.userModel(user);
    await createdUser.save();

    // Directly call the email service to send an email
    await this.emailService.sendEmail(createdUser.email);

    // Push an event to the event queue
    this.eventChannel.sendToQueue(
      'eventQueue',
      Buffer.from(JSON.stringify({ userId: createdUser._id })),
    );

    return createdUser;
  }

  async findOne(userId: string): Promise<any> {
    console.log('Finding user with userId:', userId);
    const response: any = await this.httpService
      .get(`https://reqres.in/api/users/${userId}`)
      .toPromise();
    return response.data.data;
  }

  async getAvatar(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);

    if (!user || !user.avatar) {
      console.log('Failed to get user');
      return '';
    }

    let hash = crypto.createHash('sha256').update(user.avatar).digest('hex');
    if (user.avatarHash) {
      hash = user.avatarHash;
    }

    const baseDir = join(__dirname, '..', '..', '..', 'uploads');

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const filePath = join(baseDir, `${hash}.png`);

    console.log('Avatar file path', filePath);

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('base64');
    }

    const userData = await this.findOne(userId);
    const avatarUrl = userData.avatar;
    const avatarBuffer = (
      await this.httpService
        .get(avatarUrl, { responseType: 'arraybuffer' })
        .toPromise()
    ).data;

    fs.writeFileSync(filePath, avatarBuffer);

    user.avatarHash = hash;
    await user.save();

    return avatarBuffer.toString('base64');
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (user && user.avatarHash) {
      console.log('Deleting user avatar hash', userId);
      const imgDir = join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        `${user.avatarHash}.png`,
      );

      fs.unlinkSync(imgDir);
      user.avatarHash = null;
      await user.save();
    } else {
      console.log('There is no either user or avatar hash stored in db', user);
    }
  }
}
