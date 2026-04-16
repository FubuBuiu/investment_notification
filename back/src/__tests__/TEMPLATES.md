# 📋 Templates para Criar Novos Testes

Copie e adapte esses templates para criar testes para `update()`, `delete()`, `getById()`, etc.

---

## Template 1: Teste de Entidade

Use para `User.update()`, `User.delete()`, etc.

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

import { User } from '@/domain/entities/User';

test('User.MÉTODO() - Entidade', async (t) => {
  // Setup base (criar usuário para usar nos testes)
  const baseUser = User.create({
    name: 'João Silva',
    phoneNumber: '11987654321',
  });

  // ===== TESTE 1: Sucesso =====
  await t.test('deve fazer X com dados válidos', () => {
    // 🟢 ARRANGE
    const input = {
      // seu input aqui
    };

    // 🟡 ACT
    const result = baseUser.método(input); // ou User.método(input)

    // 🔴 ASSERT
    assert.ok(result);
    assert.strictEqual(result.field, expected);
  });

  // ===== TESTE 2: Validação =====
  await t.test('deve validar dados obrigatórios', () => {
    const invalidInput = {
      // dados inválidos
    };

    assert.throws(() => baseUser.método(invalidInput), Error, 'Deve lançar erro');
  });

  // ===== TESTE 3: Estado =====
  await t.test('deve manter estado correto após operação', () => {
    const before = baseUser.self;
    const after = baseUser.método({ ...data });

    assert.strictEqual(after.id, before.id, 'ID não deve mudar');
    assert.ok(after.updatedAt > before.updatedAt, 'updatedAt deve ser atualizado');
  });
});
```

---

## Template 2: Teste de UseCase

Use para `UserUseCase.update()`, `UserUseCase.delete()`, etc.

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

test('UserUseCase.MÉTODO() - Caso de Uso', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
  });

  // ===== TESTE 1: Sucesso =====
  await t.test('deve executar MÉTODO com dados válidos', async () => {
    // 🟢 ARRANGE - Criar dados base
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Novo Nome',
      // outros campos
    };

    // 🟡 ACT
    const result = await userUseCase.método(input);

    // 🔴 ASSERT
    assert.ok(result);
    assert.strictEqual(result.name, 'Novo Nome');
    assert.strictEqual(result.id, created.id, 'ID deve permanecer igual');
  });

  // ===== TESTE 2: Validação =====
  await t.test('deve validar dados de entrada', async () => {
    const invalidInput: UserDTO.MÉTODO.Input = {
      id: 'valid-id',
      name: '', // Campo inválido
    };

    await assert.rejects(
      () => userUseCase.método(invalidInput),
      Error,
      'Deve rejeitar dados inválidos',
    );
  });

  // ===== TESTE 3: Recurso Não Encontrado =====
  await t.test('deve retornar erro para recurso inexistente', async () => {
    const input: UserDTO.MÉTODO.Input = {
      id: 'inexistent-id',
      name: 'Novo Nome',
    };

    await assert.rejects(
      () => userUseCase.método(input),
      Error,
      'Deve lançar erro para ID inexistente',
    );
  });

  // ===== TESTE 4: Persistência =====
  await t.test('deve persistir alterações no repositório', async () => {
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Novo Nome',
    };

    const result = await userUseCase.método(input);

    // Recuperar do repositório
    const storedUser = await userRepository.getById(result.id);
    assert.ok(storedUser);
    assert.strictEqual(storedUser.name, 'Novo Nome');
  });

  // ===== TESTE 5: Múltiplas Operações =====
  await t.test('deve suportar múltiplas operações consecutivas', async () => {
    const user1 = await userUseCase.create({
      name: 'Usuário 1',
      phoneNumber: '11987654321',
    });

    const user2 = await userUseCase.create({
      name: 'Usuário 2',
      phoneNumber: '21987654321',
    });

    // Executar MÉTODO em ambos
    const updated1 = await userUseCase.método({
      id: user1.id,
      name: 'Atualizado 1',
    });

    const updated2 = await userUseCase.método({
      id: user2.id,
      name: 'Atualizado 2',
    });

    assert.strictEqual(updated1.name, 'Atualizado 1');
    assert.strictEqual(updated2.name, 'Atualizado 2');
  });
});
```

---

## Template 3: Teste de Controller

Use para `UserController.update()`, `UserController.delete()`, etc.

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';

import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { UserController } from '@/infrastructure/http/controllers/UserController';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

// Reutilizar Mocks
class MockRequest {
  body: any;
  params: any = {};

