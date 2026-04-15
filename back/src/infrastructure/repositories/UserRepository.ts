import { UserContract } from '@/domain/contracts/UserContract';
import { AppError } from '@/errors/AppError';
import { ErrorHandler } from '@/errors/ErrorHandler';
import { PrismaClient } from '@/generated/prisma/client';
import { Util } from '@/utils/util';

export interface IUserRepository {
  create(input: UserContract.Create.Input): Promise<UserContract.Create.Output>;
  update(input: UserContract.Update.Input): Promise<UserContract.Update.Output>;
  getById(input: UserContract.GetById.Input): Promise<UserContract.GetById.Output>;
  getByPhoneNumber(
    input: UserContract.GetByPhoneNumber.Input,
  ): Promise<UserContract.GetByPhoneNumber.Output>;
  delete(input: UserContract.Delete.Input): Promise<UserContract.Delete.Output>;
  // addInvestment(data:any):Promise<void>
}
export class UserRepository implements IUserRepository {
  constructor(private readonly connection: PrismaClient) {}
  async create(input: UserContract.Create.Input): Promise<UserContract.Create.Output> {
    try {
      const newUser = input.self;
      return await this.connection.$transaction(async (prisma) => {
        return await prisma.user.create({
          data: newUser,
        });
      });
    } catch (error: any) {
      return ErrorHandler('User', error);
    }
  }
  async update(input: UserContract.Update.Input): Promise<UserContract.Update.Output> {
    try {
      const { id, ...newData } = input.self;
      return await this.connection.$transaction(async (prisma) => {
        return await prisma.user.update({
          where: {
            id,
          },
          data: newData,
        });
      });
    } catch (error: any) {
      return ErrorHandler('User', error);
    }
  }
  async getById(input: UserContract.GetById.Input): Promise<UserContract.GetById.Output> {
    try {
      const user = await this.connection.user.findFirst({
        where: {
          id: input,
        },
      });

      return user;
    } catch (error: any) {
      return ErrorHandler('User', error);
    }
  }
  async getByPhoneNumber(
    input: UserContract.GetByPhoneNumber.Input,
  ): Promise<UserContract.GetByPhoneNumber.Output> {
    try {
      const user = await this.connection.user.findFirst({
        where: {
          phoneNumber: input,
        },
      });

      return user;
    } catch (error: any) {
      return ErrorHandler('User', error);
    }
  }
  async delete(input: UserContract.Delete.Input): Promise<UserContract.Delete.Output> {
    try {
      await this.connection.user.delete({
        where: {
          id: input,
        },
      });
    } catch (error: any) {
      return ErrorHandler('User', error);
    }
  }
}
