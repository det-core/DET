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
`You must join required channels before using KNOX`,
        {
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
            `*KNOX INFO*\n\nYou already have an active session\nUse /delsess to remove it`
        )
    }
    
    bot.sendMessage(chatId, `*KNOX PAIRING*\n\nSend your WhatsApp number with country code\nExample: 2347030626048`)
    
    global.pendingPair[userId] = true
}

global.det.delsess = async (msg, bot) => {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    await bridge.stopSession(userId, bot)
}

global.det.help = async (msg) => {
    bot.sendMessage(msg.chat.id,
`Updates and inquiries:
${global.ownerUsername}`)
}

bot.on("message", async (msg) => {
    if (!msg.text) return
    
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    
    if (global.pendingPair && global.pendingPair[userId]) {
        if (/^\d{10,15}$/.test(text.replace(/\D/g, ''))) {
            delete global.pendingPair[userId]
            const phone = text.replace(/\D/g, '')
            
            bot.sendMessage(chatId, `*KNOX PAIRING*\n\nStarting session...`)
            
            const result = await bridge.startSession(userId, phone, bot)
            
            if (!result.success) {
                bot.sendMessage(chatId, `*KNOX INFO*\n\n${result.message}`)
            }
        } else {
            bot.sendMessage(chatId, `*KNOX INFO*\n\nInvalid number\nUse format: 2347030626048`)
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
        return global.det.startHandler(query.message)
    }
})

console.log(chalk.green("KNOX Telegram Bot Running"))