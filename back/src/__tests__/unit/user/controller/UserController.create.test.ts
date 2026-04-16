import assert from 'node:assert';
import { test } from 'node:test';

import { Request, Response } from 'express';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { UserController } from '@/infrastructure/http/controllers/UserController';

import { UserRepositoryMock } from '../../../mocks/UserRepositoryMock';

// Mock Express Request e Response
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

test('UserController.create() - Controlador HTTP', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;
  let userController: UserController;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
    userController = new UserController(userUseCase);
  });

  await t.test('deve retornar 201 Created ao criar usuário com sucesso', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    assert.strictEqual(result.statusCode, 201, 'Status code deve ser 201 Created');
    assert.ok(result.data, 'Deve retornar dados');
    assert.ok(result.data.data, 'Deve retornar objeto com propriedade data');
  });

  await t.test('deve retornar dados do usuário criado', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    const userData = result.data.data;
    assert.strictEqual(userData.name, input.name, 'Nome deve corresponder');
    assert.strictEqual(userData.phoneNumber, input.phoneNumber, 'Telefone deve corresponder');
    assert.strictEqual(userData.active, true, 'Usuário deve estar ativo');
    assert.ok(userData.id, 'Deve ter um ID');
  });

  await t.test('deve retornar erro quando dados são inválidos', async () => {
    const input = {
      name: 'João Silva',
      phoneNumber: 'abc', // telefone inválido
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    assert.ok(result.statusCode && result.statusCode >= 400, 'Status code deve ser >= 400');
    assert.ok(result.data, 'Deve retornar dados de erro');
  });

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

    assert.strictEqual(result.statusCode, 409, 'Status code deve ser 409 Conflict');
  });

  await t.test('deve receber dados do request body', async () => {
    const input: UserDTO.Create.Input = {
      name: 'Carlos Oliveira',
      phoneNumber: '21987654321',
    };

    const mockReq = new MockRequest(input);
    assert.deepStrictEqual(mockReq.body, input, 'Request deve conter os dados corretos');
  });

  await t.test('deve chamar o use case create corretamente', async () => {
    const input: UserDTO.Create.Input = {
      name: 'Ana Costa',
      phoneNumber: '31987654321',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    await userController.create(req, res);

    assert.strictEqual(
      userRepository.getUsersCount(),
      1,
      'Deve ter persistido o usuário no repositório',
    );
  });

  await t.test('deve retornar resposta formatada com estrutura correta', async () => {
    const input: UserDTO.Create.Input = {
      name: 'Fernando Lima',
      phoneNumber: '11987654328',
    };

    const req = new MockRequest(input) as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    const result = (await userController.create(req, res)) as unknown as MockResponse;

    const response = result.data;
    assert.ok(response.data, 'Resposta deve ter propriedade data');
    assert.ok(response.data.id, 'Dados deve conter ID do usuário');
    assert.ok(response.data.createdAt, 'Dados deve conter createdAt');
  });

  await t.test('deve aceitar multiplos requests sequenciais', async () => {
    const inputs = [
      { name: 'Usuário 1', phoneNumber: '11987654321' },
      { name: 'Usuário 2', phoneNumber: '21987654321' },
      { name: 'Usuário 3', phoneNumber: '31987654321' },
    ];

    for (const input of inputs) {
      const req = new MockRequest(input) as unknown as Request;
      const res = new MockResponse() as unknown as Response;

      const result = (await userController.create(req, res)) as unknown as MockResponse;
      assert.strictEqual(
        result.statusCode,
        201,
        `Deve criar usuário com telefone ${input.phoneNumber}`,
      );
    }

    assert.strictEqual(userRepository.getUsersCount(), 3, 'Deve ter criado 3 usuários no total');
  });
});
