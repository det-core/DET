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
import { casesBot, fitur } from './knox.js'

const userId = process.argv[2]
const phoneNumber = process.argv[3]
const sessionPath = process.env.SESSION_PATH || path.join(__dirname, 'KnoxSession', `session_${userId}`)

async function startWA() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestWaWebVersion()
    
    const sock = makeWASocket({
        browser: Browsers.ubuntu("Firefox"),
        printQRInTerminal: false,
        auth: state,
        version: version,
        logger: pino({ level: "silent" })
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            
            if (reason === DisconnectReason.loggedOut) {
                console.log("Logged out")
                process.exit()
            } else {
                console.log("Reconnecting...")
                startWA()
            }
        } else if (connection === "open") {
            console.log("connected to your WhatsApp")
        }
    })

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            if (chatUpdate.type !== "notify") return
            
            const msg = chatUpdate.messages[0]
            if (!msg?.message) return

            const m = await parseMessage(sock, msg)
            
            const isOwner = global.owner?.includes(m.sender.split('@')[0])
            if (!fitur.public && !isOwner && !m.key.fromMe) return

            await casesBot(sock, m, chatUpdate)
            
        } catch (err) {
            console.log("Error:", err)
        }
    })

    async function parseMessage(sock, msg) {
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
            m.body = m.message.conversation
        } else if (messageType === 'extendedTextMessage') {
            m.body = m.message.extendedTextMessage.text
        } else if (messageType === 'imageMessage') {
            m.body = m.message.imageMessage.caption || ''
        } else if (messageType === 'videoMessage') {
            m.body = m.message.videoMessage.caption || ''
        } else {
            m.body = ''
        }
        
        const prefix = global.prefixes?.find(p => m.body.startsWith(p)) || '.'
        if (m.body.startsWith(prefix)) {
            m.prefix = prefix
            const args = m.body.slice(prefix.length).trim().split(/ +/)
            m.command = args[0].toLowerCase()
            m.args = args.slice(1)
            m.text = m.args.join(' ')
        }
        
        const senderNumber = m.sender.split('@')[0]
        m.isOwner = global.owner?.includes(senderNumber) || false
        m.isReseller = global.reseller?.includes(senderNumber) || false
        
        m.reply = async (text) => {
            return await sock.sendMessage(m.chat, { text }, { quoted: m })
        }
        
        return m
    }
}

startWA()