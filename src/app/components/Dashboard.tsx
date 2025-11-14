'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Home, 
  Upload, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import ProjectsView from './ProjectsView'
import NewProjectView from './NewProjectView'
import StatsView from './StatsView'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalSavings: 0,
  })

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const loadStats = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const completed = projects?.filter(p => p.status === 'completed').length || 0

      setStats({
        totalProjects: projects?.length || 0,
        completedProjects: completed,
        totalSavings: 0, // Será calculado com base nos itens salvos
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Design for U
                </h1>
                <p className="text-xs text-muted-foreground">Seu assistente de design</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Projeto
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getInitials(profile?.full_name || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Início</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ambientes analisados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.completedProjects}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projetos finalizados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    R$ {stats.totalSavings.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Com comparação de preços
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Comece um novo projeto</CardTitle>
                <CardDescription>
                  Tire uma foto do seu ambiente e deixe a IA criar sugestões personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setActiveTab('new')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Criar Novo Projeto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Project Tab */}
          <TabsContent value="new">
            <NewProjectView userId={user.id} onProjectCreated={() => setActiveTab('projects')} />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <ProjectsView userId={user.id} />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <StatsView userId={user.id} stats={stats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
