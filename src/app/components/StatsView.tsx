'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, FolderOpen, CheckCircle, DollarSign } from 'lucide-react'

interface StatsViewProps {
  userId: string
  stats: {
    totalProjects: number
    completedProjects: number
    totalSavings: number
  }
}

export default function StatsView({ stats }: StatsViewProps) {
  const completionRate = stats.totalProjects > 0 
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estatísticas</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu progresso e economia
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-600" />
              Projetos
            </CardTitle>
            <CardDescription>Visão geral dos seus projetos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de projetos</span>
              <span className="text-2xl font-bold">{stats.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Concluídos</span>
              <span className="text-2xl font-bold text-green-600">{stats.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa de conclusão</span>
              <span className="text-2xl font-bold text-purple-600">{completionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Economia
            </CardTitle>
            <CardDescription>Quanto você economizou</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Economia total</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {stats.totalSavings.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Média por projeto</span>
              <span className="text-xl font-bold">
                R$ {stats.totalProjects > 0 
                  ? (stats.totalSavings / stats.totalProjects).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Progresso
          </CardTitle>
          <CardDescription>Seu crescimento ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Taxa de conclusão</span>
                <span className="text-sm text-muted-foreground">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {stats.totalProjects > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalProjects - stats.completedProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">Em andamento</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stats.totalProjects === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comece agora!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Crie seu primeiro projeto para começar a acompanhar suas estatísticas e economia.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
