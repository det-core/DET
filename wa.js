import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    DisconnectReason,
    Browsers,
    downloadContentFromMessage,
    getContentType
} from "@whiskeysockets/baileys"
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import './Bridge/config.js'
import det from './Bridge/det.js'
import { casesBot, Feature } from './knox.js'

const userId = process.argv[2]
const phoneNumber = process.argv[3]
const sessionPath = process.env.SESSION_PATH || path.join(__dirname, 'KnoxSession', `session_${userId || 'default'}`)

// Ensure session directory exists
if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true })
}

async function startWA() {
    console.log(chalk.yellow(`[WA] Starting WhatsApp bot for user: ${userId || 'default'}`))
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestWaWebVersion()
    
    const sock = makeWASocket({
        browser: Browsers.ubuntu("Firefox"),
        printQRInTerminal: false,
        auth: state,
        version: version,
        logger: pino({ level: "silent" }),
        syncFullHistory: false,
        defaultQueryTimeoutMs: undefined,
        generateHighQualityLinkPreview: true
    })

    sock.ev.on('creds.update', saveCreds)

    // Download media function
    sock.downloadMediaMessage = async (message) => {
        const type = Object.keys(message.message)[0]
        const stream = await downloadContentFromMessage(message.message[type], type.replace('Message', ''))
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    if (!sock.authState.creds.registered && phoneNumber) {
        setTimeout(async () => {
            try {
                console.log(chalk.yellow(`\n[WA] Generating pairing code for ${phoneNumber}...`))
                const code = await sock.requestPairingCode(phoneNumber)
                const pair = code.slice(0, 4) + "-" + code.slice(4, 8)
                
                // Log to console with design
                console.log(chalk.green.bold(`
╔══════════════════════════════════╗
║     KNOX PAIRING CODE            ║
╠══════════════════════════════════╣
║                                  ║
║        ${pair}            ║
║                                  ║
╚══════════════════════════════════╝
`))
                
                // This will be caught by the bridge and sent to Telegram
                console.log(`Your ${global.pairingCode || 'KNOX'} Pairing code : ${pair}`)
                
            } catch (error) {
                console.log(chalk.red("Error generating pairing code:"), error)
            }
        }, 3000)
    }

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        console.log(chalk.yellow(`[WA] Connection update: ${connection || 'unknown'}`))
        
        if (qr) {
            console.log(chalk.green('QR Code received - scan to login'))
        }
        
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log(chalk.red(`[WA] Connection closed with reason: ${reason}`))
            
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red("[WA] Logged out - removing session"))
                fs.rmSync(sessionPath, { recursive: true, force: true })
                process.exit()
            } else {
                console.log(chalk.yellow("[WA] Reconnecting in 5 seconds..."))
                setTimeout(() => startWA(), 5000)
            }
        } else if (connection === "open") {
            console.log(chalk.green.bold('✓ Successfully connected to WhatsApp'))
        }
    })

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            if (chatUpdate.type !== "notify") return
            
            const msg = chatUpdate.messages[0]
            if (!msg?.message) return

            const m = await parseMessage(sock, msg)
            
            if (!m) return
            
            const senderId = m.sender.split('@')[0]
            m.isOwner = det.isOwner(senderId)
            m.isAdmin = det.isAdmin(senderId)
            m.isReseller = det.isReseller(senderId)
            
            // Check bot mode
            if (!Feature.public && !m.isOwner && !m.key.fromMe) return

            if (m.command) {
                console.log(chalk.green(`[CMD] ${m.command} from ${senderId} (${det.getUserStatus(senderId)})`))
                try {
                    await casesBot(sock, m, chatUpdate)
                } catch (cmdError) {
                    console.error(`[ERROR] Command execution failed:`, cmdError)
                    await m.reply('*KNOX INFO*\n\nCommand execution failed')
                }
            }
            
        } catch (err) {
            // Ignore Bad MAC errors - they're normal
            if (err.message?.includes('Bad MAC')) {
                return
            }
            if (!err.message?.includes('not a function')) {
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
            
            const type = getContentType(m.message)
            m.type = type
            
            // Get message body
            if (type === 'conversation') {
                m.body = m.message.conversation || ''
            } else if (type === 'extendedTextMessage') {
                m.body = m.message.extendedTextMessage.text || ''
            } else if (type === 'imageMessage') {
                m.body = m.message.imageMessage.caption || ''
            } else if (type === 'videoMessage') {
                m.body = m.message.videoMessage.caption || ''
            } else if (type === 'documentMessage') {
                m.body = m.message.documentMessage.caption || ''
            } else {
                m.body = ''
            }
            
            // Check for quoted message
            if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                m.quoted = {
                    message: m.message.extendedTextMessage.contextInfo.quotedMessage,
                    key: {
                        id: m.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: m.message.extendedTextMessage.contextInfo.participant,
                        remoteJid: m.chat
                    }
                }
                m.quoted.type = getContentType(m.quoted.message)
                m.quoted.sender = m.quoted.key.participant || m.quoted.key.remoteJid
                
                // Add download function to quoted message
                m.quoted.download = async () => {
                    const quotedType = Object.keys(m.quoted.message)[0]
                    const stream = await downloadContentFromMessage(m.quoted.message[quotedType], quotedType.replace('Message', ''))
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk])
                    }
                    return buffer
                }
            }
            
            // Check for prefix and command
            const prefixes = global.prefixes || ['.', '/', '!', '#', '•', '∆']
            const prefix = prefixes.find(p => m.body.startsWith(p))
            
            if (prefix) {
                m.prefix = prefix
                const args = m.body.slice(prefix.length).trim().split(/ +/)
                m.command = args[0].toLowerCase()
                m.args = args.slice(1)
                m.text = m.args.join(' ')
            }
            
            // Download function for media
            m.download = async () => {
                const mediaType = Object.keys(m.message)[0]
                const stream = await downloadContentFromMessage(m.message[mediaType], mediaType.replace('Message', ''))
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                return buffer
            }
            
            // Reply function
            m.reply = async (text, options = {}) => {
                try {
                    return await sock.sendMessage(m.chat, { text, ...options }, { quoted: m })
                } catch (replyError) {
                    console.error('Reply error:', replyError)
                    return null
                }
            }
            
            // Send image function
            m.sendImage = async (buffer, caption = '') => {
                try {
                    return await sock.sendMessage(m.chat, {
                        image: buffer,
                        caption: caption
                    }, { quoted: m })
                } catch (error) {
                    console.error('Send image error:', error)
                    return null
                }
            }
            
            // React to message
            m.react = async (emoji) => {
                try {
                    return await sock.sendMessage(m.chat, {
                        react: {
                            text: emoji,
                            key: m.key
                        }
                    })
                } catch (error) {
                    console.error('React error:', error)
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

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n[SYSTEM] Shutting down...'))
    process.exit()
})

startWA()