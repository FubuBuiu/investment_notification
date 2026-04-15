// // HTTP controller - handles incoming requests
// import { Request, Response } from 'express';
// import { AuthService } from '../../../application/services/AuthService';
// import { CreateUserDto } from '../../../application/dto/CreateUserDto';

import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { IUserUseCase } from '@/domain/usecases/UserUseCase';

import { Created, ErrorResponse } from '../handlers/httpResponder';

export interface IUserController {
  create(req: Request, res: Response): Promise<Response>;
  update(req: Request, res: Response): Promise<Response>;
  getById(req: Request, res: Response): Promise<Response>;
  delete(req: Request, res: Response): Promise<Response>;
}
export class UserController implements IUserController {
  constructor(private readonly userUseCases: IUserUseCase) {}
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data: UserDTO.Create.Input = req.body;
      const response = await this.userUseCases.create(data);
      return Created(res, { data: response });
    } catch (error) {
      return ErrorResponse(res, error);
    }
  }
  update(req: Request): Promise<Response> {
    throw new Error('Method not implemented.');
  }
  getById(req: Request): Promise<Response> {
    throw new Error('Method not implemented.');
  }
  delete(req: Request): Promise<Response> {
    throw new Error('Method not implemented.');
  }
}
