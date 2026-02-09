/**
 * Arquivo de teste para o DLF Review Agent.
 * Contém erros intencionais para o bot comentar nas linhas (Files changed).
 * Pode ser removido após validar o fluxo.
 */

// TODO: remover este arquivo depois do teste
import { useState, useEffect } from 'react';
import type { FC } from 'react'; // não usado — para o bot sinalizar

export function TestBotReview() {
  const [count, setCount] = useState(0);

  console.log('debug count', count);

  useEffect(() => {
    setCount((c) => c + 1);
  }, []);

  // comentário desnecessário na linha de cima
  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
}
