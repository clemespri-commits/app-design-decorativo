import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeRoomImage(imageUrl: string, userRequest: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Você é um designer de interiores especializado. Analise esta imagem de ambiente e forneça sugestões de decoração baseadas no seguinte pedido do usuário: "${userRequest}".

Forneça uma resposta em JSON com a seguinte estrutura:
{
  "analysis": "Análise detalhada do ambiente atual",
  "suggestions": "Sugestões de decoração específicas",
  "items": [
    {
      "name": "Nome do item",
      "description": "Descrição detalhada",
      "category": "Categoria (móveis, iluminação, decoração, etc)",
      "estimatedPrice": "Preço estimado em reais",
      "priority": "alta/média/baixa"
    }
  ],
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "style": "Estilo sugerido (moderno, minimalista, industrial, etc)"
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Nenhuma resposta da IA')

    return JSON.parse(content)
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw error
  }
}

export async function generateDesignVariations(
  originalAnalysis: any,
  variation: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Baseado nesta análise de design: ${JSON.stringify(originalAnalysis)}, 
          crie uma variação com o tema: "${variation}".
          
          Retorne em JSON com a mesma estrutura da análise original.`,
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Nenhuma resposta da IA')

    return JSON.parse(content)
  } catch (error) {
    console.error('Erro ao gerar variações:', error)
    throw error
  }
}
