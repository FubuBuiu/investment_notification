# 🎨 Diagrama Visual da Arquitetura de Testes

## Fluxo de Criação de Usuário

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│          CLIENT (ex: Postman, Frontend)                        │
│          POST /users { name, phoneNumber }                     │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  UserController.create()       │  ← HTTP Router
        │  (Express Request/Response)    │
        │         [8 testes]             │  🧪 UserController.create.test.ts
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  UserUseCase.create()          │  ← Lógica de Negócio
        │  • Validação (Schema Zod)      │
        │  • Verificar duplicação        │  🧪 UserUseCase.create.test.ts
        │  • Chamar Repository           │     [8 testes]
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  User.create()                 │  ← Entidade de Domínio
        │  • Gerar UUID                  │
        │  • Definir timestamps          │  🧪 User.create.test.ts
        │  • Retornar objeto             │     [5 testes]
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  UserRepository.create()       │  ← Persistência
        │  (Mock em Memória)             │
        │  • Armazenar em Map            │  🧪 Integração
        │  • Retornar usuário            │     [8 testes]
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Database (Simulado)           │
        │  • 2 Maps (por ID, por Phone)  │
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Response:                     │
        │  201 Created                   │
        │  {                             │
        │    data: {                     │
        │      id: "uuid-v4",            │
        │      name: "João Silva",       │
        │      phoneNumber: "11...",     │
        │      active: true,             │
        │      createdAt: Date,          │
        │      updatedAt: Date           │
        │    }                           │
        │  }                             │
        └────────────────────────────────┘

                    ✅ 33 TESTES PASSANDO ✅
```

---

## Estrutura de Arquivos

```
src/__tests__/
│
├── 📄 README.md                          ← Documentação principal
├── 📄 DETAILED_GUIDE.md                  ← Explicação detalhada de cada arquivo
├── 📄 TEMPLATES.md                       ← Templates para criar novos testes
├── 📄 TEST_GUIDE.md                      ← Guia de execução
│
├── 📁 mocks/
│   └── 🔧 UserRepositoryMock.ts          (Storage em Memória)
│       ├── create()     ✅
│       ├── update()     ✅
│       ├── getById()    ✅
│       ├── getByPhoneNumber() ✅
│       └── delete()     ✅
│
├── 📁 unit/
│   │
│   ├── 🧪 User.create.test.ts            (5 testes)
│   │   ├── ✅ Criar com dados válidos
│   │   ├── ✅ UUIDs únicos
│   │   ├── ✅ Datas corretas
│   │   ├── ✅ Método self
│   │   └── ✅ Preservar dados
│   │
│   ├── 🧪 UserUseCase.create.test.ts     (8 testes)
│   │   ├── ✅ Criar com dados válidos
│   │   ├── ✅ Validar dados obrigatórios
│   │   ├── ✅ Verificar duplicação
│   │   ├── ✅ AppError.conflict() (409)
│   │   ├── ✅ Persistir no repositório
│   │   ├── ✅ Tolerar espaços em branco
│   │   ├── ✅ Múltiplos usuários
│   │   └── ✅ Converter através de schema
│   │
│   └── 🧪 UserController.create.test.ts  (8 testes)
│       ├── ✅ Retornar 201 Created
│       ├── ✅ Retornar dados do usuário
│       ├── ✅ Retornar erro (dados inválidos)
│       ├── ✅ Retornar 409 (duplicação)
│       ├── ✅ Receber request body
│       ├── ✅ Chamar use case
│       ├── ✅ Resposta com estrutura correta
│       └── ✅ Múltiplas requisições sequenciais
│
└── 📁 integration/
    └── 🧪 UserFlow.create.test.ts        (8 testes)
        ├── ✅ Fluxo E2E completo
        ├── ✅ Validar em cada camada
        ├── ✅ Impedir duplicação
        ├── ✅ Validar schema (múltiplas requisições)
        ├── ✅ Manter integridade de dados
        ├── ✅ Gerar dados em cada camada
        ├── ✅ Lidar com erro de database
        └── ✅ Validar tipos de dados
