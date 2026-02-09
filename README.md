# DLF-CI — Seu Revisor de Código Automático

Um robô que revisa seus Pull Requests automaticamente, comenta nos erros **em português** e te ensina a melhorar.

Toda vez que você abrir um PR, ele analisa seu código e comenta direto nas linhas com problemas, como se fosse um professor revisando seu trabalho.

---

## Como instalar no seu projeto

### Passo 1 — Crie o arquivo do workflow

Crie o arquivo `.github/workflows/ci.yml` no seu projeto com este conteúdo:

```yaml
name: CI

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    uses: SamuelStefano/DLF-CI/.github/workflows/ci-reusable.yml@main
    secrets: inherit
```

**Pronto.** Isso é tudo que precisa. O bot vai baixar tudo sozinho do repositório DLF-CI.

### Passo 2 — Garanta que seu projeto tenha estes scripts

No `package.json` do seu projeto:

```json
{
  "scripts": {
    "lint": "eslint --config eslint.config.js .",
    "typecheck": "tsc --noEmit"
  }
}
```

### Passo 3 — Instale as dependências do ESLint

```bash
npm install -D eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks @next/eslint-plugin-next
```

### Passo 4 — Copie o `eslint.config.js`

Copie o arquivo `eslint.config.js` deste repositório para a raiz do seu projeto. Ele define as regras que o bot vai checar.

### Passo 5 — Commit e teste

```bash
git add .
git commit -m "setup: adicionar DLF Code Review Agent"
git push
```

Abra um PR e o bot vai rodar automaticamente.

---

## Como funciona?

Quando você abre um **Pull Request**, o bot faz 3 coisas:

### 1. Comenta direto nas linhas com problema

Ele vai na linha exata do erro em **Files changed** e deixa um comentário curto explicando o problema.

Exemplo:

> 🧹 **6 console(s) detectado(s)** — L76, L96, L112, L134, L147, L159
>
> Remova `console.*` antes de mergear. Em blocos catch, use **toast.error()** para feedback ao usuário.

### 2. Posta observações gerais na review

Problemas de "arquivo inteiro" (como tamanho, organização) vão no corpo da review, sem poluir as linhas:

> **Observações gerais:**
> - 📏 Arquivo com 292 linhas — nosso padrão é no máximo 200
> - 🏗️ Atomic Design — Este componente deveria estar em organisms/
> - 🪝 5 hooks de efeito/memo — Extraia para custom hooks

### 3. Bloqueia o merge se tiver erros graves

- **Erros** = merge bloqueado até corrigir
- **Avisos** = merge funciona, mas corrija
- **Sugestões** = opcional, são dicas para melhorar

---

## O que ele verifica?

### Código limpo
| O que ele olha | O que ele faz |
|----------------|---------------|
| Arquivo com mais de **200 linhas** | Pede para dividir |
| **Comentários** no código | Lista todos e pede para remover |
| **Código comentado** | Pede para remover (Git guarda histórico) |
| **TODO / FIXME** | Pede para resolver antes do merge |
| **console.log** | Pede para remover, sugere Toast |
| **Imports** não utilizados | Lista todos e pede para remover |

### Organização
| O que ele olha | O que ele faz |
|----------------|---------------|
| **Constante** com mais de 10 linhas | Sugere arquivo em `/consts` |
| Vários **componentes** no mesmo arquivo | Sugere separar |
| **Types/Interfaces** no componente | Sugere mover para `/interfaces` |
| Componente na pasta errada | Sugere atoms/molecules/organisms |

### Funções e hooks
| O que ele olha | O que ele faz |
|----------------|---------------|
| Função com mais de **30 linhas** | Sugere dividir |
| Handlers parecidos | Sugere abstrair |
| Muitos `useState` (4+) | Sugere custom hook |
| Hook fora de `/hooks` | Pede para mover |

### Next.js e Supabase
| O que ele olha | O que ele faz |
|----------------|---------------|
| `<a>` em vez de `<Link>` | Pede para trocar |
| `<img>` em vez de `<Image>` | Pede para trocar |
| Supabase no componente | Pede para mover para `/lib` |
| `fetch` no componente | Pede para centralizar |

---

## Estrutura de pastas esperada

```
seu-projeto/
├── components/
│   ├── atoms/          ← coisas simples: Button, Input
│   ├── molecules/      ← combinações: SearchBar, FormField
│   ├── organisms/      ← seções completas: Header, UserProfile
│   └── ui/             ← design system
├── hooks/              ← custom hooks
├── interfaces/         ← types e interfaces
├── consts/             ← constantes
├── lib/
│   ├── supabase/       ← funções de banco
│   └── api/            ← funções de API
└── app/                ← páginas do Next.js
```

---

## Personalização

### Mudar os limites

Não é necessário copiar os scripts de checagem — eles ficam neste repositório e são baixados automaticamente. Se quiser personalizar os limites, copie a pasta `.github/workflows/checks/` para o seu repo. O bot usa os arquivos locais quando existem.

### Mais opções

Veja o **[CUSTOMIZATION.md](CUSTOMIZATION.md)** para ajustar regras do ESLint.

---

## Para o futuro: GitHub Team

Com o **GitHub Team** ($4/usuário/mês), você pode configurar **Required Workflows** no nível da organização. Isso faz o bot rodar automaticamente em **todos os repositórios** sem ninguém precisar criar nenhum arquivo. Configuração zero por repo.

---

## Problemas comuns

### "O bot não está comentando no meu PR"

1. Verifique se `.github/workflows/ci.yml` está commitado
2. Verifique se `package-lock.json` está commitado
3. Vá em **Actions** no GitHub e veja os logs

### "O CI passa mas eu sei que tem erros"

- Avisos não bloqueiam o CI, só comentam
- Apenas erros fazem o CI falhar

---

<sub>🤖 DLF Code Review Agent v2.0</sub>
