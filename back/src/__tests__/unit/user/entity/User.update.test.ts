import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { User } from '@/domain/entities/User';
import { UserModel } from '@/generated/prisma/models';

test('User.update() - Entity', async (t) => {
  let user: User;

  t.beforeEach(() => {
    user = new User({
      id: randomUUID(),
      name: 'João Silva',
      phoneNumber: '11987654321',
      active: true,
      createdAt: new Date('2026-04-16T19:00:00.621Z'), // 16/04/2026 - 16:00
      updatedAt: new Date('2026-04-16T19:00:00.621Z'), // 16/04/2026 - 16:00
    });
  });

  await t.test('should update only one property', () => {
    const oldUser = user.self;
    const newPhoneNumber = '79999995555';
    const updatedUser = user.update({ phoneNumber: newPhoneNumber }).self;

    assert.notStrictEqual(
      oldUser.phoneNumber,
      newPhoneNumber,
      'phoneNumber should not be the same',
    );
    assert.strictEqual(updatedUser.phoneNumber, newPhoneNumber, 'phoneNumber should be the same');
    assert.deepStrictEqual<Omit<UserModel, 'phoneNumber' | 'updatedAt'>>(
      {
        id: oldUser.id,
        name: oldUser.name,
        active: oldUser.active,
        createdAt: oldUser.createdAt,
      },
      {
        id: updatedUser.id,
        name: updatedUser.name,
        active: updatedUser.active,
        createdAt: updatedUser.createdAt,
      },
      'the remaining data should be the same',
    );
  });

  await t.test('should update multiple properties', () => {
    const oldUser = user.self;
    const dataToUpdate: Partial<UserModel> = { name: 'Juliana Fontes', phoneNumber: '79988858631' };
    const updatedUser = user.update(dataToUpdate).self;

    assert.notDeepStrictEqual(
      {
        name: oldUser.name,
        phoneNumber: oldUser.phoneNumber,
      },
      {
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
      },
      'name and phoneNumber should not be the same',
    );
    assert.deepStrictEqual(
      { phoneNumber: updatedUser.phoneNumber, name: updatedUser.name },
      { phoneNumber: dataToUpdate.phoneNumber, name: dataToUpdate.name },
      'name and phoneNumber should be the same',
    );
    assert.deepStrictEqual<Omit<UserModel, 'phoneNumber' | 'name' | 'updatedAt'>>(
      {
        id: oldUser.id,
        active: oldUser.active,
        createdAt: oldUser.createdAt,
      },
      {
        id: updatedUser.id,
        active: updatedUser.active,
        createdAt: updatedUser.createdAt,
      },
      'the remaining data should be the same',
    );
  });

  await t.test(
    'updatedAt property of the new instance must be later (more recent) than the date of the original instance',
    () => {
      const updatedUser = user.update({ name: 'Novo Nome' });

      assert.ok(
        updatedUser.updatedAt > user.updatedAt,
        'updatedUser.updatedAt is greater than user.updatedAt',
      );
    },
  );

  await t.test(
    'should return a new instance of User, without modifying the previous instance',
    () => {
      const updatedName = 'Updated Name';
      const updatedUser = user.update({ name: updatedName });

      assert.ok(user instanceof User, 'user is a instance of User');
      assert.ok(updatedUser instanceof User, 'updated user is a instance of User');
      assert.strictEqual(
        updatedUser.name,
        updatedName,
        'name for the new instance has been updated',
      );
      assert.strictEqual(user.name, 'João Silva', 'the original instance has not been changed');
      assert.notStrictEqual(user, updatedUser, 'updated user is a new instance of User');
    },
  );
});