```

---

## Padrão AAA Ilustrado

```
┌──────────────────────────────────────────────────────────────┐
│  await t.test('descrição do teste', async () => {            │
│                                                              │
│  🟢 ARRANGE (Preparar)                                       │
│  ┌──────────────────────────────────────────┐                │
│  │ const input = {                          │                │
│  │   name: 'João Silva',                    │                │
│  │   phoneNumber: '11987654321'             │                │
│  │ };                                       │                │
│  │                                          │                │
│  │ const repo = new UserRepositoryMock();   │                │
│  │ const useCase = new UserUseCase(repo);   │                │
│  └──────────────────────────────────────────┘                │
│                                                              │
│  🟡 ACT (Executar)                                           │
│  ┌──────────────────────────────────────────┐                │
│  │ const result = await useCase.create(input);              │
│  └──────────────────────────────────────────┘                │
│                                                              │
│  🔴 ASSERT (Validar)                                         │
│  ┌──────────────────────────────────────────┐                │
│  │ assert.ok(result.id);                    │                │
│  │ assert.strictEqual(result.name, 'João'); │                │
│  │ assert.strictEqual(result.active, true); │                │
│  └──────────────────────────────────────────┘                │
│                                                              │
│  });                                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Isolamento com beforeEach

```
┌─────────────────────────────────────────────┐
│  test('UserUseCase', async (t) => {         │
│                                             │
│    let repository;                          │
│    let useCase;                             │
│                                             │
│    t.beforeEach(() => {  ← Executado ANTES │
│      repository = new UserRepositoryMock(); │   de cada
│      useCase = new UserUseCase(repository); │   teste
│    });                                      │
│                                             │
│    ┌──────────────────────────────────────┐ │
│    │ await t.test('teste 1', () => {    │ │
│    │   // Começa com instância limpa    │ │
│    │ });                                │ │
│    └──────────────────────────────────────┘ │
│                                             │
│    ┌──────────────────────────────────────┐ │
│    │ await t.test('teste 2', () => {    │ │
│    │   // Começa com instância limpa    │ │
│    │ });                                │ │
│    └──────────────────────────────────────┘ │
│                                             │
│  });                                        │
└─────────────────────────────────────────────┘

Resultado:
✅ Testes isolados
✅ Sem estado compartilhado
✅ Determinísticos
```

---

## Mapa de Assertions

```
┌─────────────────────────────────────────────────────────────┐
│  ASSERTIONS (node:assert)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ assert.ok(value)                                        │
│     └─ Verifica se é TRUTHY                                │
│     └─ Exemplo: assert.ok(user.id);                        │
│                                                             │
│  ✅ assert.strictEqual(actual, expected)                    │
│     └─ Igualdade ESTRITA (===)                             │
│     └─ Exemplo: assert.strictEqual(user.name, 'João');    │
│                                                             │
│  ✅ assert.notStrictEqual(a, b)                             │
│     └─ Diferença ESTRITA (!==)                             │
│     └─ Exemplo: assert.notStrictEqual(uid1, uid2);         │
│                                                             │
│  ✅ assert.deepStrictEqual(obj1, obj2)                      │
│     └─ Comparação PROFUNDA de objetos                      │
│     └─ Exemplo: assert.deepStrictEqual({a:1}, {a:1});      │
│                                                             │
│  ✅ assert.rejects(promise, ErrorType)                      │
│     └─ Valida que Promise REJEITA                          │
│     └─ Exemplo: await assert.rejects(fn(), ZodError);      │
│                                                             │
│  ✅ assert.throws(fn, ErrorType)                            │
│     └─ Valida que função lança ERRO                        │
│     └─ Exemplo: assert.throws(() => error(), AppError);    │
│                                                             │
│  ✅ assert.fail('message')                                  │
│     └─ Força FALHA do teste                                │
│     └─ Exemplo: assert.fail('Shouldn't reach here');        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tipos de Teste por Camada

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   ENTIDADE   │      │   USE CASE   │      │  CONTROLLER  │
│              │      │              │      │              │
│ User.create()│      │ UseCase.xxx()│      │ Controller...│
│              │      │              │      │              │
│  5 testes    │      │  8 testes    │      │  8 testes    │
│              │      │              │      │              │
│────────────┐ │      │────────────┐ │      │────────────┐ │
│ • Criar OK │ │      │ • Validar  │ │      │ • HTTP 200 │ │
│ • UUID     │ │      │ • Regra    │ │      │ • HTTP 201 │ │
│ • Timestamps│ │      │ • Duplica  │ │      │ • HTTP 409 │ │
│ • self()   │ │      │ • Repo     │ │      │ • Formato  │ │
│ • Dados OK │ │      │ • Erro     │ │      │ • Error    │ │
└────────────┘ │      └────────────┘ │      └────────────┘ │
└──────────────┘      └──────────────┘      └──────────────┘
        │                    │                      │
        └────────────────────┴──────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ INTEGRAÇÃO    │
              │               │
              │ Flow Complete │
              │               │
              │  8 testes     │
              │               │
              │─────────────┐ │
              │ • E2E OK    │ │
              │ • Validação │ │
              │ • Duplica   │ │
              │ • Múltiplas │ │
              │ • Integridade
              │ • Dados OK  │ │
              │ • Error     │ │
              │ • Types     │ │
              └─────────────┘ │
              └───────────────┘

                  29 testes = ✅ 100%
```

