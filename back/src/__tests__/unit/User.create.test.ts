import * as assert from 'node:assert';
import { test } from 'node:test';

import { User } from '@/domain/entities/User';

test('User.create() - Entidade', async (t) => {
  await t.test('deve criar um novo usuário com dados válidos', () => {
    const validData = {
      name: 'João Silva',
      phoneNumber: '11987654321',
    };

    const user = User.create(validData);

    assert.strictEqual(user.name, validData.name, 'Nome deve corresponder');
    assert.strictEqual(user.phoneNumber, validData.phoneNumber, 'Telefone deve corresponder');
    assert.strictEqual(user.active, true, 'Usuário deve estar ativo por padrão');
    assert.ok(user.id, 'ID deve ser gerado');
    assert.ok(user.createdAt, 'createdAt deve ser definido');
    assert.ok(user.updatedAt, 'updatedAt deve ser definido');
    assert.ok(user.createdAt instanceof Date, 'createdAt deve ser uma data');
    assert.ok(user.updatedAt instanceof Date, 'updatedAt deve ser uma data');
  });

  await t.test('deve gerar UUIDs únicos para cada usuário', () => {
    const data = {
      name: 'Maria Santos',
      phoneNumber: '11987654322',
    };

    const user1 = User.create(data);
    const user2 = User.create(data);

    assert.notStrictEqual(user1.id, user2.id, 'IDs devem ser únicos');
  });

  await t.test('deve definir datas corretas de criação', () => {
    const beforeCreate = new Date();
    const data = {
      name: 'Carlos Oliveira',
      phoneNumber: '11987654323',
    };

    const user = User.create(data);
    const afterCreate = new Date();

    assert.ok(
      user.createdAt.getTime() >= beforeCreate.getTime(),
      'createdAt deve ser >= beforeCreate',
    );
    assert.ok(
      user.createdAt.getTime() <= afterCreate.getTime(),
      'createdAt deve ser <= afterCreate',
    );
    assert.strictEqual(
      user.updatedAt.getTime(),
      user.createdAt.getTime(),
      'updatedAt deve ser igual a createdAt na criação',
    );
  });

  await t.test('deve retornar um objeto com método self', () => {
    const data = {
      name: 'Ana Costa',
      phoneNumber: '11987654324',
    };

    const user = User.create(data);
    const self = user.self;

    assert.strictEqual(self.name, data.name);
    assert.strictEqual(self.phoneNumber, data.phoneNumber);
    assert.strictEqual(self.active, true);
    assert.ok(self.id);
    assert.ok(self.createdAt);
    assert.ok(self.updatedAt);
  });

  await t.test('deve preservar todos os dados do usuário', () => {
    const data = {
      name: 'Fernando Lima',
      phoneNumber: '21987654321',
    };

    const user = User.create(data);
    const userData = user.self;

    assert.deepStrictEqual(
      {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        active: userData.active,
      },
      {
        name: data.name,
        phoneNumber: data.phoneNumber,
        active: true,
      },
    );
  });
});
