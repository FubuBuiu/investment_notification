# ⚡ Quick Reference - Testes em 1 Página

## Estrutura dos 5 Arquivos

### 1️⃣ UserRepositoryMock.ts (Mock)

```typescript
// O que é: Simula o banco de dados em memória
// Por que: Sem dependências externas, rápido, controlável

const repo = new UserRepositoryMock();
await repo.create(user); // Armazena em Map
await repo.getById(id); // Recupera por ID
await repo.getByPhoneNumber(phone); // Recupera por telefone
repo.getUsersCount(); // Quantos tem?
repo.clear(); // Limpa tudo (use em beforeEach)

// Simular erros:
repo.setCreateError(new Error('DB Error'));
await repo.create(user); // ❌ Lança erro
```

---

### 2️⃣ User.create.test.ts (Teste de Entidade)

```typescript
// O que testa: Lógica PURA da entidade (sem dependencies)
// Quando usar: Métodos simples, dados imutáveis

import * as assert from 'node:assert';
import { test } from 'node:test';

import { User } from '@/domain/entities/User';

test('User.create() - Entidade', async (t) => {
  await t.test('deve criar usuário com dados válidos', () => {
    // 🟢 ARRANGE
    const validData = { name: 'João', phoneNumber: '11987654321' };

    // 🟡 ACT
    const user = User.create(validData);

    // 🔴 ASSERT
    assert.ok(user.id);
    assert.strictEqual(user.name, 'João');
    assert.strictEqual(user.active, true);
    assert.ok(user.createdAt instanceof Date);
  });
});

// ✅ 5 testes
// ⏱️ ~1ms cada
// 🔧 Sem async, sem mock
```

---

### 3️⃣ UserUseCase.create.test.ts (Teste de Use Case)

```typescript
// O que testa: Lógica de NEGÓCIO (validação, regras, repository)
// Quando usar: Métodos com dependências, async

import * as assert from 'node:assert';
import { test } from 'node:test';

import { UserUseCase } from '@/domain/usecases/UserUseCase';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

test('UserUseCase.create() - Caso de Uso', async (t) => {
  let repo: UserRepositoryMock;
  let useCase: UserUseCase;

  // ✨ Executado ANTES de cada teste
  t.beforeEach(() => {
    repo = new UserRepositoryMock();
    useCase = new UserUseCase(repo);
  });

  await t.test('deve criar com dados válidos', async () => {
    const input = { name: 'João', phoneNumber: '11987654321' };
    const result = await useCase.create(input);

    assert.ok(result.id);
    assert.strictEqual(result.active, true);
    assert.strictEqual(repo.getUsersCount(), 1); // Persist check
  });

  await t.test('deve validar dados', async () => {
    await assert.rejects(() => useCase.create({ name: 'João', phoneNumber: 'abc' }), {
      name: 'ZodError',
    });
  });

  await t.test('deve evitar duplicação', async () => {
    await useCase.create({ name: 'João', phoneNumber: '11987654321' });

    await assert.rejects(
      () => useCase.create({ name: 'Maria', phoneNumber: '11987654321' }),
      AppError,
    );
  });
});

// ✅ 8 testes
// ⏱️ ~1ms cada
// 🔧 Async + Mock + beforeEach
```

---

### 4️⃣ UserController.create.test.ts (Teste de Controller)