  constructor(body: any, params?: any) {
    this.body = body;
    this.params = params || {};
  }
}

class MockResponse {
  statusCode: number | null = null;
  data: any = null;
  jsonData: any = null;

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

test('UserController.MÉTODO() - Controlador HTTP', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;
  let userController: UserController;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
    userController = new UserController(userUseCase);
  });

  // ===== TESTE 1: Sucesso =====
  await t.test('deve retornar 200 OK ao executar MÉTODO com sucesso', async () => {
    // Criar usuário primeiro
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Novo Nome',
    };

    const req = new MockRequest(input, { id: created.id }) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;

    assert.strictEqual(result.statusCode, 200, 'Status code deve ser 200');
    assert.ok(result.data, 'Deve retornar dados');
  });

  // ===== TESTE 2: Dados da Resposta =====
  await t.test('deve retornar dados atualizados', async () => {
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Novo Nome',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;
    const responseData = result.data.data;

    assert.strictEqual(responseData.name, 'Novo Nome');
    assert.strictEqual(responseData.id, created.id);
  });

  // ===== TESTE 3: Erro com Dados Inválidos =====
  await t.test('deve retornar erro quando dados são inválidos', async () => {
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input = {
      id: created.id,
      name: '', // ❌ Inválido
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;

    assert.ok(result.statusCode! >= 400, 'Status code deve ser >= 400');
  });

  // ===== TESTE 4: Recurso Não Encontrado (404) =====
  await t.test('deve retornar 404 para recurso inexistente', async () => {
    const input: UserDTO.MÉTODO.Input = {
      id: 'inexistent-id',
      name: 'Novo Nome',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;

    assert.strictEqual(result.statusCode, 404, 'Status code deve ser 404 Not Found');
  });

  // ===== TESTE 5: Múltiplas Requisições =====
  await t.test('deve aceitar múltiplas requisições consecutivas', async () => {
    const user1 = await userUseCase.create({
      name: 'Usuário 1',
      phoneNumber: '11987654321',
    });

    const user2 = await userUseCase.create({
      name: 'Usuário 2',
      phoneNumber: '21987654321',
    });

    // Requisição 1
    const req1 = new MockRequest({ id: user1.id, name: 'Atualizado 1' }) as unknown as Request;
    const res1 = new MockResponse() as unknown as Response;
    const result1 = (await userController.método(req1, res1)) as unknown as MockResponse;

    // Requisição 2
    const req2 = new MockRequest({ id: user2.id, name: 'Atualizado 2' }) as unknown as Request;
    const res2 = new MockResponse() as unknown as Response;
    const result2 = (await userController.método(req2, res2)) as unknown as MockResponse;

    assert.strictEqual(result1.statusCode, 200);
    assert.strictEqual(result2.statusCode, 200);
  });
});
```

---

## Template 4: Teste de Integração (Flow)

Use para testar o fluxo completo E2E.

```typescript
import * as assert from 'node:assert';
import { test } from 'node:test';
import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { UserController } from '@/infrastructure/http/controllers/UserController';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

// Reutilizar Mocks (ver Template 3)
class MockRequest { ... }
class MockResponse { ... }

