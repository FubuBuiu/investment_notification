// // HTTP controller - handles incoming requests
// import { Request, Response } from 'express';
// import { AuthService } from '../../../application/services/AuthService';
// import { CreateUserDto } from '../../../application/dto/CreateUserDto';

import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { createUserSchema, updateUserSchema } from '@/application/schemas/userschema';
import { IUserUseCase } from '@/domain/usecases/UserUseCase';

import { Created, ErrorResponse, Ok } from '../handlers/httpResponder';

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

      // Check data format
      const validData = createUserSchema.parse(data);

      const response = await this.userUseCases.create(validData);
      return Created(res, { data: response });
    } catch (error) {
      return ErrorResponse(res, error);
    }
  }
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check data format
      const validData = updateUserSchema.parse({ id, ...data });

      const response = await this.userUseCases.update(validData);
      return Ok(res, { data: response });
    } catch (error) {
      return ErrorResponse(res, error);
    }
  }
  getById(req: Request): Promise<Response> {
    throw new Error('Method not implemented.');
  }
  delete(req: Request): Promise<Response> {
    throw new Error('Method not implemented.');
  }
}
