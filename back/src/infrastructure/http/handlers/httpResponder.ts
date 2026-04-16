// statusHandler.ts
import { Response } from 'express';
import { z } from 'zod';

import { AppError } from '@/errors/AppError';
import { ErrorHandler } from '@/errors/ErrorHandler';

/** Props usadas internamente por StatusHandle */
type StatusHandleProps = {
  data?: unknown;
  message?: string;
  status?: number;
  totalCount?: number;
  //   extra?: unknown;
};

/** Converte/stringifica de forma segura para objeto (quando possível) */
function safeToObject(input: unknown): any {
  if (input == null) return input;
  if (typeof input === 'object') return input;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch {
      return { message: input };
    }
  }
  return { message: String(input) };
}

/** Checa se é um AppError-like (tem statusCode e message) */
function isAppErrorLike(v: any): v is AppError {
  return (
    v instanceof AppError ||
    (v && typeof v.statusCode === 'number' && typeof v.message === 'string')
  );
}

/**
 * StatusHandle (INTERNAL) - centraliza as respostas HTTP baseadas no resultado.
 * Não exportado: funciona apenas como implementação para Ok/Created/ErrorResponse.
 */
function StatusHandle(res: Response, result: StatusHandleProps): Response {
  const data = result.data;

  // TypeError grave => 500
  if (data instanceof TypeError) {
    return res.status(500).json({ message: 'Erro interno', data: data.message });
  }

  // ZodError direto
  if (data instanceof z.ZodError) {
    const first = data.issues?.[0];
    const message = first ? first.message : data.message;
    return res.status(result.status ?? 400).json({ message, data: data.issues });
  }

  // AppError / Error / outras estruturas de erro
  if (data instanceof Error || isAppErrorLike(data)) {
    let responseMessage: any;

    if (isAppErrorLike(data)) {
      const appErr = data as AppError;
      responseMessage = {
        message: appErr.message,
        status: appErr.statusCode ?? result.status ?? 500,
        code: appErr.code,
        details: appErr.details,
        isOperational: appErr.isOperational,
      };
    } else {
      // Erro JS normal: tentar parsear mensagem se for JSON
      try {
        const parsed = JSON.parse((data as Error).message || '');
        responseMessage = safeToObject(parsed);
      } catch {
        responseMessage = {
          message: (data as Error).message || 'Erro',
          status: result.status ?? 500,
        };
      }
    }

    // nível crítico -> mascarar mensagem
    if (responseMessage && responseMessage.level === 'critical') {
      return res.status(500).json({
        ...responseMessage,
        message: 'Erro crítico, entre em contato com o administrador',
      });
    }

    // garantir status numérico
    if (typeof responseMessage.status !== 'number') {
      responseMessage.status = result.status ?? 500;
    }

    return res.status(responseMessage.status).json(responseMessage);
  }

  // Array vazio => 200 com mensagem de "Nenhum dado encontrado"
  if (Array.isArray(data) && data.length === 0) {
    return res.status(result.status ?? 200).json({
      message: result.message ?? 'Nenhum dado encontrado',
      data: result.data ?? [],
      totalCount: result.totalCount,
      //       extra: result.extra,
    });
  }

  // Caso normal (sucesso)
  return res.status(result.status ?? 200).json({
    message: result.message ?? 'OK',
    data: result.data,
    totalCount: result.totalCount,
    //     extra: result.extra,
  });
}

/**
 * ErrorResponse - wrapper que normaliza o erro com ErrorHandler (se entity informado)
 * e delega para StatusHandle.
 *
 * Uso: ErrorResponse(res, error, 'User')
 */
export function ErrorResponse(res: Response, error: any, entity?: string): Response {
  if (entity) {
    try {
      // ErrorHandler sempre lança um AppError padronizado; capturamos no catch abaixo
      ErrorHandler(entity, error);
      // se por acaso não lançar, apenas delega
      return StatusHandle(res, { data: error });
    } catch (mapped) {
      // mapped deve ser um AppError (lançado por ErrorHandler)
      return StatusHandle(res, { data: mapped as AppError });
    }
  }

  // sem entity: apenas delega ao StatusHandle
  return StatusHandle(res, { data: error });
}

/** Conveniências para respostas de sucesso */
export function Ok(
  res: Response,
  data?: Omit<StatusHandleProps, 'status'>,
  message?: string,
): Response {
  return StatusHandle(res, {
    message: message ?? 'Sucesso',
    status: 200,
    ...data,
  });
}

export function Created(
  res: Response,
  data?: Omit<StatusHandleProps, 'status'>,
  message?: string,
): Response {
  return StatusHandle(res, {
    message: message ?? 'Criado com sucesso',
    status: 201,
    ...data,
  });
}
