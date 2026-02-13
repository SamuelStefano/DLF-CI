/**
 * Arquivo de teste para o DLF Code Review Bot.
 * Contém erros intencionais para validar comentários na review.
 */

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from 'next/router'; // import não utilizado

// Comentário no código — o bot deve sugerir remoção
const TITULO = 'Teste Bot';

// TODO: remover antes de merge
export function TestBotDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [active, setActive] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    console.log('Montou', count);
  }, [count]);

  const handleClick = () => {
    setCount((c) => c + 1);
    console.log('click', count);
  };

  return (
    <div>
      <h1>{TITULO}</h1>
      <p>Cliques: {count}</p>
      <button onClick={handleClick}>+1</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {/* outro comentário inline */}
    </div>
  );
}

// Segundo componente no mesmo arquivo (atomic design: 1 por arquivo)
function Aux() {
  return <span>Aux</span>;
}
