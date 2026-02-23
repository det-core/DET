import TelegramBot from "node-telegram-bot-api"
import chalk from "chalk"
import { runtime } from "./Bridge/utils.js"
import WhatsAppBridge from "./bridge.js"
import det from "./Bridge/det.js"

await import("./Bridge/config.js")

global.det = det

const bot = new TelegramBot("8110692904:AAFHnlFdOdEfC9h_KQMFpolLP5Zebw-A-cQ", { polling: true })
const bridge = new WhatsAppBridge()

global.pendingPair = {}

global.det.checkMembership = async (userId) => {
    for (let channel of global.requiredChannels) {
        try {
            const member = await bot.getChatMember(channel, userId)
            if (member.status === "left" || member.status === "kicked") return false
        } catch {
            return false
        }
    }
    return true
}

global.det.mainMenu = (id) => {
    const status =
        global.det.isOwner(id) ? "Owner" :
        global.det.isAdmin(id) ? "Admin" :
        global.det.isReseller(id) ? "Reseller" :
        "User"

    return `*KNOX INFO* 
> Bot name : *${global.nameBot}*
> Developer : *${global.ownerName}*
> Version : *${global.versionBot}*
> Runtime : *${runtime(process.uptime())}*
> Bot mode : ${global.feature.public ? "*public mode*" : "*self mode*"}
> Status : *${status}*

┏⧉ *General Menu* 
┣𖣠 /reqpair
┣𖣠 /delsess
┣𖣠 /help
┗━━━━━━━━━━━━━❖`
}

global.det.startHandler = async (msg) => {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const id = String(msg.from.id)

    const joined = await global.det.checkMembership(userId)

    if (!joined) {
        return bot.sendMessage(chatId,
`*KNOX INFO*

You must join required channels before using KNOX`,
        {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: global.requiredChannels.map(ch => [
                    { text: ch, url: `https://t.me/${ch.replace("@", "")}` }
                ]).concat([
                    [{ text: "VERIFY", callback_data: "verify_join" }]
                ])
            }
        })
    }

    bot.sendMessage(chatId, global.det.mainMenu(id), { parse_mode: "Markdown" })
}

global.det.reqpair = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    const existingSession = bridge.checkSession(userId)
    if (existingSession) {
        return bot.sendMessage(chatId, 
            `*KNOX INFO*

┏⧉ *Active Session Found*
┣𖣠 You already have an active session
┣𖣠 Use /delsess to remove it
┗━━━━━━━━━━━━━❖`,
            { parse_mode: "Markdown" }
        )
    }
    
    bot.sendMessage(chatId, 
        `*KNOX PAIRING*

┏⧉ *Send your WhatsApp number*
┣𖣠 Include country code
┣𖣠 Example: \`2347030626048\`
┗━━━━━━━━━━━━━❖`,
        { parse_mode: "Markdown" }
    )
    
    global.pendingPair[userId] = true
}

global.det.delsess = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    const deletingMsg = await bot.sendMessage(chatId, 
        `*KNOX INFO*\n\nDeleting session...`,
        { parse_mode: "Markdown" }
    )
    
    const result = await bridge.stopSession(userId, bot)
    
    if (result.success) {
        await bot.editMessageText(
            `*KNOX INFO*

┏⧉ *Session Deleted*
┣𖣠 WhatsApp session removed successfully
┗━━━━━━━━━━━━━❖`,
            {
                chat_id: chatId,
                message_id: deletingMsg.message_id,
                parse_mode: "Markdown"
            }
        )
    }
}

global.det.help = async (msg) => {
    bot.sendMessage(msg.chat.id,
`*KNOX HELP*

┏⧉ *Available Commands*
┣𖣠 /start - Start the bot
┣𖣠 /reqpair - Pair WhatsApp
┣𖣠 /delsess - Delete session
┣𖣠 /help - Show this help
┗━━━━━━━━━━━━━❖

Updates and inquiries:
${global.ownerUsername}`,
        { parse_mode: "Markdown" }
    )
}

bot.on("message", async (msg) => {
    if (!msg.text) return
    
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    
    // Check if user is in pairing mode
    if (global.pendingPair && global.pendingPair[userId]) {
        const cleaned = text.replace(/\D/g, '')
        if (/^\d{10,15}$/.test(cleaned)) {
            delete global.pendingPair[userId]
            const phone = cleaned
            
            const waitingMsg = await bot.sendMessage(chatId, 
                `*KNOX PAIRING*

┏⧉ *Starting Session*
┣𖣠 Please wait for the pairing code...
┗━━━━━━━━━━━━━❖`,
                { parse_mode: "Markdown" }
            )
            
            const result = await bridge.startSession(userId, phone, bot)
            
            if (!result.success) {
                await bot.editMessageText(
                    `*KNOX INFO*

┏⧉ *Error*
┣𖣠 ${result.message}
┗━━━━━━━━━━━━━❖`,
                    {
                        chat_id: chatId,
                        message_id: waitingMsg.message_id,
                        parse_mode: "Markdown"
                    }
                )
            }
        } else {
            bot.sendMessage(chatId, 
                `*KNOX INFO*

┏⧉ *Invalid Number*
┣𖣠 Use format: \`2347030626048\`
┣𖣠 Numbers only, with country code
┗━━━━━━━━━━━━━❖`,
                { parse_mode: "Markdown" }
            )
        }
        return
    }
    
    const parsed = global.det.parseCommand(msg.text)
    if (!parsed) return

    const { command } = parsed

    if (command === "start") return global.det.startHandler(msg)
    if (command === "reqpair") return global.det.reqpair(msg, bot)
    if (command === "delsess") return global.det.delsess(msg, bot)
    if (command === "help") return global.det.help(msg)
})

bot.on("callback_query", async (query) => {
    if (query.data === "verify_join") {
        await bot.answerCallbackQuery(query.id, { text: "Verifying membership..." })
        return global.det.startHandler(query.message)
    }
})

console.log(chalk.green.bold(`
╔══════════════════════════════════╗
║     KNOX Telegram Bot Running    ║
║         Made by CODEBREAKER      ║
╚══════════════════════════════════╝
`))

console.log(chalk.cyan(`Bot Info:`))
console.log(chalk.white(`├─ Name: ${global.nameBot}`))
console.log(chalk.white(`├─ Version: ${global.versionBot}`))
console.log(chalk.white(`├─ Owner: ${global.ownerName}`))
console.log(chalk.white(`└─ Mode: ${global.feature.public ? 'Public' : 'Private'}`))