---

## Flow de Decisão: Que Arquivo Criar?

```
                'Qual teste criar?'
                       │
                       ▼
          ┌────────────────────────┐
          │ É um MÉTODO PURO       │
          │ de uma ENTIDADE?       │
          │ (sem dependências)     │
          └────┬───────────────────┘
               │
        ┌──────┴──────┐
        │ SIM        │ NÃO
        ▼             ▼
    ┌──────────────┐ ┌────────────────────┐
    │ User.xxx.ts  │ │ Usa injeção de     │
    │ TESTE puro   │ │ dependência?       │
    │ SEM Mock     │ │ (Mock repository)  │
    └──────────────┘ └────┬───────────────┘
                          │
                   ┌──────┴──────┐
                   │ SIM        │ NÃO
                   ▼             ▼
               ┌──────────────┐┌──────────────┐
               │UseCase.xx.ts ││Controller.xx │
               │ Com Mock     ││ Com Mock     │
               │ + beforeEach ││ HTTP         │
               └──────────────┘└──────────────┘

          TODOS: Depois criar Flow teste E2E
                UserFlow.xxx.test.ts
```

---

## Status Codes HTTP

```
┌──────────┬──────────┬────────────────────────────┐
│ Código   │ Status   │ Quando Usar                │
├──────────┼──────────┼────────────────────────────┤
│ 200      │ OK       │ UPDATE, GET success        │
│ 201      │ Created  │ CREATE success             │
│ 204      │ No Cont. │ DELETE success             │
│ 400      │ Bad Req  │ Dados inválidos (Zod err) │
│ 404      │ Not Fnd  │ Recurso não encontrado    │
│ 409      │ Conflict │ Duplicação (AppError)     │
│ 500      │ Error    │ Erros não tratados        │
└──────────┴──────────┴────────────────────────────┘

Exemplos de Teste:

await t.test('CREATE', async () => {
  const result = await controller.create(req, res);
  assert.strictEqual(result.statusCode, 201);
});

await t.test('UPDATE', async () => {
  const result = await controller.update(req, res);
  assert.strictEqual(result.statusCode, 200);
});

await t.test('DELETE', async () => {
  const result = await controller.delete(req, res);
  assert.strictEqual(result.statusCode, 204);
});

await t.test('GET Not Found', async () => {
  const result = await controller.getById(req, res);
  assert.strictEqual(result.statusCode, 404);
});
```

---

## Mock Repository - Operações

