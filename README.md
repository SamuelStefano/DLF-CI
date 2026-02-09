# DLF-CI — Seu Revisor de Código Automático

Um robô que revisa seus Pull Requests automaticamente, comenta nos erros **em português** e te ensina a melhorar.

Toda vez que você abrir um PR, ele analisa seu código e comenta direto nas linhas com problemas, como se fosse um professor revisando seu trabalho.

---

## Como instalar no seu projeto

Siga os passos abaixo **na ordem**. Se já tem algum dos arquivos, pule o passo.

### Passo 1 — Copie os arquivos do bot

Na raiz do seu projeto, crie a pasta `.github/workflows/` (se não existir) e copie estes arquivos para dentro dela:

```
.github/
  workflows/
    ci.yml                       ← o workflow que roda no GitHub
    architecture-check.js        ← o motor de análise de arquitetura
    checks/                      ← módulos de checagem (pasta inteira)
      helpers.js
      check-comments.js
      check-code-quality.js
      check-organization.js
      check-functions.js
      check-hooks.js
      check-api.js
```

Você encontra todos esses arquivos neste repositório. Copie a pasta `.github/` inteira.

### Passo 2 — Adicione os scripts no seu `package.json`

Abra o `package.json` do seu projeto e garanta que tenha estes dois scripts:

```json
{
  "scripts": {
    "lint": "eslint --config eslint.config.js .",
    "typecheck": "tsc --noEmit"
  }
}
```

Se o seu `package.json` já tem outros scripts, só adicione esses dois dentro do `"scripts"`.

### Passo 3 — Instale as dependências

Rode este comando no terminal, dentro da pasta do seu projeto:

```bash
npm install -D eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks @next/eslint-plugin-next
```

Isso instala as ferramentas que o bot precisa para analisar seu código.

### Passo 4 — Copie o arquivo de configuração do ESLint

Copie o arquivo `eslint.config.js` deste repositório para a raiz do seu projeto.

Esse arquivo diz para o ESLint **quais regras** seguir (ex: "avise quando um arquivo tiver mais de 200 linhas").

### Passo 5 — Verifique seu `tsconfig.json`

Se seu projeto já tem um `tsconfig.json`, não precisa mexer. Se não tem, crie na raiz com este conteúdo:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Passo 6 — Commit e teste

```bash
git add .
git commit -m "setup: adicionar DLF Code Review Agent"
git push
```

Agora abra um Pull Request. O bot vai rodar automaticamente e comentar nos erros.

### Passo 7 — Rode local antes de fazer push (opcional, mas recomendado)

Para ver os erros antes de subir o código:

```bash
npm run lint        # mostra erros de código
npm run typecheck   # mostra erros de tipo
```

---

## E agora? O que esse bot faz exatamente?

Quando você abre um **Pull Request**, o bot faz 3 coisas:

### 1. Comenta direto nas linhas com problema

Ele vai na linha exata do erro e deixa um comentário explicando o que está errado e como corrigir.

Exemplo — em vez de uma mensagem confusa em inglês como:

> `'resultado' is defined but never used.`

O bot comenta assim:

> 🧹 **Import/variável não utilizada**: `resultado` foi declarada mas nunca é usada.
>
> 💡 **Dica**: Imports sem uso aumentam o tamanho do app. Remova ou adicione `_` no início se for intencional.

### 2. Posta um resumo geral no PR

No final, ele posta um comentário com a visão geral de tudo que encontrou:

> ## 🤖 DLF Code Review Agent
>
> Olá! Analisei seu PR e aqui está o resumo:
>
> | Categoria | Quantidade | Status |
> |-----------|:----------:|:------:|
> | 🚫 Erros | 2 | Bloqueia merge |
> | ⚠️ Avisos | 5 | Corrigir recomendado |
> | 💡 Sugestões | 8 | Opcional |
>
> **Dicas:**
> 1. Código limpo não precisa de comentários! Use nomes descritivos.
> 2. Substitua `console.log` por Toast para dar feedback ao usuário.

Se o PR estiver perfeito:

> ✅ **PR impecável! Parabéns!** Nenhum problema encontrado. Continue assim! 💪

### 3. Bloqueia o merge se tiver erros graves

- **Erros** (🚫) = o merge é bloqueado até corrigir
- **Avisos** (⚠️) = o merge funciona, mas é bom corrigir
- **Sugestões** (💡) = são dicas para você melhorar, não bloqueiam nada

---

## O que ele verifica?

### Código limpo

| O que ele olha | O que ele faz |
|----------------|---------------|
| Arquivo com mais de **200 linhas** | Pede para dividir em arquivos menores |
| **Comentários** no código | Avisa que o código deve se explicar sozinho |
| **Código comentado** (código que você "desligou" com `//`) | Pede para remover — o Git já guarda o histórico |
| **TODO / FIXME** | Pede para resolver antes do merge |
| **console.log** | Pede para remover e sugere usar **Toast** |
| **Imports** que você não está usando | Pede para remover |

