import xss from 'xss';
import zod from 'zod';

import { defaultSchema, idDefaultSchema } from '@/utils/globalSchema';

const id = idDefaultSchema('User');
const name = zod.string({ error: 'NAME is required' }).transform((value) => xss(value));
const phoneNumber = zod
  .string()
  .regex(/^\d+$/, { message: 'TELEFONE deve conter apenas números' })
  .min(10, { message: 'TELEFONE deve ter no mínimo 10 números' })
  .max(11, { message: 'TELEFONE deve ter no máximo 11 números' })
  .transform((value) => xss(value));
const active = zod.boolean();

export const createUserSchema = zod.object({
  name,
  phoneNumber,
});

export const userSchema = zod.object({
  id,
  ...createUserSchema,
  active,
  ...defaultSchema,
});