```
const repo = new UserRepositoryMock();

┌─────────────────────────────────────────┐
│ CRIAR DADOS                             │
├─────────────────────────────────────────┤
│ await repo.create(user)                 │
│ await repo.update(user)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ LER DADOS                               │
├─────────────────────────────────────────┤
│ await repo.getById('user-id')           │
│ await repo.getByPhoneNumber('119...')   │
│ repo.getAllUsers()                      │
│ repo.getUsersCount()                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DELETAR DADOS                           │
├─────────────────────────────────────────┤
│ await repo.delete('user-id')            │
│ repo.clear()  ← Limpa TUDO              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SIMULAR ERROS                           │
├─────────────────────────────────────────┤
│ repo.setCreateError(new Error('...'));  │
│ repo.setGetByIdError(new Error('...')); │
│ repo.clearErrors()                      │
└─────────────────────────────────────────┘
```

---

## Checklist: Criar Novo Teste

```
□ Identificar qual método testar (create, update, delete, etc)

□ ENTIDADE (se aplicável)
  □ Criar: src/__tests__/unit/User.MÉTODO.test.ts
  □ Testes: 3-5 casos básicos
  □ Sem mock, sem async

□ USE CASE (obrigatório)
  □ Criar: src/__tests__/unit/UserUseCase.MÉTODO.test.ts
  □ Setup: beforeEach() com Mock
  □ Testes: 5-8 casos (sucesso, erro, edge cases)
  □ Usar: async/await

□ CONTROLLER (obrigatório)
  □ Criar: src/__tests__/unit/UserController.MÉTODO.test.ts
  □ Setup: beforeEach() com Mock + HttpMocks
  □ Testes: 5-8 casos (HTTP status, body, errors)
  □ Usar: async/await + type assertions

□ INTEGRAÇÃO (obrigatório)
  □ Criar: src/__tests__/integration/UserFlow.MÉTODO.test.ts
  □ Setup: beforeEach() com instâncias integradas
  □ Testes: 5-8 casos (E2E, múltiplos, integridade)
  □ Validar: HTTP → UseCase → Repository

□ EXECUÇÃO
  □ $ npm test
  □ Todos os testes passam ✅
  □ Sem warnings ou errors
  □ Coverage adequado

□ DOCUMENTAÇÃO
  □ Comentários explicativos em testes complexos
  □ PR com descrição dos testes
```

---

## 💡 Dicas Rápidas

```
│ # Para executar TODOS os testes
│ $ npm test

│ # Para executar APENAS um arquivo
│ $ tsx --test 'src/__tests__/unit/User.create.test.ts'

│ # Para ver TODOS os testes em detalhes
│ $ npm test 2>&1 | less

│ # Para ver APENAS os que falharam
│ $ npm test 2>&1 | grep '✖'

│ # Para modo WATCH (reexecuta ao salvar)
│ $ npm run test:watch

│ # Para ver o COUNT de testes
│ $ npm test 2>&1 | grep 'ℹ tests'

│ # Para evitar TIMEOUT (increase)
│ $ node --import tsx --test 'src/**/*.test.ts' --timeout=10000
```

---

## 🎯 Resumo Final

```
┌──────────────────────────────────────────────────────────┐
│  TESTES COM NODE.JS TEST RUNNER NATIVO                  │
│                                                          │
│  ✅ 33 Testes Passando                                   │
│  ✅ 0 Dependências de Teste (Jest, Mocha, etc)          │
│  ✅ 0 Configuração Complexa                              │
│  ✅ 100% Cobertura do Fluxo Create                       │
│                                                          │
│  Arquivos:                                              │
│  • 1 Mock       (UserRepositoryMock.ts)                 │
│  • 5 Testes     (User, UseCase, Controller, Flow × 2)  │
│  • 3 Docs       (README, DETAILED_GUIDE, TEMPLATES)    │
│                                                          │
│  Padrões:                                               │
│  • Type Safety com TypeScript                           │
│  • AAA Pattern (Arrange, Act, Assert)                   │
│  • isolamento com beforeEach                            │
│  • Mocks em Memória                                    │
│  • Testes Determinísticos                              │
│                                                          │
│  Próximo: Aplicar padrão a outros métodos! 🚀           │
└──────────────────────────────────────────────────────────┘
```
