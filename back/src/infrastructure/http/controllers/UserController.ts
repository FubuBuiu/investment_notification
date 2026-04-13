// // HTTP controller - handles incoming requests
// import { Request, Response } from 'express';
// import { AuthService } from '../../../application/services/AuthService';
// import { CreateUserDto } from '../../../application/dto/CreateUserDto';

export class UserController implements IUserControllers {
  constructor(private readonly userUseCases: IUserUseCases) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      const response = await this.userUseCases.create(data);
      return Created(res, { data: response });
    } catch (error) {
      return ErrorResponse(res, error);
    }
  }
  async getAll(req: Request, res: Response): Promise<Response> {
    throw new Error("Method not implemented.");
  }
  async getById(req: Request, res: Response): Promise<Response> {
    throw new Error("Method not implemented.");
  }
  async update(req: Request, res: Response): Promise<Response> {
    throw new Error("Method not implemented.");
  }
  async delete(req: Request, res: Response): Promise<Response> {
    throw new Error("Method not implemented.");
  }
}
