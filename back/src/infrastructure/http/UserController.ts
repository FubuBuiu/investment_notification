// HTTP controller - handles incoming requests
import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { CreateUserDto } from '../../../application/dto/CreateUserDto';

export class UserController {
    constructor(private authService: AuthService) { }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateUserDto = req.body;
            const user = await this.authService.register(dto);
            res.status(201).json({ id: user.id, name: user.name, email: user.email });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}