// // Database model/user entity - maps to database table
// import { User } from '../../../domain/entities/User';

// export class UserModel {
//     id: string;
//     name: string;
//     email: string;
//     createdAt: Date;

//     constructor(user: User) {
//         this.id = user.id;
//         this.name = user.name;
//         this.email = user.email;
//         this.createdAt = user.createdAt;
//     }

//     toEntity(): User {
//         return new User(this.id, this.name, this.email, this.createdAt);
//     }
// }