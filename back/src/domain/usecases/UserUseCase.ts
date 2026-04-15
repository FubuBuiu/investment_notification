import { UserDTO } from '@/application/dto/UserDTO';
import { createUserSchema } from '@/application/schemas/userschema';
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

  private async checkIfUserExist(id?: string, phoneNumber?: string) {
    if (Util.isDefined(id)) {
      return await this.userRepository.getById(id);
    }
    if (Util.isDefined(phoneNumber)) {
      return await this.userRepository.getByPhoneNumber(phoneNumber);
    }
  }

  async create(input: UserDTO.Create.Input): Promise<UserDTO.Create.Output> {
    // Check data format
    const validData = createUserSchema.parse(input);
    // Check if the number already exist
    const user = await this.checkIfUserExist(undefined, validData.phoneNumber);
    if (Util.isDefined(user)) {
      throw AppError.conflict('User already exist!');
    }

    const newUser = User.create(validData);
    const response = await this.userRepository.create(newUser);
    return response;
  }
  update(input: UserDTO.Update.Input): Promise<UserDTO.Update.Output> {
    throw new Error('Method not implemented.');
  }
  getById(input: UserDTO.GetById.Input): Promise<UserDTO.GetById.Output> {
    throw new Error('Method not implemented.');
  }
  delete(input: UserDTO.Delete.Input): Promise<UserDTO.Delete.Output> {
    throw new Error('Method not implemented.');
  }
}
