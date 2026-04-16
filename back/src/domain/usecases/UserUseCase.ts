import { UserDTO } from '@/application/dto/UserDTO';
import { AppError } from '@/errors/AppError';
import { IUserRepository } from '@/infrastructure/repositories/UserRepository';
import { Util } from '@/utils/util';

import { User } from '../entities/User';

export interface IUserUseCase {
  create(input: UserDTO.Create.Input): Promise<UserDTO.Create.Output>;
  update(input: UserDTO.Update.Input): Promise<UserDTO.Update.Output>;
  getById(input: UserDTO.GetById.Input): Promise<UserDTO.GetById.Output>;
  delete(input: UserDTO.Delete.Input): Promise<UserDTO.Delete.Output>;
}
export class UserUseCase implements IUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  private async findUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.getById(id);
    return Util.isDefined(user) ? new User(user) : null;
  }
  private async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await this.userRepository.getByPhoneNumber(phoneNumber);
    return Util.isDefined(user) ? new User(user) : null;
  }

  async create(input: UserDTO.Create.Input): Promise<UserDTO.Create.Output> {
    // Check if the number already exist
    const user = await this.findUserByPhoneNumber(input.phoneNumber);
    if (Util.isDefined(user)) {
      throw AppError.conflict('User already exist!');
    }

    const newUser = User.create(input);
    const output = await this.userRepository.create(newUser);
    return output;
  }
  async update(input: UserDTO.Update.Input): Promise<UserDTO.Update.Output> {
    // Check if user exist
    const user = await this.findUserById(input.id);
    if (!Util.isDefined(user)) {
      throw AppError.notFound('User not exist!');
    }

    if (!user.active) {
      throw AppError.forbidden('User is inactive!');
    }

    const updatedUser = user.update(input);
    const output = await this.userRepository.update(updatedUser);

    return output;
  }
  async getById(input: UserDTO.GetById.Input): Promise<UserDTO.GetById.Output> {
    const user = await this.userRepository.getById(input);
    if (!Util.isDefined(user)) {
      throw AppError.notFound('User not found!');
    }
    return user;
  }
  async delete(input: UserDTO.Delete.Input): Promise<UserDTO.Delete.Output> {
    const user = await this.findUserById(input);
    if (!Util.isDefined(user)) {
      throw AppError.notFound('User not found!');
    }
    await this.userRepository.delete(input);
  }
}
