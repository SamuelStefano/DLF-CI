# Guia de Arquitetura Recomendada

Este CI foi otimizado para projetos **Next.js + TypeScript + Supabase** com foco em **componentização perfeita**.

## Estrutura de Pastas Recomendada

```
seu-projeto/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   └── dashboard/
│   └── api/
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes base (Button, Input, Card)
│   ├── forms/                   # Formulários específicos
│   ├── layouts/                 # Layouts (Header, Footer, Sidebar)
│   └── features/                # Componentes de features específicas
│
├── hooks/                        # Custom hooks
│   ├── use-user.ts
│   ├── use-supabase-query.ts
│   └── use-form-validation.ts
│
├── lib/                          # Utilitários e configurações
│   ├── supabase/
│   │   ├── client.ts            # Cliente Supabase
│   │   ├── queries.ts           # Queries do banco
│   │   └── mutations.ts         # Mutations do banco
│   ├── api/
│   │   └── client.ts            # Cliente HTTP (fetch wrapper)
│   └── utils/
│       └── format.ts            # Funções utilitárias
│
├── types/                        # Types e Interfaces
│   ├── database.types.ts        # Types gerados do Supabase
│   ├── user.types.ts
│   └── api.types.ts
│
├── constants/                    # Constantes
│   ├── routes.ts                # Rotas da aplicação
│   ├── api.ts                   # URLs de API
│   └── config.ts                # Configurações gerais
│
└── styles/
    └── globals.css
```

## Regras de Componentização

### 1. Um componente, uma responsabilidade

❌ **Ruim:**
```tsx
// UserProfile.tsx - 300 linhas
export function UserProfile() {
  const [user, setUser] = useState()
  const [posts, setPosts] = useState()
  const [followers, setFollowers] = useState()
  // ... muita lógica
  
  return (
    <div>
      {/* muito JSX */}
    </div>
  )
}
```

✅ **Bom:**
```tsx
// UserProfile.tsx - 50 linhas
export function UserProfile() {
  return (
    <div>
      <UserHeader />
      <UserPosts />
      <UserFollowers />
    </div>
  )
}

// components/user/UserHeader.tsx
// components/user/UserPosts.tsx
// components/user/UserFollowers.tsx
```

### 2. Extraia lógica para hooks customizados

❌ **Ruim:**
```tsx
export function UserDashboard() {
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data } = await supabase.from('users').select('*')
      setUser(data)
      setLoading(false)
    }
    fetchUser()
  }, [])
  
  // ...
}
```

✅ **Bom:**
```tsx
// hooks/use-user.ts
export function useUser(userId: string) {
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data } = await supabase.from('users').select('*').eq('id', userId)
      setUser(data)
      setLoading(false)
    }
    fetchUser()
  }, [userId])
  
  return { user, loading }
}

// UserDashboard.tsx
export function UserDashboard() {
  const { user, loading } = useUser(userId)
  // ...
}
```

### 3. Queries do Supabase em lib/

❌ **Ruim:**
```tsx
// Diretamente no componente
export function UserList() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    supabase.from('users').select('*').then(({ data }) => setUsers(data))
  }, [])
  
  // ...
}
```

✅ **Bom:**
```tsx
// lib/supabase/queries.ts
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// hooks/use-users.ts
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])
  
  return { users, loading }
}

// UserList.tsx
export function UserList() {
  const { users, loading } = useUsers()
  // ...
}
```

### 4. Types em arquivos separados

❌ **Ruim:**
```tsx
// UserCard.tsx
interface User {
  id: string
  name: string
  email: string
}

export function UserCard({ user }: { user: User }) {
  // ...
}
```

✅ **Bom:**
```tsx
// types/user.types.ts
export interface User {
  id: string
  name: string
  email: string
}

export interface UserWithPosts extends User {
  posts: Post[]
}

// UserCard.tsx
import type { User } from '@/types/user.types'

export function UserCard({ user }: { user: User }) {
  // ...
}
```

### 5. Constantes centralizadas

❌ **Ruim:**
```tsx
// Espalhadas pelo código
const API_URL = 'https://api.example.com'
const MAX_USERS = 100
const DEFAULT_AVATAR = '/images/avatar.png'
```

✅ **Bom:**
```tsx
// constants/api.ts
export const API_URL = 'https://api.example.com'
export const ENDPOINTS = {
  USERS: '/users',
  POSTS: '/posts',
} as const

// constants/config.ts
export const MAX_USERS = 100
export const DEFAULT_AVATAR = '/images/avatar.png'
export const PAGINATION_LIMIT = 20
```

### 6. Funções com muitos parâmetros → objeto de config

❌ **Ruim:**
```tsx
function createUser(
  name: string,
  email: string,
  age: number,
  city: string,
  country: string,
  newsletter: boolean
) {
  // ...
}

createUser('João', 'joao@email.com', 25, 'São Paulo', 'Brasil', true)
```

✅ **Bom:**
```tsx
interface CreateUserParams {
  name: string
  email: string
  age: number
  city: string
  country: string
  newsletter: boolean
}

function createUser(params: CreateUserParams) {
  // ...
}

createUser({
  name: 'João',
  email: 'joao@email.com',
  age: 25,
  city: 'São Paulo',
  country: 'Brasil',
  newsletter: true,
})
```

## O que o CI vai detectar

### ✅ Vai alertar quando:

1. **Componente com 5+ `useState`**
   - Sugestão: extrair para hook customizado ou dividir componente

2. **Função com 100+ linhas**
   - Sugestão: dividir em funções menores

3. **Query do Supabase no componente**
   - Sugestão: mover para `@/lib/supabase/queries.ts`

4. **Types inline**
   - Sugestão: mover para `@/types`

5. **3+ constantes em UPPER_CASE no mesmo arquivo**
   - Sugestão: mover para `@/constants`

6. **Função usando hooks mas não sendo um hook**
   - Sugestão: transformar em custom hook em `@/hooks`

7. **50+ linhas de JSX**
   - Sugestão: dividir em subcomponentes

8. **`fetch` direto no componente**
   - Sugestão: criar função em `@/lib/api`

9. **Uso de `<a>` ou `<img>` no Next.js**
   - Sugestão: usar `<Link>` e `<Image>`

10. **Função com 3+ parâmetros**
    - Sugestão: usar objeto de configuração

## Boas Práticas Next.js + Supabase

### Server Components (Next.js 14+)

```tsx
// app/dashboard/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server'
import { getUsers } from '@/lib/supabase/queries'

export default async function DashboardPage() {
  const users = await getUsers()
  
  return <UserList users={users} />
}
```

### Client Components

```tsx
// components/UserList.tsx
'use client'

import { useUsers } from '@/hooks/use-users'

export function UserList() {
  const { users, loading } = useUsers()
  
  if (loading) return <Loading />
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### Route Handlers (API Routes)

```tsx
// app/api/users/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { getUsers } from '@/lib/supabase/queries'

export async function GET() {
  try {
    const users = await getUsers()
    return Response.json({ users })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

## Resumo

O CI foi configurado para **forçar componentização perfeita**:
- Componentes pequenos e focados
- Lógica extraída para hooks
- Queries centralizadas em lib/
- Types organizados em types/
- Constantes em constants/
- Uso correto de Next.js (Link, Image, Script)

Siga essa estrutura e o CI vai te ajudar a manter o código organizado! 🚀
