export const Util = {
  isDefined<T>(value: T): value is Exclude<T, null | undefined | ''> {
    return value !== null && value !== undefined && value !== '';
  },
  updateIfChanged<T extends Record<string, any>>(newData: Partial<T>, oldData: T): Partial<T> {
    const updateFields: Partial<T> = {};

    // Iteramos sobre todas as chaves do objeto com os dados novos.
    for (const key in newData) {
      const valorNovo = newData[key];
      const valorAntigo = oldData[key];
      // Se o valor novo for undefined, geralmente ignoramos no PATCH,
      // a menos que o valor antigo fosse algo definido (intenção de limpeza).
      // NOTA: Em muitas APIs, campos ausentes no PATCH/PUT/newData não são alterados.
      // Se o campo está presente em newData mas é undefined, ele será processado.

      // 1. O valor é diferente?
      if (valorNovo !== valorAntigo) {
        // 2. Casos de Primitivos, Array, null/undefined:

        // a) Intenção de Limpar/Remover (valorNovo é explicitamente null)
        if (valorNovo === null && valorAntigo !== null) {
          // Se o valor era algo, e o novo valor é NULL, é uma mudança para NULL.
          updateFields[key as keyof T] = valorNovo;
          continue;
        }
        // b) Mudança de valor (Adicionar/Modificar)
        // Se o valor é diferente (incluindo undefined -> valorNovo)
        // e não é undefined (o que geralmente significa que o cliente não enviou o campo)
        if (valorNovo !== undefined) {
          updateFields[key as keyof T] = valorNovo;
        }
        // c) Tratamento de Arrays/Objetos complexos (requer stringify para comparação de valor)
        // Nota: Para Array/Objetos onde a referência de memória pode ter mudado
        if ((Array.isArray(valorNovo) || typeof valorNovo === 'object') && valorNovo !== null) {
          if (JSON.stringify(valorNovo) !== JSON.stringify(valorAntigo)) {
            updateFields[key as keyof T] = valorNovo;
          }
        }
      }
    }

    return updateFields;
  },
};