test('Fluxo Completo de MÉTODO - Integração', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;
  let userController: UserController;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
    userController = new UserController(userUseCase);
  });

  // ===== TESTE 1: Fluxo Completo E2E =====
  await t.test('deve completar fluxo de MÉTODO end-to-end', async () => {
    // 1. Criar usuário
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    // 2. Executar MÉTODO através do controller
    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Novo Nome',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;

    // 3. Validar resposta HTTP
    assert.strictEqual(result.statusCode, 200, 'Deve retornar 200');

    // 4. Validar dados retornados
    const responseData = result.data.data;
    assert.strictEqual(responseData.name, 'Novo Nome');
    assert.strictEqual(responseData.id, created.id);

    // 5. Validar persistência no repositório
    const storedUser = await userRepository.getById(responseData.id);
    assert.ok(storedUser, 'Deve estar no repositório');
    assert.strictEqual(storedUser.name, 'Novo Nome');
  });

  // ===== TESTE 2: Integridade de Dados Através do Flow =====
  await t.test('deve manter integridade de dados através do flow', async () => {
    const created = await userUseCase.create({
      name: 'João Silva',
      phoneNumber: '11987654321',
    });

    const input: UserDTO.MÉTODO.Input = {
      id: created.id,
      name: 'Nome Atualizado',
      phoneNumber: '21987654321', // Se aplicável
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const httpResult = (await userController.método(req, res)) as unknown as MockResponse;
    const httpData = httpResult.data.data;

    // Comparar com o que foi armazenado
    const repositoryData = await userRepository.getById(httpData.id);

    assert.deepStrictEqual(
      {
        id: httpData.id,
        name: httpData.name,
        phoneNumber: httpData.phoneNumber,
      },
      {
        id: repositoryData!.id,
        name: repositoryData!.name,
        phoneNumber: repositoryData!.phoneNumber,
      },
      'Dados devem ser mantidos através do flow',
    );
  });

  // ===== TESTE 3: Múltiplos Usuários =====
  await t.test('deve executar MÉTODO em múltiplos usuários independentemente', async () => {
    // Criar 2 usuários
    const user1 = await userUseCase.create({
      name: 'Usuário 1',
      phoneNumber: '11987654321',
    });

    const user2 = await userUseCase.create({
      name: 'Usuário 2',
      phoneNumber: '21987654321',
    });

    // Executar MÉTODO no primeiro
    const req1 = new MockRequest({
      id: user1.id,
      name: 'Atualizado 1',
    }) as unknown as Request;
    const res1 = new MockResponse() as unknown as Response;

    await userController.método(req1, res1);

    // Validar que o segundo não foi afetado
    const user2Again = await userRepository.getById(user2.id);
    assert.strictEqual(
      user2Again!.name,
      'Usuário 2',
      'Outro usuário não deve ser afetado',
    );
  });

  // ===== TESTE 4: Validação em Cada Camada =====
  await t.test('deve validar em cada camada do flow', async () => {
    const invalidInput = {
      id: 'valid-id',
      name: '', // ❌ Inválido
    };

    const req = new MockRequest(invalidInput) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.método(req, res)) as unknown as MockResponse;

    // Deve ser rejeitado
    assert.ok(result.statusCode! >= 400, 'Deve ser rejeitado');

    // Não deve ter feito alterações no repositório
    assert.strictEqual(
      userRepository.getUsersCount(),
      0,
      'Nenhum usuário deve ser afetado em caso de erro',
    );
  });
});
```

---

## 🔄 Adaptações Rápidas

### Para UPDATE()

```typescript
// Mock do repository
async update(input: UserContract.Update.Input): Promise<...> {
  const user = input as UserModel;
  this.users.set(user.id, user);
  return user;
}

// Teste do UseCase
const updated = await userUseCase.update({
  id: created.id,
  name: 'Novo Nome',
});

// Controller status
assert.strictEqual(result.statusCode, 200); // Não é 201, é 200 OK
```

---

### Para DELETE()

```typescript
// Mock do repository
async delete(input: UserContract.Delete.Input): Promise<void> {
  this.users.delete(input);
  return;
}

// Teste do UseCase
await userUseCase.delete(userId);

// Validar que foi deletado
const found = await userRepository.getById(userId);
assert.strictEqual(found, null);

// Controller status
assert.strictEqual(result.statusCode, 204); // 204 No Content
```

---

### Para GET()

```typescript
// Teste do UseCase
const found = await userUseCase.getById(userId);

// Validar
assert.ok(found);
assert.strictEqual(found.id, userId);

// Caso não encontrado
const notFound = await userUseCase.getById('inexistent');
assert.strictEqual(notFound, null);

// Controller status
assert.strictEqual(result.statusCode, 200); // 200 OK
assert.strictEqual(result.statusCode, 404); // 404 Not Found (se não existe)
```

---

## ✅ Checklist para Novos Testes

- [ ] Criar arquivo de teste (unit ou integration)
- [ ] Importar dependências (test, assert, classes)
- [ ] Criar estrutura `test('Descrição', async (t) => {...})`
- [ ] Adicionar `beforeEach()` se houver estado compartilhado
- [ ] Escrever `await t.test('descrição', async () => {...})`
- [ ] Seguir padrão AAA (Arrange, Act, Assert)
- [ ] Adicionar mínimo 3 casos de teste:
  - Sucesso ✅
  - Erro/Validação ❌
  - Edge case / Múltiplos 🔄
- [ ] Executar `npm test` para validar
- [ ] Verificar que tudo passa ✅

---

## 🚀 Próximos Passos

1. **Copie um template** acima
2. **Adapte para seu método** (update, delete, getById)
3. **Substitua MÉTODO** pelo nome real
4. **Execute `npm test`**
5. **Veja os testes passarem!** 🎉

Boa sorte! 💪
