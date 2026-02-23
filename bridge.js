import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import chalk from 'chalk'

class WhatsAppBridge {
    constructor() {
        this.activeSessions = new Map()
        this.sessionDir = './KnoxSession'
        
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true })
        }
        
        if (!fs.existsSync('./database')) {
            fs.mkdirSync('./database', { recursive: true })
        }
        
        const sessionsFile = './database/sessions.json'
        if (!fs.existsSync(sessionsFile)) {
            fs.writeFileSync(sessionsFile, JSON.stringify({}))
        }
    }

    async startSession(userId, phoneNumber, bot) {
        try {
            const sessionPath = path.join(this.sessionDir, `session_${userId}`)
            
            const existingSession = this.checkSession(userId)
            if (existingSession) {
                return { success: false, message: 'Session already exists' }
            }
            
            if (this.activeSessions.has(userId)) {
                this.activeSessions.get(userId).process.kill()
                this.activeSessions.delete(userId)
            }
            
            console.log(chalk.yellow(`[BRIDGE] Starting WhatsApp process for user ${userId}`))
            
            const waProcess = spawn('node', ['wa.js', userId.toString(), phoneNumber], {
                env: {
                    ...process.env,
                    TELEGRAM_USER_ID: userId,
                    SESSION_PATH: sessionPath
                }
            })

            let pairCodeSent = false
            
            waProcess.stdout.on('data', (data) => {
                const message = data.toString()
                console.log(chalk.blue(`[WA:${userId}]`), message)
                
                // Look for ANY pairing code pattern
                const codePatterns = [
                    /Your .*? Pairing code : ([A-Z0-9]{4}-[A-Z0-9]{4})/i,
                    /\b([A-Z0-9]{4})-([A-Z0-9]{4})\b/i,
                    /\b([A-Z0-9]{8})\b/i,
                    /code:?\s*([A-Z0-9]{4,8}[-\s]?[A-Z0-9]{4,8})/i
                ]
                
                let pairCode = null
                
                for (const pattern of codePatterns) {
                    const match = message.match(pattern)
                    if (match) {
                        if (match[1] && match[2]) {
                            pairCode = `${match[1]}-${match[2]}`.toUpperCase()
                        } else if (match[1] && match[1].length === 8) {
                            const code = match[1].toUpperCase()
                            pairCode = `${code.slice(0,4)}-${code.slice(4)}`
                        } else if (match[1]) {
                            pairCode = match[1].toUpperCase()
                        }
                        break
                    }
                }
                
                if (pairCode && !pairCodeSent) {
                    pairCodeSent = true
                    
                    console.log(chalk.green(`[BRIDGE] Found pairing code: ${pairCode}`))
                    
                    const pairMessage = `*KNOX PAIRING CODE*

┏⧉ *Your Pairing Code*
┣𖣠 \`${pairCode}\`
┗━━━━━━━━━━━━━❖

Open WhatsApp > Linked Devices > Link a Device
Enter this code to pair your WhatsApp`
                    
                    bot.sendMessage(userId, pairMessage, { parse_mode: "Markdown" })
                        .catch(err => console.error(chalk.red(`[BRIDGE] Failed to send message:`, err)))
                }
                
                if (message.includes('connected to your WhatsApp')) {
                    this.saveUserSession(userId, phoneNumber)
                    
                    const successMessage = `*KNOX INFO*

┏⧉ *Session Active*
┣𖣠 WhatsApp successfully paired
┣𖣠 Bot is now active in your WhatsApp
┗━━━━━━━━━━━━━❖`
                    
                    bot.sendMessage(userId, successMessage, { parse_mode: "Markdown" })
                        .catch(err => console.error(chalk.red(`[BRIDGE] Failed to send success message:`, err)))
                }
            })

            waProcess.stderr.on('data', (data) => {
                console.error(chalk.red(`[WA Error:${userId}]`), data.toString())
            })

            waProcess.on('close', (code) => {
                console.log(chalk.yellow(`[WA:${userId}]`) + ` Process exited with code ${code}`)
                this.activeSessions.delete(userId)
            })

            this.activeSessions.set(userId, {
                process: waProcess,
                phoneNumber: phoneNumber,
                startTime: Date.now()
            })

            return { success: true, message: 'Session starting' }
            
        } catch (error) {
            console.error('Bridge error:', error)
            return { success: false, message: 'Failed to start session' }
        }
    }

    async stopSession(userId, bot) {
        try {
            const session = this.activeSessions.get(userId)
            if (session) {
                session.process.kill()
                this.activeSessions.delete(userId)
            }
            
            const sessionPath = path.join(this.sessionDir, `session_${userId}`)
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true })
            }
            
            this.removeUserSession(userId)
            
            const stopMessage = `*KNOX INFO*

┏⧉ *Session Deleted*
┣𖣠 Session removed successfully
┗━━━━━━━━━━━━━❖`
            
            bot.sendMessage(userId, stopMessage, { parse_mode: "Markdown" })
                .catch(err => console.error('Failed to send stop message:', err))
            
            return { success: true }
            
        } catch (error) {
            console.error('Stop session error:', error)
            return { success: false }
        }
    }

    saveUserSession(userId, phoneNumber) {
        const sessionsFile = './database/sessions.json'
        let sessions = {}
        
        if (fs.existsSync(sessionsFile)) {
            sessions = JSON.parse(fs.readFileSync(sessionsFile))
        }
        
        sessions[userId] = {
            phoneNumber: phoneNumber,
            pairedAt: new Date().toISOString(),
            active: true
        }
        
        fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2))
        console.log(chalk.green(`[BRIDGE] Session saved for user ${userId}`))
    }

    removeUserSession(userId) {
        const sessionsFile = './database/sessions.json'
        
        if (fs.existsSync(sessionsFile)) {
            let sessions = JSON.parse(fs.readFileSync(sessionsFile))
            delete sessions[userId]
            fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2))
            console.log(chalk.yellow(`[BRIDGE] Session removed for user ${userId}`))
        }
    }

    checkSession(userId) {
        const sessionsFile = './database/sessions.json'
        
        if (fs.existsSync(sessionsFile)) {
            const sessions = JSON.parse(fs.readFileSync(sessionsFile))
            return sessions[userId] || null
        }
        
        return null
    }
}

export default WhatsAppBridge