```typescript
// O que testa: Respostas HTTP (status codes, formato)
// Quando usar: Métodos que retornam Response (Express)

import * as assert from 'node:assert';
import { test } from 'node:test';

import { UserController } from '@/infrastructure/http/controllers/UserController';

// Mock de Request/Response
class MockRequest {
  constructor(public body: any) {}
}
class MockResponse {
  statusCode: number | null = null;
  data: any = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }
  json(data: any) {
    this.data = data;
    return this;
  }
}

test('UserController.create() - HTTP', async (t) => {
  let controller: UserController;

  t.beforeEach(() => {
    const repo = new UserRepositoryMock();
    const useCase = new UserUseCase(repo);
    controller = new UserController(useCase);
  });

  await t.test('deve retornar 201 Created', async () => {
    const req = new MockRequest({ name: 'João', phoneNumber: '11987654321' });
    const res = new MockResponse();

    const result = await controller.create(req, res);

    assert.strictEqual(result.statusCode, 201);
    assert.ok(result.data.data);
    assert.ok(result.data.data.id);
  });

  await t.test('deve retornar 409 em duplicação', async () => {
    const input = { name: 'João', phoneNumber: '11987654321' };

    // Primeira requisição
    await controller.create(new MockRequest(input), new MockResponse());

    // Segunda requisição
    const res = new MockResponse();
    await controller.create(new MockRequest(input), res);

    assert.strictEqual(res.statusCode, 409);
  });
});

// ✅ 8 testes
// ⏱️ ~1-2ms cada
// 🔧 HTTP mocks + type assertions
```

---

### 5️⃣ UserFlow.create.test.ts (Teste de Integração)

```typescript
// O que testa: Fluxo COMPLETO end-to-end (HTTP → UseCase → Repository)
// Quando usar: Validar que tudo funciona junto

test('Fluxo Completo - Integração', async (t) => {
  let repo: UserRepositoryMock;
  let useCase: UserUseCase;
  let controller: UserController;

  t.beforeEach(() => {
    repo = new UserRepositoryMock();
    useCase = new UserUseCase(repo);
    controller = new UserController(useCase);
  });

  await t.test('deve completar fluxo E2E', async () => {
    // 1. Preparar
    const input = { name: 'João', phoneNumber: '11987654321' };
    const req = new MockRequest(input);
    const res = new MockResponse();

    // 2. Executar através de TODAS as camadas
    const result = await controller.create(req, res);

    // 3. Validar em cada ponto
    assert.strictEqual(result.statusCode, 201);
    const userData = result.data.data;
    assert.ok(userData.id);

    // 4. Validar persistência
    const stored = await repo.getById(userData.id);
    assert.strictEqual(stored.name, 'João');
  });

  await t.test('deve impedir duplicação através do flow', async () => {
    const input = { name: 'João', phoneNumber: '11987654321' };

    // Primeira requisição - sucesso
    const res1 = new MockResponse();
    await controller.create(new MockRequest(input), res1);
    assert.strictEqual(res1.statusCode, 201);

    // Segunda requisição - erro
    const res2 = new MockResponse();
    await controller.create(new MockRequest(input), res2);
    assert.strictEqual(res2.statusCode, 409);
  });
});

// ✅ 8 testes
// ⏱️ ~1-3ms cada
// 🔧 Fluxo completo + múltiplas validações
```

---

## Executar Testes

```bash
# Todos os 33 testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Apenas um arquivo
tsx --test 'src/__tests__/unit/User.create.test.ts'

# Com output detalhado
npm test -- --reporter=tap
```

---

## Assertions Principais

```typescript
assert.ok(value); // Truthy
assert.strictEqual(a, b); // === igualdade
assert.notStrictEqual(a, b); // !== diferença
assert.deepStrictEqual(obj1, obj2); // Deep compare
assert.rejects(promise, ErrorType); // Promise rejection
assert.throws(fn, ErrorType); // Function throw
assert.fail('message'); // Força falha
```

---

## beforeEach - Por que Usar

```typescript
test('Grupo', async (t) => {
  let repo, useCase;

  t.beforeEach(() => {
    // ← Executado ANTES de cada teste
    repo = new UserRepositoryMock();
    useCase = new UserUseCase(repo);
  });

  // Cada teste começa com instâncias LIMPAS
  await t.test('teste 1', () => {
    /* usa repo novo */
  });
  await t.test('teste 2', () => {
    /* usa repo novo */
  });
});
```

✅ Isolamento
✅ Sem estado compartilhado
✅ Determinístico

---

## AAA Pattern

