import { Module } from '@nestjs/common';
// import AppController from './app.controller';
// import AppService from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
// import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MOGODB_URI),
    UsersModule,
    EmailModule,
  ],
})
export class AppModule {}
