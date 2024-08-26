import { Module } from '@nestjs/common';
// import AppController from './app.controller';
// import AppService from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
// import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import utils from './utils';

const MONGO_DB_CONNECTION_URL = utils.getDbConnectionUrl();
console.log('Mongo Connection url', MONGO_DB_CONNECTION_URL);

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_DB_CONNECTION_URL),
    UsersModule,
    EmailModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
