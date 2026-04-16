import * as assert from 'node:assert';
import { test } from 'node:test';

import { UserDTO } from '@/application/dto/UserDTO';
import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { AppError } from '@/errors/AppError';

import { UserRepositoryMock } from '../../../mocks/UserRepositoryMock';

test('UserUseCase.create() - Caso de Uso', async (t) => {
  let userRepository: UserRepositoryMock;
  let userUseCase: UserUseCase;

  t.beforeEach(() => {
    userRepository = new UserRepositoryMock();
    userUseCase = new UserUseCase(userRepository);
  });

  await t.test('deve criar um novo usuário com dados válidos', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const result = await userUseCase.create(input);

    assert.ok(result.id, 'Usuário deve ter um ID gerado');
    assert.strictEqual(result.name, input.name, 'Nome deve corresponder');
    assert.strictEqual(result.phoneNumber, input.phoneNumber, 'Telefone deve corresponder');
    assert.strictEqual(result.active, true, 'Usuário deve estar ativo');
    assert.ok(result.createdAt, 'createdAt deve ser definido');
    assert.ok(result.updatedAt, 'updatedAt deve ser definido');
  });

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

    for (const { input, description } of invalidInputs) {
      await assert.rejects(
        () => userUseCase.create(input as UserDTO.Create.Input),
        {
          name: 'ZodError',
        },
        `Deve rejeitar quando ${description}`,
      );
    }
  });

  await t.test('deve verificar se o telefone já existe', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    // Criar o primeiro usuário
    await userUseCase.create(input);

    // Tentar criar outro com o mesmo telefone
    const duplicateInputData = {
      name: 'Maria Santos',
      phoneNumber: '11987654321',
    };

    await assert.rejects(
      () => userUseCase.create(duplicateInputData as UserDTO.Create.Input),
      AppError,
      'Deve rejeitar usuário duplicado',
    );
  });

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

  await t.test('deve persistir usuário no repositório', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const result = await userUseCase.create(input);

    assert.strictEqual(
      userRepository.getUsersCount(),
      1,
      'Repositório deve ter 1 usuário armazenado',
    );

    const storedUser = await userRepository.getById(result.id);
    assert.ok(storedUser, 'Usuário deve estar no repositório');
    assert.strictEqual(storedUser?.id, result.id, 'ID deve corresponder');
  });

  await t.test('deve tolerar espaços em branco legítimos no nome', async () => {
    const input: UserDTO.Create.Input = {
      name: '  João Silva  ',
      phoneNumber: '11987654321',
    };

    const result = await userUseCase.create(input);

    assert.ok(result.id, 'Usuário deve ser criado mesmo com espaços');
    assert.ok(result.name, 'Nome deve ser definido');
  });

  await t.test('deve retornar múltiplos usuários com telefones diferentes', async () => {
    const users = [
      { name: 'João Silva', phoneNumber: '11987654321' },
      { name: 'Maria Santos', phoneNumber: '21987654321' },
      { name: 'Carlos Oliveira', phoneNumber: '31987654321' },
    ];

    const results = [];
    for (const user of users) {
      const result = await userUseCase.create(user);
      results.push(result);
    }

    assert.strictEqual(
      userRepository.getUsersCount(),
      3,
      'Repositório deve ter 3 usuários armazenados',
    );
    assert.strictEqual(results.length, 3, 'Devem retornar 3 usuários criados');
  });

  await t.test('deve converter dados de entrada através do schema', async () => {
    const input: UserDTO.Create.Input = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const result = await userUseCase.create(input);

    // Validar que os dados foram processados corretamente pelo schema
    assert.strictEqual(typeof result.name, 'string', 'Nome deve ser string');
    assert.strictEqual(typeof result.phoneNumber, 'string', 'Telefone deve ser string');
    assert.strictEqual(typeof result.active, 'boolean', 'Active deve ser boolean');
  });
});