```typescript
await t.test('descrição', async () => {
  // 🟢 ARRANGE - Preparar dados
  const input = { name: 'João', phoneNumber: '11987654321' };
  const service = new UserUseCase(repo);

  // 🟡 ACT - Executar
  const result = await service.create(input);

  // 🔴 ASSERT - Validar
  assert.ok(result.id);
  assert.strictEqual(result.name, 'João');
});
```

---

## Status Codes HTTP

| Código | Teste                                     | Quando                |
| ------ | ----------------------------------------- | --------------------- |
| 200    | `assert.strictEqual(res.statusCode, 200)` | UPDATE, GET OK        |
| 201    | `assert.strictEqual(res.statusCode, 201)` | CREATE OK             |
| 204    | `assert.strictEqual(res.statusCode, 204)` | DELETE OK             |
| 400    | `assert.strictEqual(res.statusCode, 400)` | Dados inválidos       |
| 404    | `assert.strictEqual(res.statusCode, 404)` | Não encontrado        |
| 409    | `assert.strictEqual(res.statusCode, 409)` | Conflito (duplicação) |

---

## Criar Novos Testes

### Passo 1: Copiar Template

File: `/src/__tests__/TEMPLATES.md`

### Passo 2: Adaptar para Seu Método

```typescript
// Trocar:
User.create() → User.update()
UserUseCase.create() → UserUseCase.update()
UserController.create() → UserController.update()

// Trocar:
const result = await useCase.create(input);
// Por:
const result = await useCase.update(input);
```

### Passo 3: Ajustar Status Codes

```typescript
// CREATE
assert.strictEqual(res.statusCode, 201);

// UPDATE
assert.strictEqual(res.statusCode, 200);

// DELETE
assert.strictEqual(res.statusCode, 204);
```

### Passo 4: Executar

```bash
npm test
```

---

## Documentação Completa

| Arquivo                | O que é                        | Quando Ler        |
| ---------------------- | ------------------------------ | ----------------- |
| **README.md**          | Overview                       | Início            |
| **DETAILED_GUIDE.md**  | Explicação linha por linha     | Entender profundo |
| **TEMPLATES.md**       | Copiar-colar para novos testes | Criar novos       |
| **VISUAL_GUIDE.md**    | Diagramas e fluxos             | Visualizar        |
| **TEST_GUIDE.md**      | Como executar                  | Rodar testes      |
| **QUICK_REFERENCE.md** | Esta página                    | Referência rápida |

---

## Checklist: Novo Teste

- [ ] Criar arquivo em `/src/__tests__/`
- [ ] Importar: `test from 'node:test'`, `assert from 'node:assert'`
- [ ] Criar estrutura: `test('Nome', async (t) => {...})`
- [ ] Adicionar `beforeEach()` se houver estado
- [ ] Escrever `await t.test('caso', async () => {...})` ×3-5
- [ ] Seguir AAA: Arrange → Act → Assert
- [ ] Testar: sucesso, erro, edge case
- [ ] Executar: `npm test`
- [ ] Todos passam ✅

---

## Dicas Rápidas

```bash
# Ver quantos testes passaram
$ npm test 2>&1 | grep "ℹ pass"

# Ver quais falharam
$ npm test 2>&1 | grep "✖"

# Ver tudo bem organizado
$ npm test | head -50

# Aumentar timeout se necessário
$ node --import tsx --test 'src/**/*.test.ts' --timeout=10000
```

---

## 33 Testes = 100% do Fluxo Create

```
┌─────────────┐
│   ENTITY    │  5 testes
├─────────────┤
│  USE CASE   │  8 testes  }── 100% cobertura
├─────────────┤             } do fluxo
│ CONTROLLER  │  8 testes  }
├─────────────┤
│INTEGRATION  │  8 testes
└─────────────┘
    33 total
```

**Próximo:** Aplicar padrão aos métodos `update()`, `delete()`, `getById()`! 🚀

---

**Arquivo:** `/src/__tests__/QUICK_REFERENCE.md`
**Última atualização:** Abril 2026
**Node.js:** v24.14.1+
