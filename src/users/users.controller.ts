import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import CreateUserDto from '../dto/createUser';

@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/users')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/user/:userId')
  async findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('/user/:userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    return this.usersService.getAvatar(userId);
  }

  @Delete('/user/:userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }
}
