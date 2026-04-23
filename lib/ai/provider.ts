import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import type { LanguageModel } from 'ai'

export async function createProviderWithFallback(): Promise<{ model: LanguageModel; provider: string }> {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (googleKey) {
    try {
      const google = createGoogleGenerativeAI({ apiKey: googleKey })
      return { model: google('gemini-2.0-flash') as LanguageModel, provider: 'google' }
    } catch {
      console.warn('[AI] Google provider failed, falling back to Groq')
    }
  }

  if (groqKey) {
    const groq = createGroq({ apiKey: groqKey })
    return { model: groq('llama-3.3-70b-versatile') as LanguageModel, provider: 'groq' }
  }

  throw new Error('No AI provider configured. Set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY.')
}
