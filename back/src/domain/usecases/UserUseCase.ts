// // Example use case - contains business logic for creating a user
// export class CreateUserUseCase {
//     constructor(private userRepository: UserRepository) { }

//     async execute(name: string, email: string): Promise<User> {
//         // Business logic here
//         const existingUser = await this.userRepository.findByEmail(email);
//         if (existingUser) {
//             throw new Error('User already exists');
//         }

//         const user = new User(
//             crypto.randomUUID(),
//             name,
//             email,
//             new Date()
//         );

//         await this.userRepository.save(user);
//         return user;
//     }
// }