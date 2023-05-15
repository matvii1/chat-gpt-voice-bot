import config from 'config'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { ogg } from './ogg.js'
import { openAI } from './openai.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

const INITIAL_SESSION = {
  messages: [],
}

bot.use(session())

bot.command('new', async (context) => {
  context.session = INITIAL_SESSION

  await context.reply('Watinig for you message')
})

bot.command('start', async (context) => {
  context.session = INITIAL_SESSION

  await context.reply('Watinig for you message')
})

bot.on(message('voice'), async (context) => {
  context.session ??= INITIAL_SESSION

  try {
    await context.reply(code('Your message is being processed'))

    const file = context.message.voice.file_id
    const link = await context.telegram.getFileLink(file)
    const userId = String(context.message.from.id)

    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openAI.transcriptions(mp3Path)

    context.session.messages.push({
      role: openAI.roles.USER,
      content: text,
    })

    const response = await openAI.chat(context.session.messages)

    context.session.messages.push({
      role: openAI.roles.ASSISTANT,
      content: response.content,
    })

    await context.reply(`Your message: ${text}`)
    await context.reply(response.content)
  } catch (error) {}
})
bot.on(message('text'), async (context) => {
  context.session ??= INITIAL_SESSION

  try {
    await context.reply(code('Your message is being processed'))
    const text = context.message.text

    context.session.messages.push({
      role: openAI.roles.USER,
      content: text,
    })

    const response = await openAI.chat(context.session.messages)

    context.session.messages.push({
      role: openAI.roles.ASSISTANT,
      content: response.content,
    })

    await context.reply(`Your message: ${text}`)
    await context.reply(response.content)
  } catch (error) {}
})

bot.command('start', async (context) => {
  await context.reply(JSON.stringify(context.message, null, 2))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
