'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { analyzeRoomImage } from '@/lib/openai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Camera, Loader2, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NewProjectViewProps {
  userId: string
  onProjectCreated: () => void
}

export default function NewProjectView({ userId, onProjectCreated }: NewProjectViewProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    try {
      setIsUploading(true)

      // Upload da imagem para o Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName)

      setIsUploading(false)
      setIsAnalyzing(true)

      // Criar projeto no banco
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title,
          description,
          original_image_url: publicUrl,
          status: 'analyzing',
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Analisar imagem com OpenAI
      const analysis = await analyzeRoomImage(publicUrl, description || 'Sugestões gerais de decoração')

      // Atualizar projeto com análise
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          analyzed_data: analysis,
          status: 'completed',
        })
        .eq('id', project.id)

      if (updateError) throw updateError

      // Criar sugestão de design
      const { data: suggestion, error: suggestionError } = await supabase
        .from('design_suggestions')
        .insert({
          project_id: project.id,
          suggestion_text: analysis.suggestions,
          items: analysis.items || [],
        })
        .select()
        .single()

      if (suggestionError) throw suggestionError

      // Criar itens de decoração
      if (analysis.items && analysis.items.length > 0) {
        const items = analysis.items.map((item: any) => ({
          suggestion_id: suggestion.id,
          name: item.name,
          description: item.description,
          category: item.category,
          estimated_price: parseFloat(item.estimatedPrice) || null,
        }))

        const { error: itemsError } = await supabase
          .from('decoration_items')
          .insert(items)

        if (itemsError) throw itemsError
      }

      toast.success('Projeto criado e analisado com sucesso!')
      onProjectCreated()
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error)
      toast.error(error.message || 'Erro ao criar projeto')
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Novo Projeto de Design
          </CardTitle>
          <CardDescription>
            Faça upload de uma foto do ambiente e descreva o que você deseja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Foto do Ambiente</Label>
              
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG ou WEBP (máx. 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute top-2 right-2"
                  >
                    Trocar imagem
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Projeto</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Sala de estar moderna"
                  required
                  disabled={isUploading || isAnalyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">O que você deseja? (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ex: Quero um ambiente mais aconchegante com tons neutros e iluminação suave..."
                  rows={4}
                  disabled={isUploading || isAnalyzing}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
              disabled={!imageFile || isUploading || isAnalyzing}
            >
              {isUploading && (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Fazendo upload...
                </>
              )}
              {isAnalyzing && (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              )}
              {!isUploading && !isAnalyzing && (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Criar e Analisar Projeto
                </>
              )}
            </Button>

            {/* Progress Indicator */}
            {(isUploading || isAnalyzing) && (
              <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isUploading ? 'Fazendo upload da imagem...' : 'Upload concluído'}
                  </span>
                </div>
                
                {isAnalyzing && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <span className="text-sm font-medium">
                      Analisando ambiente com IA...
                    </span>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
