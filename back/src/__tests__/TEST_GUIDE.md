/\*\*

- GUIA DE EXECUÇÃO DOS TESTES
-
- Este arquivo contém informações sobre como executar os testes do projeto.
- Todos os testes utilizam o Node.js test runner nativo (sem dependências externas).
  \*/

export const testGuide = `
╔════════════════════════════════════════════════════════════════════════════╗
║ GUIA DE TESTES - FLUXO DE CREATE ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 ESTRUTURA DOS TESTES:
├── **tests**/
│ ├── mocks/
│ │ └── UserRepositoryMock.ts - Mock do repositório de usuários
│ ├── unit/
│ │ ├── User.create.test.ts - Testes da entidade User
│ │ ├── UserUseCase.create.test.ts - Testes do caso de uso
│ │ └── UserController.create.test.ts - Testes do controlador HTTP
│ └── integration/
│ └── UserFlow.create.test.ts - Testes de integração end-to-end

🚀 COMANDOS DISPONÍVEIS:

1. Executar todos os testes:
   npm test

2. Executar testes em modo watch (desenvolvimento):
   npm run test:watch

3. Executar apenas testes da entidade User:
   node --loader tsx --test 'src/**tests**/unit/User.create.test.ts'

4. Executar apenas testes do UseCase:
   node --loader tsx --test 'src/**tests**/unit/UserUseCase.create.test.ts'

5. Executar apenas testes do Controller:
   node --loader tsx --test 'src/**tests**/unit/UserController.create.test.ts'

6. Executar apenas testes de integração:
   node --loader tsx --test 'src/**tests**/integration/UserFlow.create.test.ts'

7. Executar todos os testes com verbose:
   node --loader tsx --test 'src/\*_/_.test.ts' --verbose

📊 COBERTURA DOS TESTES:

ENTIDADE USER (User.create.test.ts):
✓ Criação com dados válidos
✓ Geração de UUIDs únicos
✓ Definição de datas corretas
✓ Método self retorna objeto correto
✓ Preservação de todos os dados

USE CASE (UserUseCase.create.test.ts):
✓ Criação com dados válidos
✓ Validação de dados obrigatórios
✓ Verificação de telefone duplicado
✓ AppError com status code correto
✓ Persistência no repositório
✓ Normalização de dados
✓ Múltiplos usuários com telefones diferentes

CONTROLLER HTTP (UserController.create.test.ts):
✓ Status 201 Created em sucesso
✓ Retorna dados do usuário criado
✓ Erro ao dados inválidos
✓ Status 409 Conflict para telefone duplicado
✓ Recepção correta do request body
✓ Chamada do use case
✓ Resposta com estrutura correta
✓ Múltiplos requests sequenciais

INTEGRAÇÃO (UserFlow.create.test.ts):
✓ Fluxo E2E completo (HTTP → UseCase → Repository)
✓ Validação em cada camada
✓ Prevenção de duplicação de telefone
✓ Schema em múltiplas requisições
✓ Integridade de dados
✓ Geração de dados em cada camada
✓ Tratamento de erros no fluxo
✓ Validação de tipos de dados

🔍 PRINCIPAIS CENÁRIOS TESTADOS:

1. ✅ Sucesso - Criar usuário com dados válidos
   - ID único é gerado
   - Timestamps são definidos
   - Status ativo por padrão
   - Dados são persistidos

2. ✅ Validação - Rejeitar dados inválidos
   - Nome vazio
   - Telefone vazio
   - Telefone com letras
   - Telefone muito curto/longo

3. ✅ Integridade - Prevenir duplicação
   - Primeira criação sucede (201)
   - Segunda com mesmo telefone falha (409)
   - Apenas 1 registro é armazenado

4. ✅ Fluxo - Dados fluem corretamente
   - HTTP Request → Controller → UseCase → Repository → Database
   - Dados retornados correspondem aos armazenados

5. ✅ Tipos - Validação de tipos de dados
   - id: string
   - name: string
   - phoneNumber: string
   - active: boolean
   - createdAt: Date
   - updatedAt: Date

💡 COMO USAR MOCKS:

import { UserRepositoryMock } from '@/**tests**/mocks/UserRepositoryMock';

const repository = new UserRepositoryMock();

// Simular erro
repository.setCreateError(new Error('Database error'));

// Limpar repositório
repository.clear();

// Verificar dados
repository.getUsersCount();
repository.getAllUsers();

📝 EXEMPLO DE TESTE:

import { test } from 'node:test';
import \* as assert from 'node:assert';

test('deve fazer algo', async (t) => {
await t.test('sub-teste 1', () => {
assert.strictEqual(1 + 1, 2);
});

await t.test('sub-teste 2', async () => {
const result = await someAsyncFunction();
assert.ok(result);
});
});

🎯 PRÓXIMOS PASSOS:

1. Execute: npm test
2. Verifique os resultados
3. Modifique os testes conforme necessário
4. Execute com watch durante desenvolvimento: npm run test:watch
5. Integre com CI/CD pipeline

📚 REFERÊNCIAS:

- Node.js Test Runner: https://nodejs.org/docs/latest/api/test.html
- Node.js Assert: https://nodejs.org/docs/latest/api/assert.html
- TypeScript com Node.js: https://www.typescriptlang.org/docs/handbook/transpilation.html

`;

console.log(testGuide);
