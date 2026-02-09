'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type User = {
  id: string
  name: string
  email: string
  avatar_url: string
  role: 'admin' | 'student' | 'teacher'
  created_at: string
}

type Post = {
  id: string
  title: string
  content: string
  author_id: string
  likes: number
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  activeToday: number
  revenue: number
}

const ITEMS_PER_PAGE = 10
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_AVATAR = '/images/default-avatar.png'
const ALLOWED_ROLES = ['admin', 'student', 'teacher']
const CACHE_DURATION = 1000 * 60 * 5
const ANIMATION_DURATION = 0.3

export function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTab, setSelectedTab] = useState<'posts' | 'users' | 'stats'>('posts')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .single()

        if (error) throw error
        setUser(data)
      } catch (err) {
        console.error('Erro ao buscar usuário:', err)
        setError('Não foi possível carregar seus dados')
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

        if (error) throw error
        setPosts(data || [])
      } catch (err) {
        console.log('Erro nos posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [currentPage])

  // Buscar estatísticas
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`)
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.log('Stats error:', err)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/notifications`)
        .then(res => res.json())
        .then(data => setNotifications(data))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDeletePost = async (postId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.rpc('increment_likes', { post_id: postId })
      if (error) throw error
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    } catch (err) {
      console.error('Like failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (name: string, email: string, avatar: string) => {
    try {
      const { error } = await supabase.from('users').update({ name, email, avatar_url: avatar }).eq('id', user?.id)
      if (error) throw error
      setUser(prev => prev ? { ...prev, name, email, avatar_url: avatar } : null)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [posts, searchTerm])

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user?.avatar_url || DEFAULT_AVATAR} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-lg font-semibold">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <nav className="flex gap-4">
            <button onClick={() => setSelectedTab('posts')} className={selectedTab === 'posts' ? 'font-bold' : ''}>Posts</button>
            <button onClick={() => setSelectedTab('users')} className={selectedTab === 'users' ? 'font-bold' : ''}>Usuários</button>
            <button onClick={() => setSelectedTab('stats')} className={selectedTab === 'stats' ? 'font-bold' : ''}>Estatísticas</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Usuários</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Ativos Hoje</p>
              <p className="text-2xl font-bold">{stats.activeToday}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Receita</p>
              <p className="text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <span className="text-sm text-gray-400">
                  {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  ❤️ {post.likes}
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">Página {currentPage}</span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 border rounded"
          >
            Próxima
          </button>
        </div>
      </main>
    </div>
  )
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
