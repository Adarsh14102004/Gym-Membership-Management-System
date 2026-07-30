const Anthropic = require('@anthropic-ai/sdk')

const MODEL = process.env.AI_MODEL || 'claude-opus-5'

let client = null
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

const unavailableError = () => {
  const error = new Error('AI service is not configured')
  error.statusCode = 503
  return error
}

const refusalError = () => {
  const error = new Error('The AI assistant could not process this request. Please rephrase and try again.')
  error.statusCode = 422
  return error
}

const askJson = async ({ system, prompt, schema }) => {
  const anthropic = getClient()
  if (!anthropic) throw unavailableError()

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  })

  if (response.stop_reason === 'refusal') throw refusalError()

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock ? JSON.parse(textBlock.text) : null
}

const askText = async ({ system, messages }) => {
  const anthropic = getClient()
  if (!anthropic) throw unavailableError()

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    output_config: { effort: 'low' },
    messages,
  })

  if (response.stop_reason === 'refusal') throw refusalError()

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock ? textBlock.text : ''
}

module.exports = { askJson, askText, MODEL }
