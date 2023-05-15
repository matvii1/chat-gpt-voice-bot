import config from 'config'
import { createReadStream } from 'fs'
import { Configuration, OpenAIApi } from 'openai'
class openAi {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    })

    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages) {
    try {
      const res = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })

      return res.data.choices[0].message
    } catch (error) {}
  }

  async transcriptions(file) {
    try {
      const res = await this.openai.createTranscription(
        createReadStream(file),
        'whisper-1'
      )

      return res.data.text
    } catch (error) {}
  }
}

export const openAI = new openAi(config.get('OPEN_AI_KEY'))
