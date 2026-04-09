# Investment Notification Backend

This project follows a clean architecture structure with separation of concerns.

## Folder Structure

```
src/
├── domain/              # Regras de negócio puras (não depende de nada externo)
│   ├── entities/        # Entidades de negócio
│   ├── repositories/    # Interfaces dos repositórios (contratos)
│   └── usecases/        # Casos de uso
├── application/         # Orquestração entre domain e infra
│   ├── dto/            # Data Transfer Objects
│   └── services/       # Serviços de aplicação (opcional)
├── infrastructure/     # Detalhes técnicos (frameworks, DB, etc)
│   ├── database/       # Configuração e models do DB
│   ├── http/           # Controllers, rotas, middlewares
│   └── repositories/   # Implementações concretas dos repositórios
└── config/            # Configurações gerais
```

## Description of Layers

### Domain Layer

Contains pure business logic with no external dependencies:

- **entities**: Core business objects
- **repositories**: Interfaces defining data access contracts
- **usecases**: Business rules and application logic

### Application Layer

Orchestrates between domain and infrastructure:

- **dto**: Data transfer objects for communication between layers
- **services**: Application services that coordinate use cases

### Infrastructure Layer

Technical details and framework-specific implementations:

- **database**: Database configuration and ORM models
- **http**: HTTP controllers, routes, and middleware
- **repositories**: Concrete implementations of repository interfaces

### Config Layer

General configuration files for the application.

## Example Files Created

- `src/domain/entities/User.ts` - Example business entity
- `src/domain/repositories/UserRepository.ts` - Repository interface
- `src/domain/usecases/CreateUserUseCase.ts` - Example use case
- `src/application/dto/CreateUserDto.ts` - Data transfer object
- `src/application/services/AuthService.ts` - Application service
- `src/infrastructure/database/connection.ts` - Database connection
- `src/infrastructure/database/UserModel.ts` - Database model
- `src/infrastructure/http/UserController.ts` - HTTP controller
- `src/infrastructure/repositories/UserRepository.ts` - Repository implementation
- `src/config/database.ts` - Database configuration
