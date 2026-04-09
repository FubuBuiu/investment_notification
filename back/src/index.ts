import { User } from '@/domain/entities/User';
import { CreateUserUseCase } from '@/domain/usecases/CreateUserUseCase';
import { AuthService } from '@/application/services/AuthService';
import { databaseConfig } from '@/config/database';

console.log('Investment Notification API');
console.log('Database config:', databaseConfig);
