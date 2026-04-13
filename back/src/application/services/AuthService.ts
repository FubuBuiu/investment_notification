// // Example application service - orchestrates use cases
// export class AuthService {
//     constructor(private createUserUseCase: CreateUserUseCase) { }

//     async register(dto: CreateUserDto): Promise<User> {
//         return await this.createUserUseCase.execute(dto.name, dto.email);
//     }
// }