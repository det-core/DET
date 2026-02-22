import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    DisconnectReason,
    Browsers
} from "@whiskeysockets/baileys"
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import './config.js'
import { casesBot, Feature } from './knox.js'

const userId = process.argv[2]
const phoneNumber = process.argv[3]
const sessionPath = process.env.SESSION_PATH || path.join(__dirname, 'KnoxSession', `session_${userId}`)

// Ensure session directory exists
if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true })
}

async function startWA() {
    console.log(chalk.yellow(`[DEBUG] Starting WhatsApp bot for user: ${userId}`))
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestWaWebVersion()
    
    const sock = makeWASocket({
        browser: Browsers.ubuntu("Firefox"),
        printQRInTerminal: false,
        auth: state,
        version: version,
        logger: pino({ level: "silent" }),
        syncFullHistory: false,
        defaultQueryTimeoutMs: undefined
    })

    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber)
                const pair = code.slice(0, 4) + "-" + code.slice(4, 8)
                console.log(`Your ${global.pairingCode} Pairing code : ${pair}`)
            } catch (error) {
                console.log("Error generating pairing code:", error)
            }
        }, 3000)
    }

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        console.log(chalk.yellow(`[DEBUG] Connection update: ${connection}`))
        
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log(chalk.red(`[DEBUG] Connection closed with reason: ${reason}`))
            
            if (reason === DisconnectReason.loggedOut) {
                console.log("Logged out")
                process.exit()
            } else {
                console.log("Reconnecting in 5 seconds...")
                setTimeout(() => startWA(), 5000)
            }
        } else if (connection === "open") {
            console.log(chalk.green("✓ connected to your WhatsApp"))
            
            const channels = [
                "120363400363337568@newsletter",
                "120363402033092071@newsletter"
            ]
            
            for (let channel of channels) {
                try {
                    await sock.newsletterFollow(channel)
                } catch (e) {}
            }
        }
    })

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            if (chatUpdate.type !== "notify") return
            
            const msg = chatUpdate.messages[0]
            if (!msg?.message) return

            const m = await parseMessage(sock, msg)
            
            if (!m) return
            
            const isOwner = global.owner?.includes(m.sender.split('@')[0])
            
            if (!Feature.public && !isOwner && !m.key.fromMe) return

            if (m.command) {
                console.log(chalk.green(`[CMD] Executing: ${m.command}`))
                try {
                    await casesBot(sock, m, chatUpdate)
                } catch (cmdError) {
                    console.error(`[ERROR] Command execution failed:`, cmdError)
                    await m.reply('*KNOX INFO*\n\nCommand execution failed')
                }
            }
            
        } catch (err) {
            // Ignore encryption errors - they're normal during initial connection
            if (!err.message?.includes('Bad MAC')) {
                console.log("Error:", err)
            }
        }
    })

    async function parseMessage(sock, msg) {
        try {
            const m = {}
            
            m.key = msg.key
            m.message = msg.message
            m.sender = m.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : (m.key.participant || m.key.remoteJid)
            m.chat = m.key.remoteJid
            m.fromMe = m.key.fromMe
            m.isGroup = m.chat.endsWith('@g.us')
            
            const messageType = Object.keys(m.message)[0]
            m.type = messageType
            
            if (messageType === 'conversation') {
                m.body = m.message.conversation || ''
            } else if (messageType === 'extendedTextMessage') {
                m.body = m.message.extendedTextMessage.text || ''
            } else if (messageType === 'imageMessage') {
                m.body = m.message.imageMessage.caption || ''
            } else if (messageType === 'videoMessage') {
                m.body = m.message.videoMessage.caption || ''
            } else {
                m.body = ''
            }
            
            const prefixes = global.prefixes || ['.', '/', '!', '#']
            const prefix = prefixes.find(p => m.body.startsWith(p))
            
            if (prefix) {
                m.prefix = prefix
                const args = m.body.slice(prefix.length).trim().split(/ +/)
                m.command = args[0].toLowerCase()
                m.args = args.slice(1)
                m.text = m.args.join(' ')
                console.log(chalk.cyan(`[CMD] Detected: ${m.command} from ${m.sender}`))
            }
            
            const senderNumber = m.sender.split('@')[0]
            m.isOwner = global.owner?.includes(senderNumber) || false
            m.isReseller = global.reseller?.includes(senderNumber) || false
            
            m.reply = async (text) => {
                try {
                    return await sock.sendMessage(m.chat, { text }, { quoted: m })
                } catch (replyError) {
                    console.error('Reply error:', replyError)
                    return null
                }
            }
            
            return m
        } catch (parseError) {
            console.error('Parse error:', parseError)
            return null
        }
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n[SYSTEM] Shutting down...'))
    process.exit()
})

startWA()