'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FolderOpen, 
  Calendar, 
  Sparkles, 
  Eye,
  Loader2,
  Image as ImageIcon,
  Package
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProjectsViewProps {
  userId: string
}

interface Project {
  id: string
  title: string
  description: string | null
  original_image_url: string
  analyzed_data: any
  status: 'draft' | 'analyzing' | 'completed'
  created_at: string
}

export default function ProjectsView({ userId }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
  }, [userId])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
      analyzing: { label: 'Analisando', className: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
    }

    const variant = variants[status] || variants.draft

    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Comece criando seu primeiro projeto de design. Tire uma foto do ambiente e deixe a IA fazer a mágica!
          </p>
        </CardContent>
      </Card>
    )
  }

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedProject(null)}
          className="mb-4"
        >
          ← Voltar para projetos
        </Button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{selectedProject.title}</CardTitle>
                <CardDescription>{selectedProject.description}</CardDescription>
              </div>
              {getStatusBadge(selectedProject.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imagem Original */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagem Original
              </h3>
              <img
                src={selectedProject.original_image_url}
                alt={selectedProject.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <Separator />

            {/* Análise da IA */}
            {selectedProject.analyzed_data && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Análise da IA
                </h3>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm">{selectedProject.analyzed_data.analysis}</p>
                </div>

                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Sugestões</h4>
                  <p className="text-sm">{selectedProject.analyzed_data.suggestions}</p>
                </div>

                {selectedProject.analyzed_data.style && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Estilo Recomendado</h4>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {selectedProject.analyzed_data.style}
                    </Badge>
                  </div>
                )}

                {selectedProject.analyzed_data.colorPalette && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Paleta de Cores</h4>
                    <div className="flex gap-2">
                      {selectedProject.analyzed_data.colorPalette.map((color: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.analyzed_data.items && selectedProject.analyzed_data.items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Itens Recomendados
                    </h4>
                    <div className="grid gap-3">
                      {selectedProject.analyzed_data.items.map((item: any, idx: number) => (
                        <Card key={idx} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold">{item.name}</h5>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-purple-600">
                                ~R$ {item.estimatedPrice}
                              </span>
                              <Badge 
                                className={
                                  item.priority === 'alta' 
                                    ? 'bg-red-100 text-red-700'
                                    : item.priority === 'média'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }
                              >
                                Prioridade {item.priority}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meus Projetos</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} criados
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer group"
            onClick={() => setSelectedProject(project)}
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={project.original_image_url}
                alt={project.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(project.status)}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description || 'Sem descrição'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(project.created_at), "dd 'de' MMM", { locale: ptBR })}
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
