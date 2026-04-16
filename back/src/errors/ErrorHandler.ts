import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';
import { z } from 'zod';

import { AppError } from './AppError';

export function ErrorHandler(
  entity: string,
  error: Error | string | number | object | null | undefined,
  // counter?: boolean
): never {
  // if (counter) return 0;

  // Erro padrão caso nada mais se aplique
  const defaultError = AppError.internal('Erro desconhecido', {
    entity,
    original: error,
  });

  if (error == null) {
    throw defaultError;
  }

  // --- Erros do Prisma ---
  try {
    if (error instanceof PrismaClientValidationError) {
      // dados inválidos enviados ao Prisma
      throw AppError.badRequest('Dados inválidos', { entity, original: error });
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      throw AppError.internal('Erro ao validar os dados', {
        entity,
        original: error,
      });
    }

    if (error instanceof PrismaClientKnownRequestError) {
      // mapeamento por código do Prisma (ex.: P2002 = unique constraint)
      const code = (error as PrismaClientKnownRequestError).code as string | undefined;
      const meta = (error as PrismaClientKnownRequestError).meta;

      if (code === 'P2002') {
        throw AppError.conflict('Conflito no banco de dados (registro já existe)', {
          entity,
          code,
          meta,
        });
      }

      if (code === 'P2025') {
        throw AppError.notFound('Registro não encontrado', {
          entity,
          code,
          meta,
        });
      }

      // Erro conhecido, mas sem mapeamento específico
      throw new AppError(
        'Erro ao realizar a operação no banco de dados',
        500,
        code,
        { entity, meta },
        false,
      );
    }

    if (
      error instanceof PrismaClientInitializationError ||
      error instanceof PrismaClientRustPanicError
    ) {
      throw AppError.internal('Erro ao realizar a operação no banco de dados', {
        entity,
        original: error,
      });
    }
  } catch (prismaMapped) {
    // caso tenhamos lançado um AppError acima, repropagar
    if (prismaMapped instanceof AppError) throw prismaMapped;
    // se caiu aqui por algum motivo inesperado, seguir para tratamento genérico abaixo
  }

  if (error instanceof z.ZodError) {
    // Pega a primeira mensagem de erro
    const message = error.message;
    const details = {
      entity: entity,
      issues: error.issues, // 'issues' é a lista completa de erros do Zod
    };

    // Usa o helper estático do AppError que retorna 422
    throw AppError.validation(message, details);
  }

  // --- Tratamento genérico para Error / string / object / number ---
  if (error instanceof Error) {
    // se a mensagem for um JSON serializado com informações do erro, tentar extrair
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && parsed.message) {
        const status = parsed.status || 500;
        const code = parsed.code;
        const details = { ...parsed, entity };
        throw new AppError(parsed.message, status, code, details, parsed.isOperational ?? true);
      }
    } catch {
      // não era JSON -> segue
    }

    // Erro JS comum: considerar como erro interno por padrão
    throw new AppError(
      error.message || 'Erro',
      500,
      undefined,
      { entity, stack: error.stack },
      false,
    );
  }

  if (typeof error === 'string') {
    throw new AppError(error, 500, undefined, { entity }, false);
  }

  if (typeof error === 'number') {
    // número inesperado — transformar em erro interno com detalhe
    throw new AppError(String(error), 500, undefined, { entity, original: error }, false);
  }

  if (typeof error === 'object') {
    const jsonString = JSON.stringify(error);
    if (jsonString && jsonString !== '{}') {
      throw AppError.internal('Erro no objeto recebido', {
        entity,
        original: error,
      });
    }
  }

  // fallback
  throw defaultError;
}
