import { UserContract } from '@/domain/contracts/UserContract';
import { UserModel } from '@/generated/prisma/models';
import { IUserRepository } from '@/infrastructure/repositories/UserRepository';

export class UserRepositoryMock implements IUserRepository {
  private users: Map<string, UserModel> = new Map();
  private usersByPhone: Map<string, UserModel> = new Map();
  private createError: Error | null = null;
  private getByIdError: Error | null = null;
  private getByPhoneNumberError: Error | null = null;
  private updateError: Error | null = null;
  private deleteError: Error | null = null;

  async create(input: UserContract.Create.Input): Promise<UserContract.Create.Output> {
    if (this.createError) {
      throw this.createError;
    }
    const user = input as UserModel;
    this.users.set(user.id, user);
    this.usersByPhone.set(user.phoneNumber, user);
    return user;
  }

  async update(input: UserContract.Update.Input): Promise<UserContract.Update.Output> {
    if (this.updateError) {
      throw this.updateError;
    }
    const user = input as UserModel;
    this.users.set(user.id, user);
    this.usersByPhone.set(user.phoneNumber, user);
    return user;
  }

  async getById(input: UserContract.GetById.Input): Promise<UserContract.GetById.Output> {
    if (this.getByIdError) {
      throw this.getByIdError;
    }
    return this.users.get(input) || null;
  }

  async getByPhoneNumber(
    input: UserContract.GetByPhoneNumber.Input,
  ): Promise<UserContract.GetByPhoneNumber.Output> {
    if (this.getByPhoneNumberError) {
      throw this.getByPhoneNumberError;
    }
    return this.usersByPhone.get(input) || null;
  }

  async delete(input: UserContract.Delete.Input): Promise<UserContract.Delete.Output> {
    if (this.deleteError) {
      throw this.deleteError;
    }
    this.users.delete(input);
    return;
  }

  // Helper methods for tests
  setCreateError(error: Error): void {
    this.createError = error;
  }

  setGetByIdError(error: Error): void {
    this.getByIdError = error;
  }

  setGetByPhoneNumberError(error: Error): void {
    this.getByPhoneNumberError = error;
  }

  setUpdateError(error: Error): void {
    this.updateError = error;
  }

  setDeleteError(error: Error): void {
    this.deleteError = error;
  }

  clearErrors(): void {
    this.createError = null;
    this.getByIdError = null;
    this.getByPhoneNumberError = null;
    this.updateError = null;
    this.deleteError = null;
  }

  clear(): void {
    this.users.clear();
    this.usersByPhone.clear();
    this.clearErrors();
  }

  getUsersCount(): number {
    return this.users.size;
  }

  getAllUsers(): UserModel[] {
    return Array.from(this.users.values());
  }
}