### Organização dos arquivos

| O que ele olha | O que ele faz |
|----------------|---------------|
| **Constante** com mais de 10 linhas | Sugere colocar em arquivo próprio na pasta `/consts` |
| Vários **componentes** no mesmo arquivo | Sugere separar (1 arquivo = 1 componente) |
| **Types/Interfaces** dentro do componente | Sugere mover para pasta `/interfaces` ou `/types` |
| Componente na pasta errada | Sugere organizar em `atoms/`, `molecules/` ou `organisms/` |

### Funções e hooks

| O que ele olha | O que ele faz |
|----------------|---------------|
| Função com mais de **30 linhas** | Sugere dividir em funções menores |
| Funções parecidas (ex: vários handlers iguais) | Sugere criar uma função genérica |
| Muitos `useState` (4+) | Sugere criar um custom hook |
| Hook customizado fora da pasta `/hooks` | Pede para mover |

### Next.js e Supabase

| O que ele olha | O que ele faz |
|----------------|---------------|
| Usar `<a>` em vez de `<Link>` | Pede para trocar (Next.js é mais rápido com `<Link>`) |
| Usar `<img>` em vez de `<Image>` | Pede para trocar (Next.js otimiza imagens) |
| Query do **Supabase** dentro do componente | Pede para mover para `/lib/supabase` |
| **fetch** dentro do componente | Pede para centralizar em `/lib/api` |

---

## Estrutura de pastas que o bot espera

O bot foi feito para projetos organizados assim:

```
seu-projeto/
├── components/
│   ├── atoms/          ← coisas simples: Button, Input, Badge
│   ├── molecules/      ← combinações: SearchBar, FormField
│   ├── organisms/      ← seções completas: Header, UserProfile
│   └── ui/             ← componentes do design system
├── hooks/              ← custom hooks (useAlgumaCoisa)
├── interfaces/         ← types e interfaces do TypeScript
├── consts/             ← constantes do projeto
├── lib/
│   ├── supabase/       ← funções de banco de dados
│   └── api/            ← funções de API
└── app/                ← páginas do Next.js
```

Não precisa ter todas essas pastas desde o início. O bot sugere quando criar cada uma conforme seu projeto cresce.

---

## Personalização

### Mudar os limites

Se quiser mudar, por exemplo, o máximo de linhas por arquivo, edite o arquivo `.github/workflows/checks/helpers.js`:

```js
const CONFIG = {
  MAX_FILE_LINES: 200,       // máximo de linhas por arquivo
  MAX_CONSTANT_LINES: 10,    // constante acima disso vira arquivo próprio
  MAX_FUNCTION_LINES: 30,    // função acima disso deve ser dividida
  MAX_JSX_LINES: 50,         // JSX acima disso vira subcomponente
  MAX_USESTATE_COUNT: 4,     // useState acima disso vira custom hook
  MAX_PARAMS: 3,             // parâmetros acima disso vira objeto
};
```

### Desligar alguma checagem

Abra o `.github/workflows/architecture-check.js` e comente a linha que não quer:

```js
// issues.push(...checkComments(filePath, lines));  ← isso desliga a checagem de comentários
```

### Mais opções

Veja o **[CUSTOMIZATION.md](CUSTOMIZATION.md)** para:
- Tornar avisos em erros (que bloqueiam o merge)
- Desabilitar regras do ESLint
- Configurar para projetos sem React
- Adicionar Prettier

---

## Problemas comuns

### "O bot não está comentando no meu PR"

1. Verifique se os arquivos do `.github/workflows/` foram commitados
2. Verifique se o `package-lock.json` está commitado (rode `npm install` se não tiver)
3. Vá em **Actions** no GitHub e veja se o workflow rodou — clique nele para ver os logs

### "O CI passa mas eu sei que tem erros"

- **Avisos** (⚠️) não bloqueiam o CI, só comentam
- Apenas **erros** (🚫) fazem o CI falhar
- Rode `npm run lint` no seu computador para ver tudo

### "Funciona local mas não no CI"

- O `eslint.config.js` está commitado?
- Todas as dependências estão no `package.json`?
- O `package-lock.json` está commitado?

---

## Arquivos deste repositório

| Arquivo | Para que serve |
|---------|---------------|
| `.github/workflows/ci.yml` | O workflow que roda no GitHub a cada PR |
| `.github/workflows/architecture-check.js` | O motor principal que importa todas as checagens |
| `.github/workflows/checks/` | Os módulos de checagem (um para cada tipo) |
| `eslint.config.js` | As regras do ESLint (o que é erro, o que é aviso) |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Guia para personalizar regras e limites |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Guia sobre como organizar seu projeto |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de mudanças |

---

<sub>🤖 DLF Code Review Agent v2.0</sub>
