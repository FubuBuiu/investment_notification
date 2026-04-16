import xss from 'xss';
import zod from 'zod';

export const idDefaultSchema = (entity: string) =>
  zod
    .uuid({ message: `ID de ${entity.toLowerCase()} deve ser um UUID válido` })
    .transform((v) => xss(v));

export const defaultSchema = {
  createdAt: zod.date(),
  updatedAt: zod.date().optional(),
  //   deletedAt: zod.date().optional(),
};
