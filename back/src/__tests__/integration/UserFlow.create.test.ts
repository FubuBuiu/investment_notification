import * as assert from 'node:assert';
import { test } from 'node:test';

import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { UserController } from '@/infrastructure/http/controllers/UserController';

import { UserRepositoryMock } from '../mocks/UserRepositoryMock';

// Mock Express Request e Response (mesmo do teste do controller)
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

test('Fluxo Completo de Create - Integração', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;
  let userController: UserController;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
    userController = new UserController(userUseCase);
  });

  await t.test('deve completar fluxo de criação end-to-end', async () => {
    // Preparar dados
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    // Executar requisição HTTP
    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    // Validar resposta HTTP
    assert.strictEqual(result.statusCode, 201, 'Deve retornar 201 Created');

    // Validar dados retornados
    const userData = result.data.data;
    assert.strictEqual(userData.name, input.name);
    assert.strictEqual(userData.phoneNumber, input.phoneNumber);
    assert.strictEqual(userData.active, true);
    assert.ok(userData.id, 'ID deve ser gerado');
    assert.ok(userData.createdAt, 'createdAt deve ser definido');
    assert.ok(userData.updatedAt, 'updatedAt deve ser definido');

    // Validar persistência no repositório
    const storedUser = await userRepository.getById(userData.id);
    assert.ok(storedUser, 'Usuário deve estar armazenado no repositório');
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

  await t.test('deve validar em cada camada do fluxo', async () => {
    const invalidInput = {
      name: 'João Silva',
      phoneNumber: 'abc', // inválido
    };

    const req = new MockRequest(invalidInput) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    // Deve ser rejeitado no controller/usecase
    assert.ok(result.statusCode! >= 400, 'Deve retornar erro');

    // Repository não deve ter armazenado nada
    assert.strictEqual(userRepository.getUsersCount(), 0, 'Nenhum usuário deve ser armazenado');
  });

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

    // Repository deve ter apenas 1 usuário
    assert.strictEqual(userRepository.getUsersCount(), 1, 'Deve ter apenas 1 usuário armazenado');
  });

  await t.test('deve validar schema em múltiplas requisições consecutivas', async () => {
    const validUsers = [
      { name: 'Usuário 1', phoneNumber: '11987654321' },
      { name: 'Usuário 2', phoneNumber: '21987654321' },
      { name: 'Usuário 3', phoneNumber: '31987654321' },
    ];

    const createdUsers = [];

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

  await t.test('deve gerar dados corretos em cada camada', async () => {
    // Usar repositório limpo para este teste
    const cleanRepository = new UserRepositoryMock();
    const cleanUseCase = new UserUseCase(cleanRepository);
    const cleanController = new UserController(cleanUseCase);

    const input: UserDTO.Create.Input = {
      name: 'Ana Costa',
      phoneNumber: '31987654396',
    };

    // UseCase layer
    const usecaseResult = await cleanUseCase.create(input);

    assert.ok(usecaseResult.id, 'UseCase deve gerar ID');
    assert.ok(usecaseResult.createdAt, 'UseCase deve gerar createdAt');
    assert.ok(usecaseResult.updatedAt, 'UseCase deve gerar updatedAt');
    assert.strictEqual(usecaseResult.active, true, 'UseCase deve ativar usuário');

    // Controller layer - criar em repositório limpo
    const req2 = new MockRequest(input) as unknown as Request;
    const res2 = new MockResponse() as unknown as Response;

    await cleanController.create(req2, res2);

    // Verificar que foi armazenado no repositório limpo
    assert.strictEqual(
      cleanRepository.getUsersCount(),
      1,
      'Deve ter 1 usuário no repositório limpo',
    );

    const storedUsers = cleanRepository.getAllUsers();
    const storedUser = storedUsers[0];

    // Dados devem ter as mesmas propriedades obrigatórias
    assert.ok(storedUser.id);
    assert.ok(storedUser.createdAt);
    assert.ok(storedUser.updatedAt);
    assert.strictEqual(storedUser.active, true);
  });

  await t.test('deve lidar com erro de database através do fluxo', async () => {
    const input: UserDTO.Create.Input = {
      name: 'Fernando Lima',
      phoneNumber: '11987654328',
    };

    // Criar um usuário normalmente
    const req1 = new MockRequest(input) as unknown as Request;
    const res1 = new MockResponse() as unknown as Response;

    const result1 = (await userController.create(req1, res1)) as unknown as MockResponse;
    assert.strictEqual(result1.statusCode, 201);

    // Tentar criar duplicado (simula conflito de database)
    const req2 = new MockRequest(input) as unknown as Request;
    const res2 = new MockResponse() as unknown as Response;

    const result2 = (await userController.create(req2, res2)) as unknown as MockResponse;

    // Deve ser tratado como erro
    assert.ok(result2.statusCode! >= 400, 'Erro deve ser retornado ao usuário');

    // Repository deve ter apenas 1 registro
    assert.strictEqual(userRepository.getUsersCount(), 1, 'Deve ter mantido apenas 1 usuário');
  });

  await t.test('deve validar tipos de dados em todas as camadas', async () => {
    const input: UserDTO.Create.Input = {
      name: 'Tipos Válidos',
      phoneNumber: '11987654329',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;
    const data = result.data.data;

    // Validar tipos
    assert.strictEqual(typeof data.id, 'string', 'ID deve ser string');
    assert.strictEqual(typeof data.name, 'string', 'Name deve ser string');
    assert.strictEqual(typeof data.phoneNumber, 'string', 'PhoneNumber deve ser string');
    assert.strictEqual(typeof data.active, 'boolean', 'Active deve ser boolean');
    assert.ok(data.createdAt instanceof Date, 'CreatedAt deve ser Date');
    assert.ok(data.updatedAt instanceof Date, 'UpdatedAt deve ser Date');
  });
});
