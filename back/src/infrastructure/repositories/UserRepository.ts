// // Concrete implementation of UserRepository
// import { UserRepository } from '../../../domain/repositories/UserRepository';
// import { User } from '../../../domain/entities/User';
// import { DatabaseConnection } from '../../database/connection';
// import { UserModel } from '../../database/UserModel';

// export class UserRepositoryImpl implements UserRepository {
//     private db = DatabaseConnection.getInstance();

//     async findById(id: string): Promise<User | null> {
//         // Implementation would query database
//         console.log(`Finding user by id: ${id}`);
//         // Mock implementation
//         return null;
//     }

//     async findByEmail(email: string): Promise<User | null> {
//         // Implementation would query database
//         console.log(`Finding user by email: ${email}`);
//         // Mock implementation
//         return null;
//     }

//     async save(user: User): Promise<void> {
//         // Implementation would save to database
//         console.log(`Saving user: ${user.email}`);
//         // Mock implementation
//     }

//     async delete(id: string): Promise<void> {
//         // Implementation would delete from database
//         console.log(`Deleting user with id: ${id}`);
//         // Mock implementation
//     }
// }