import { randomUUID } from 'node:crypto';

import { ErrorHandler } from '@/errors/ErrorHandler';
import { UserModel } from '@/generated/prisma/models';
import { Util } from '@/utils/util';

import { UserTypes } from './types';

export class User {
  readonly id: string;
  readonly phoneNumber: string;
  readonly name: string;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  // Change to 'private constructor' in the future
  constructor(user: UserModel) {
    this.id = user.id;
    this.phoneNumber = user.phoneNumber;
    this.name = user.name;
    this.active = user.active;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static create(data: UserTypes.Create.Input): UserTypes.Create.Output {
    try {
      const currentDate = new Date();
      const newUser: UserModel = {
        ...data,
        id: randomUUID(),
        active: true,
        createdAt: currentDate,
        updatedAt: currentDate,
      };
      return new User(newUser);
    } catch (error: any) {
      throw ErrorHandler(this.constructor.name, error);
    }
  }

  update(data: UserTypes.Update.Input): UserTypes.Update.Output {
    try {
      const updateFields = Util.updateIfChanged(data, this.self);
      const updatedUser: UserModel = {
        ...this.self,
        ...updateFields,
        updatedAt: new Date(),
      };
      return new User(updatedUser);
    } catch (error: any) {
      throw ErrorHandler(this.constructor.name, error);
    }
  }

  get self(): UserModel {
    return {
      ...this,
    };
  }
}
