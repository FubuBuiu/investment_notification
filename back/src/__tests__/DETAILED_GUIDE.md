# 📚 Guia Detalhado dos Arquivos de Teste

## Índice

1. [Estrutura Geral](#estrutura-geral)
2. [1. UserRepositoryMock.ts](#1-userrepositorymockts)
3. [2. User.create.test.ts](#2-usercreatetestts)
4. [3. UserUseCase.create.test.ts](#3-userusecasecreatettestts)
5. [4. UserController.create.test.ts](#4-usercontrollercreatettestts)
6. [5. UserFlow.create.test.ts](#5-userflowcreatettestts)
7. [Padrões e Boas Práticas](#padrões-e-boas-práticas)
8. [Como Criar Testes para Outros Métodos](#como-criar-testes-para-outros-métodos)

---

## Estrutura Geral

### 🏗️ Arquitetura em Camadas

```
┌─────────────────┐
│  HTTP Request   │
├─────────────────┤
│  Controller     │  ← Testa respostas HTTP (201, 409, etc)
├─────────────────┤
│  Use Case       │  ← Testa lógica de negócio
├─────────────────┤
│  Entity         │  ← Testa criação de objeto
├─────────────────┤
│  Repository     │  ← Testa persistência (MOCK)
├─────────────────┤
│  Database       │  ← Usa Mock em memória
└─────────────────┘
```

### 🧪 Tipos de Teste

| Tipo            | O que testa        | Arquivo                         |
| --------------- | ------------------ | ------------------------------- |
| **Unit**        | Método isolado     | `User.create.test.ts`           |
| **Unit**        | Lógica de negócio  | `UserUseCase.create.test.ts`    |
| **Unit**        | Respostas HTTP     | `UserController.create.test.ts` |
| **Integration** | Fluxo completo E2E | `UserFlow.create.test.ts`       |

---

## 1. UserRepositoryMock.ts

### 🎯 Propósito

Implementar `IUserRepository` em memória para simular o banco de dados sem dependências externas.

### 📋 Estrutura Completa

```typescript
// ========================================
// 1. ESTADO PRIVADO (Storage em Memória)
// ========================================

private users: Map<string, UserModel> = new Map();
private usersByPhone: Map<string, UserModel> = new Map();

// Usado para simular erros
private createError: Error | null = null;
private getByIdError: Error | null = null;
private getByPhoneNumberError: Error | null = null;
private updateError: Error | null = null;
private deleteError: Error | null = null;
```

**Por que 2 Maps?**

- `users` (por ID) → Busca rápida getById()
- `usersByPhone` (por telefone) → Busca rápida getByPhoneNumber()

---

### 2️⃣ MÉTODOS DO CRUD

#### create()

```typescript
async create(input: UserContract.Create.Input): Promise<UserContract.Create.Output> {
  // 1️⃣ Se erro foi setado, lançar
  if (this.createError) {
    throw this.createError;
  }

  // 2️⃣ Armazenar em ambos os maps
  const user = input as UserModel;
  this.users.set(user.id, user);
  this.usersByPhone.set(user.phoneNumber, user);

  // 3️⃣ Retornar o usuário criado
  return user;
}
```

**Padrão**: Check Error → Armazenar → Retornar

#### getById()

```typescript
async getById(input: UserContract.GetById.Input): Promise<UserContract.GetById.Output> {
  if (this.getByIdError) {
    throw this.getByIdError;
  }
  // Retorna o usuário ou null se não encontrado
  return this.users.get(input) || null;
}
```

#### getByPhoneNumber()

```typescript
async getByPhoneNumber(
  input: UserContract.GetByPhoneNumber.Input,
): Promise<UserContract.GetByPhoneNumber.Output> {
  if (this.getByPhoneNumberError) {
    throw this.getByPhoneNumberError;
  }
  return this.usersByPhone.get(input) || null;
}
```

---

### 3️⃣ HELPER METHODS (para testes)

#### Simular Erros

```typescript
setCreateError(error: Error): void {
  this.createError = error;
}

// Uso no teste:
const repo = new UserRepositoryMock();
repo.setCreateError(new Error('Database connection failed'));
// Agora repo.create() vai lançar esse erro
```

#### Limpar Dados

```typescript
clear(): void {
  this.users.clear();
  this.usersByPhone.clear();
  this.clearErrors();
}

// Uso: útil no t.beforeEach()
t.beforeEach(() => {
  userRepository.clear();
});
```

#### Consultar Estado

```typescript
getUsersCount(): number {
  return this.users.size;
}

getAllUsers(): UserModel[] {
  return Array.from(this.users.values());
}

// Uso no teste
assert.strictEqual(repo.getUsersCount(), 1);
const all = repo.getAllUsers();
```

---

### 🔑 Pontos-Chave do Mock

✅ **Implementa a mesma interface do repositório real**
✅ **Armazena dados em memória (rápido, sem I/O)**
✅ **Permite simular erros sem causar danos**
✅ **Fornece helpers para assertions**
✅ **Pode ser reutilizado em todos os testes**

---

## 2. User.create.test.ts

### 🎯 Propósito

Testar a **entidade User** - criação e comportamento do objeto de domínio.

### 📋 Padrão Geral

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

test('Descrição do Grupo de Testes', async (t) => {
  // Testes aqui
});
```

### 📝 Teste 1: Criar com Dados Válidos

```typescript
await t.test('deve criar um novo usuário com dados válidos', () => {
  // 🟢 ARRANGE (Preparar)
  const validData = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  // 🟡 ACT (Executar)
  const user = User.create(validData);

  // 🔴 ASSERT (Validar)
  assert.strictEqual(user.name, validData.name, 'Nome deve corresponder');
  assert.strictEqual(user.phoneNumber, validData.phoneNumber, 'Telefone deve corresponder');
  assert.strictEqual(user.active, true, 'Usuário deve estar ativo por padrão');
  assert.ok(user.id, 'ID deve ser gerado');
  assert.ok(user.createdAt, 'createdAt deve ser definido');
  assert.ok(user.updatedAt, 'updatedAt deve ser definido');
  assert.ok(user.createdAt instanceof Date, 'createdAt deve ser uma data');
  assert.ok(user.updatedAt instanceof Date, 'updatedAt deve ser uma data');
});
```

**Padrão AAA:**

1. **Arrange** (Preparar): Criar dados de entrada
2. **Act** (Agir): Chamar o método
3. **Assert** (Afirmar): Validar o resultado

---

### 📝 Teste 2: UUIDs Únicos

```typescript
await t.test('deve gerar UUIDs únicos para cada usuário', () => {
  const data = {
    name: 'Maria Santos',
    phoneNumber: '11987654322',
  };

  // Criar 2 usuários com os mesmos dados
  const user1 = User.create(data);
  const user2 = User.create(data);

  // Os IDs devem ser diferentes
  assert.notStrictEqual(user1.id, user2.id, 'IDs devem ser únicos');
});
```

**Technique:** Criar múltiplos objetos para verificar idempotência.

---

### 📝 Teste 3: Datas Corretas

```typescript
await t.test('deve definir datas corretas de criação', () => {
  const beforeCreate = new Date();
  const data = {
    name: 'Carlos Oliveira',
    phoneNumber: '11987654323',
  };

  const user = User.create(data);
  const afterCreate = new Date();

  // Verificar que createdAt está entre beforeCreate e afterCreate
  assert.ok(
    user.createdAt.getTime() >= beforeCreate.getTime(),
    'createdAt deve ser >= beforeCreate',
  );
  assert.ok(user.createdAt.getTime() <= afterCreate.getTime(), 'createdAt deve ser <= afterCreate');

  // Verificar que updatedAt é igual a createdAt no momento da criação
  assert.strictEqual(
    user.updatedAt.getTime(),
    user.createdAt.getTime(),
    'updatedAt deve ser igual a createdAt na criação',
  );
});
```

**Technique:** Usar timestamps para validar sequência temporal.

---

### 🔑 Assertions Usadas em User.create.test.ts

| Assertion                            | Uso                 | Exemplo                                 |
| ------------------------------------ | ------------------- | --------------------------------------- |
| `assert.strictEqual(a, b)`           | Igualdade (===)     | `assert.strictEqual(user.name, 'João')` |
| `assert.ok(value)`                   | Truthy              | `assert.ok(user.id)`                    |
| `assert.notStrictEqual(a, b)`        | Diferença           | `assert.notStrictEqual(id1, id2)`       |
| `assert.deepStrictEqual(obj1, obj2)` | Comparação profunda | `assert.deepStrictEqual({...}, {...})`  |
| `instanceof`                         | Tipo                | `assert.ok(date instanceof Date)`       |

---

## 3. UserUseCase.create.test.ts

### 🎯 Propósito

Testar a **lógica de negócio** - validação, regras e interações com repositório.

### 🔧 Setup com beforeEach

```typescript
test('UserUseCase.create() - Caso de Uso', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;

  // ✅ Executado ANTES de cada teste
  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
  });

  // Agora cada teste começa com instâncias "frescas"
  await t.test('teste 1', async () => { ... });
  await t.test('teste 2', async () => { ... });
});
```

**Por que beforeEach?**

- Evita estado compartilhado entre testes
- Cada teste começa limpo
- Testes independentes e previsíveis

---

### 📝 Teste 1: Criar com Dados Válidos

```typescript
await t.test('deve criar um novo usuário com dados válidos', async () => {
  // 🟢 ARRANGE
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  // 🟡 ACT
  const result = await userUseCase.create(input);

  // 🔴 ASSERT
  assert.ok(result.id, 'Usuário deve ter um ID gerado');
  assert.strictEqual(result.name, input.name, 'Nome deve corresponder');
  assert.strictEqual(result.phoneNumber, input.phoneNumber, 'Telefone deve corresponder');
  assert.strictEqual(result.active, true, 'Usuário deve estar ativo');
  assert.ok(result.createdAt, 'createdAt deve ser definido');
  assert.ok(result.updatedAt, 'updatedAt deve ser definido');
});
```

---

### 📝 Teste 2: Validação de Dados

```typescript
await t.test('deve validar dados obrigatórios', async () => {
  const invalidInputs = [
    {
      input: { name: 'João Silva', phoneNumber: 'abc' },
      description: 'telefone com letras',
    },
    {
      input: { name: 'João Silva', phoneNumber: '123' },
      description: 'telefone muito curto (< 10 dígitos)',
    },
    {
      input: { name: 'João Silva', phoneNumber: '123456789012' },
      description: 'telefone muito longo (> 11 dígitos)',
    },
  ];

  // Loop através de cada caso inválido
  for (const { input, description } of invalidInputs) {
    // Usar assert.rejects para verificar se Promise rejeita
    await assert.rejects(
      () => userUseCase.create(input as UserDTO.Create.Input),
      {
        name: 'ZodError', // Esperado que lance ZodError
      },
      `Deve rejeitar quando ${description}`,
    );
  }
});
```

**Technique:** `assert.rejects()` valida se Promise rejeita com tipo específico.

---

### 📝 Teste 3: Verificar Duplicação

```typescript
await t.test('deve verificar se o telefone já existe', async () => {
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  // Primeira criação - sucesso
  await userUseCase.create(input);

  // Segunda criação com mesmo telefone - deve falhar
  const duplicateInputData = {
    name: 'Maria Santos',
    phoneNumber: '11987654321',
  };

  // Validar que rejeita com AppError
  await assert.rejects(
    () => userUseCase.create(duplicateInputData as UserDTO.Create.Input),
    AppError,
    'Deve rejeitar usuário duplicado',
  );
});
```

**Flow:**

1. Criar primeiro usuário ✅
2. Tentar criar com mesmo telefone ❌
3. Validar que foi rejeitado

---

### 📝 Teste 4: AppError com Status Correto

```typescript
await t.test('deve lançar AppError.conflict() quando telefone duplicado', async () => {
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  await userUseCase.create(input);

  try {
    await userUseCase.create({
      name: 'Outro Nome',
      phoneNumber: '11987654321',
    });
    assert.fail('Deveria ter lançado um erro');
  } catch (error) {
    const appError = error as AppError;
    assert.ok(appError instanceof AppError, 'Deve ser uma instância de AppError');
    assert.strictEqual(appError.statusCode, 409, 'Status code deve ser 409 (Conflict)');
    assert.strictEqual(appError.code, 'CONFLICT', 'Code deve ser CONFLICT');
  }
});
```

**Advanced:** Catch e validar propriedades do erro.

---

### 📝 Teste 5: Verificar Persistência

```typescript
await t.test('deve persistir usuário no repositório', async () => {
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  const result = await userUseCase.create(input);

  // Verificar que foi armazenado
  assert.strictEqual(
    userRepository.getUsersCount(),
    1,
    'Repositório deve ter 1 usuário armazenado',
  );

  // Recuperar e validar
  const storedUser = await userRepository.getById(result.id);
  assert.ok(storedUser, 'Usuário deve estar no repositório');
  assert.strictEqual(storedUser?.id, result.id, 'ID deve corresponder');
});
```

**Technique:** Usar helper do mock para validar estado interno.

---

### 🔑 Padrões em UserUseCase.create.test.ts

✅ **Use `async/await`** - UseCase é assíncrono
✅ **Use `beforeEach`** - Cada teste começa limpo
✅ **Use `assert.rejects()`** - Para validar rejeiões
✅ **Use mock repository** - Sem dependências externas
✅ **Teste regras de negócio** - Duplicação, validação, etc

---

## 4. UserController.create.test.ts

### 🎯 Propósito

Testar a **camada HTTP** - respostas, status codes, formatação de dados.

### 🔧 Mock de Request e Response

```typescript
class MockRequest {
  body: any;
  constructor(body: any) {
    this.body = body;
  }
}

class MockResponse {
  statusCode: number | null = null;
  data: any = null;
  jsonData: any = null;

  // Pattern CHAIN - retorna this para permitir .json().status()
  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(data: any): this {
    this.jsonData = data;
    this.data = data;
    return this;
  }

  send(data: any): this {
    this.data = data;
    return this;
  }

  getStatus(): number | null {
    return this.statusCode;
  }

  getData(): any {
    return this.data || this.jsonData;
  }
}
```

**Técnica:** Pattern de **method chaining** (retorna `this`).

---

### 📝 Teste 1: Status 201 Created

```typescript
await t.test('deve retornar 201 Created ao criar usuário com sucesso', async () => {
  // 🟢 ARRANGE
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  const req = new MockRequest(input) as unknown as Request;
  const res = new MockResponse() as unknown as Response;

  // 🟡 ACT
  const result = (await userController.create(req, res)) as unknown as MockResponse;

  // 🔴 ASSERT
  assert.strictEqual(result.statusCode, 201, 'Status code deve ser 201 Created');
  assert.ok(result.data, 'Deve retornar dados');
  assert.ok(result.data.data, 'Deve retornar objeto com propriedade data');
});
```

**Type Assertion:** `as unknown as Request` para usar Mocks com tipos do Express.

---

### 📝 Teste 2: Dados da Resposta

```typescript
await t.test('deve retornar dados do usuário criado', async () => {
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  const req = new MockRequest(input) as unknown as Request;
  const res = new MockResponse() as unknown as Response;

  const result = (await userController.create(req, res)) as unknown as MockResponse;

  // Acessar dados aninhados
  const userData = result.data.data;

  assert.strictEqual(userData.name, input.name, 'Nome deve corresponder');
  assert.strictEqual(userData.phoneNumber, input.phoneNumber, 'Telefone deve corresponder');
  assert.strictEqual(userData.active, true, 'Usuário deve estar ativo');
  assert.ok(userData.id, 'Deve ter um ID');
});
```

---

### 📝 Teste 3: Erro com Dados Inválidos

```typescript
await t.test('deve retornar erro quando dados são inválidos', async () => {
  const input = {
    name: 'João Silva',
    phoneNumber: 'abc', // ❌ Inválido
  };

  const req = new MockRequest(input) as unknown as Request;
  const res = new MockResponse() as unknown as Response;

  const result = (await userController.create(req, res)) as unknown as MockResponse;

  // Validar status de erro
  assert.ok(result.statusCode && result.statusCode >= 400, 'Status code deve ser >= 400');
  assert.ok(result.data, 'Deve retornar dados de erro');
});
```

---

### 📝 Teste 4: Conflito (409)

```typescript
await t.test('deve retornar erro 409 quando telefone duplicado', async () => {
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  // Criar primeiro usuário
  const req1 = new MockRequest(input) as unknown as Request;
  const res1 = new MockResponse() as unknown as Response;
  await userController.create(req1, res1);

  // Tentar criar duplicado
  const duplicateInput = {
    name: 'Maria Santos',
    phoneNumber: '11987654321',
  };

  const req2 = new MockRequest(duplicateInput) as unknown as Request;
  const res2 = new MockResponse() as unknown as Response;

  const result = (await userController.create(req2, res2)) as unknown as MockResponse;

  // Validar status 409
  assert.strictEqual(result.statusCode, 409, 'Status code deve ser 409 Conflict');
});
```

---

### 🔑 Padrões em UserController.create.test.ts

✅ **Criar Mocks de Request/Response** - Sem dependência do Express real
✅ **Testar Status Codes** - 201, 400, 409, etc
✅ **Testar Formato de Resposta** - Estrutura de dados
✅ **Testar Error Handling** - Erros são retornados corretamente
✅ **Method Chaining** - Pattern no Mock para simular Express

---

## 5. UserFlow.create.test.ts

### 🎯 Propósito

Testar o **fluxo completo end-to-end** através de todas as camadas.

### 📝 Teste 1: Fluxo Completo E2E

```typescript
await t.test('deve completar fluxo de criação end-to-end', async () => {
  // 🟢 ARRANGE
  const input: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber: '11987654321',
  };

  // 🟡 ACT - Passar através de todas as camadas
  const req = new MockRequest(input) as unknown as Request;
  const res = new MockResponse() as unknown as Response;
  const result = (await userController.create(req, res)) as unknown as MockResponse;

  // 🔴 ASSERT - Validar em cada ponto

  // 1️⃣ Validar resposta HTTP
  assert.strictEqual(result.statusCode, 201, 'Deve retornar 201 Created');

  // 2️⃣ Validar dados retornados
  const userData = result.data.data;
  assert.strictEqual(userData.name, input.name);
  assert.strictEqual(userData.phoneNumber, input.phoneNumber);
  assert.strictEqual(userData.active, true);
  assert.ok(userData.id);
  assert.ok(userData.createdAt);
  assert.ok(userData.updatedAt);

  // 3️⃣ Validar persistência no repositório
  const storedUser = await userRepository.getById(userData.id);
  assert.ok(storedUser, 'Usuário deve estar armazenado no repositório');

  // 4️⃣ Validar integridade de dados
  assert.deepStrictEqual(
    {
      id: storedUser.id,
      name: storedUser.name,
      phoneNumber: storedUser.phoneNumber,
      active: storedUser.active,
    },
    {
      id: userData.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      active: userData.active,
    },
    'Dados armazenados devem corresponder aos dados retornados',
  );
});
```

**Flow Visualizado:**

```
Request {name, phoneNumber}
    ↓
Controller.create()
    ↓
UseCase.create()
    ↓
User.create() (Entity)
    ↓
Repository.create() (Mock)
    ↓
Response {id, name, phoneNumber, active, createdAt, updatedAt}
    ↓
Validar tudo ✅
```

---

### 📝 Teste 2: Validação em Cada Camada

```typescript
await t.test('deve validar em cada camada do fluxo', async () => {
  const invalidInput = {
    name: 'João Silva',
    phoneNumber: 'abc', // ❌ Inválido
  };

  const req = new MockRequest(invalidInput) as unknown as Request;
  const res = new MockResponse() as unknown as Response;

  const result = (await userController.create(req, res)) as unknown as MockResponse;

  // Validação ocorreu no Controller/UseCase
  assert.ok(result.statusCode! >= 400, 'Deve retornar erro');

  // Nada foi armazenado no repositório
  assert.strictEqual(userRepository.getUsersCount(), 0, 'Nenhum usuário deve ser armazenado');
});
```

---

### 📝 Teste 3: Prevenir Duplicação

```typescript
await t.test('deve impedir duplicação de telefone em múltiplas requisições', async () => {
  const phoneNumber = '11987654321';

  // Primeira requisição
  const input1: UserDTO.Create.Input = {
    name: 'João Silva',
    phoneNumber,
  };

  const req1 = new MockRequest(input1) as unknown as Request;
  const res1 = new MockResponse() as unknown as Response;

  const result1 = (await userController.create(req1, res1)) as unknown as MockResponse;
  assert.strictEqual(result1.statusCode, 201, 'Primeira requisição deve suceder');

  // Segunda requisição com mesmo telefone
  const input2: UserDTO.Create.Input = {
    name: 'Maria Santos',
    phoneNumber,
  };

  const req2 = new MockRequest(input2) as unknown as Request;
  const res2 = new MockResponse() as unknown as Response;

  const result2 = (await userController.create(req2, res2)) as unknown as MockResponse;
  assert.strictEqual(result2.statusCode, 409, 'Segunda requisição deve retornar 409 Conflict');

  // Validar que apenas 1 foi persistido
  assert.strictEqual(userRepository.getUsersCount(), 1, 'Deve ter apenas 1 usuário armazenado');
});
```

---

### 📝 Teste 4: Múltiplas Requisições

```typescript
await t.test('deve validar schema em múltiplas requisições consecutivas', async () => {
  const validUsers = [
    { name: 'Usuário 1', phoneNumber: '11987654321' },
    { name: 'Usuário 2', phoneNumber: '21987654321' },
    { name: 'Usuário 3', phoneNumber: '31987654321' },
  ];

  const createdUsers = [];

  // Criar 3 usuários
  for (const userData of validUsers) {
    const req = new MockRequest(userData) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    assert.strictEqual(result.statusCode, 201, `Deve criar usuário ${userData.name}`);
    createdUsers.push(result.data.data);
  }

  // Validar que todos foram armazenados
  assert.strictEqual(userRepository.getUsersCount(), 3, 'Deve ter armazenado os 3 usuários');

  // Validar que todos podem ser recuperados
  for (const user of createdUsers) {
    const retrieved = await userRepository.getById(user.id);
    assert.ok(retrieved, `Usuário ${user.id} deve poder ser recuperado`);
  }
});
```

---

### 📝 Teste 5: Integridade de Dados

```typescript
await t.test('deve manter integridade de dados através de todas as camadas', async () => {
  const input: UserDTO.Create.Input = {
    name: 'Carlos Oliveira',
    phoneNumber: '21987654321',
  };

  // Passar por todas as camadas
  const req = new MockRequest(input) as unknown as Request;
  const res = new MockResponse() as unknown as Response;

  const httpResult = (await userController.create(req, res)) as unknown as MockResponse;
  const httpData = httpResult.data.data;

  // Verificar no repositório
  const repositoryData = await userRepository.getById(httpData.id);

  // Dados devem ser idênticos
  assert.deepStrictEqual(
    {
      id: httpData.id,
      name: httpData.name,
      phoneNumber: httpData.phoneNumber,
      active: httpData.active,
    },
    {
      id: repositoryData!.id,
      name: repositoryData!.name,
      phoneNumber: repositoryData!.phoneNumber,
      active: repositoryData!.active,
    },
    'Dados devem ser mantidos através de todas as camadas',
  );
});
```

---

### 🔑 Padrões em UserFlow.create.test.ts

✅ **Testar flow completo** - Do HTTP até o repositório
✅ **Validar em múltiplos pontos** - Request, Response, Repository
✅ **Usar repositório compartilhado** - Para validar persistência
✅ **Testar cenários reais** - Múltiplas requisições, duplicações
✅ **Validar integridade** - Dados não são corruptidos no fluxo

---

## Padrões e Boas Práticas

### 🏗️ Padrão AAA

Todos os testes seguem:

```typescript
await t.test('descrição do teste', () => {
  // 🟢 ARRANGE - Preparar dados e mocks
  const input = { ... };

  // 🟡 ACT - Executar a ação
  const result = await service.method(input);

  // 🔴 ASSERT - Validar resultado
  assert.strictEqual(result.id, 'uuid');
});
```

---

### 🧹 Isolamento com beforeEach

```typescript
test('Grupo de Testes', async (t) => {
  let repository: UserRepositoryMock;
  let useCase: UserUseCase;

  // Executado ANTES de cada teste
  t.beforeEach(() => {
    repository = new UserRepositoryMock();
    useCase = new UserUseCase(repository);
  });

  // Cada teste começa com instâncias limpas
  await t.test('teste 1', () => { ... });
  await t.test('teste 2', () => { ... });
});
```

---

### 🔄 Assertions Principais

| Função                     | Uso                 | Exemplo                              |
| -------------------------- | ------------------- | ------------------------------------ |
| `assert.ok()`              | Verificar truthy    | `assert.ok(user.id)`                 |
| `assert.strictEqual()`     | Igualdade ===       | `assert.strictEqual(a, b)`           |
| `assert.notStrictEqual()`  | Diferença !==       | `assert.notStrictEqual(a, b)`        |
| `assert.deepStrictEqual()` | Comparação profunda | `assert.deepStrictEqual(obj1, obj2)` |
| `assert.rejects()`         | Promise rejection   | `await assert.rejects(promise)`      |
| `assert.fail()`            | Falha o teste       | `assert.fail('Mensagem')`            |

---

### 📊 Teste Assíncrono vs Síncrono

```typescript
// ✅ SÍNCRONO - sem dependencies assincrônicas
await t.test('criar entidade', () => {
  const user = User.create(data);
  assert.ok(user.id);
});

// ✅ ASSÍNCRONO - UseCase, Controller são async
await t.test('criar via usecase', async () => {
  const result = await useCase.create(data);
  assert.ok(result.id);
});
```

---

## Como Criar Testes para Outros Métodos

### 📋 Checklist de Implementação

Para criar testes de **update(), delete(), get()**, siga:

#### 1. Criar Mock Method (se ainda não existe)

- Abra `UserRepositoryMock.ts`
- Adicione o método seguindo o padrão CRUD existente

#### 2. Criar Arquivo de Teste Unitário

- `src/__tests__/unit/User.update.test.ts` (para entidade)
- `src/__tests__/unit/UserUseCase.update.test.ts` (para use case)
- `src/__tests__/unit/UserController.update.test.ts` (para controller)

#### 3. Criar Arquivo de Teste de Integração

- `src/__tests__/integration/UserFlow.update.test.ts`

---

### 📝 Exemplo: Teste para UPDATE

#### User.update.test.ts

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

import { User } from '@/domain/entities/User';

test('User.update() - Entidade', async (t) => {
  // Criar usuário base
  const baseUser = User.create({
    name: 'João Silva',
    phoneNumber: '11987654321',
  });

  await t.test('deve atualizar nome do usuário', () => {
    const updated = baseUser.update({
      name: 'João Silva Atualizado',
    });

    assert.strictEqual(updated.name, 'João Silva Atualizado');
    assert.strictEqual(updated.phoneNumber, baseUser.phoneNumber); // Não mudou
    assert.ok(updated.updatedAt.getTime() > baseUser.updatedAt.getTime()); // Tempo mudou
  });

  await t.test('deve manter ID ao atualizar', () => {
    const updated = baseUser.update({
      name: 'Novo Nome',
    });

    assert.strictEqual(updated.id, baseUser.id, 'ID deve permanecer igual');
  });
});
```

---

#### UserUseCase.update.test.ts

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

import { UserUseCase } from '@/domain/usecases/UserUseCase';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

test('UserUseCase.update() - Caso de Uso', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
  });

  await t.test('deve atualizar usuário existente', async () => {
    // Criar primeiro
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    // Atualizar
    const updated = await userUseCase.update({
      id: created.id,
      name: 'João Silva Novo',
    });

    assert.strictEqual(updated.name, 'João Silva Novo');
    assert.strictEqual(updated.phoneNumber, created.phoneNumber); // Mantém telefone
  });

  await t.test('deve lançar erro ao tentar atualizar usuário inexistente', async () => {
    await assert.rejects(
      () =>
        userUseCase.update({
          id: 'invalid-id',
          name: 'Novo Nome',
        }),
      Error,
      'Deve rejeitar',
    );
  });
});
```

---

### 📝 Exemplo: Teste para DELETE

```typescript
await t.test('deve deletar usuário existente', async () => {
  const created = await userUseCase.create({
    name: 'João Silva',
    phoneNumber: '11987654321',
  });

  // Deletar
  await userUseCase.delete(created.id);

  // Verificar que foi deletado
  const found = await userRepository.getById(created.id);
  assert.strictEqual(found, null, 'Usuário deve estar deletado');
  assert.strictEqual(userRepository.getUsersCount(), 0, 'Repositório deve estar vazio');
});
```

---

### 📝 Exemplo: Teste para GET

```typescript
await t.test('deve recuperar usuário por ID', async () => {
  const created = await userUseCase.create({
    name: 'João Silva',
    phoneNumber: '11987654321',
  });

  const found = await userUseCase.getById(created.id);

  assert.ok(found, 'Usuário deve ser encontrado');
  assert.strictEqual(found.id, created.id);
  assert.strictEqual(found.name, created.name);
});

await t.test('deve retornar null para ID inexistente', async () => {
  const found = await userUseCase.getById('invalid-id');
  assert.strictEqual(found, null, 'Deve retornar null');
});
```

---

## 🎯 Resumo

| Arquivo                         | O que testa         | Quando usar            |
| ------------------------------- | ------------------- | ---------------------- |
| `UserRepositoryMock.ts`         | Mock em memória     | Todas as suites        |
| `User.create.test.ts`           | Criação de entidade | Lógica de domínio pura |
| `UserUseCase.create.test.ts`    | Lógica de negócio   | Regras, validações     |
| `UserController.create.test.ts` | Respostas HTTP      | Status codes, format   |
| `UserFlow.create.test.ts`       | Fluxo completo      | Integração E2E         |

**Próximo passo:** Aplicar esse padrão aos métodos `update()`, `delete()`, `getById()`! 🚀
