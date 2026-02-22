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
                
                const pairMatch = message.match(/Your code.*?:.*?([A-Z0-9]{4}-[A-Z0-9]{4})/i)
                if (pairMatch && !pairCodeSent) {
                    pairCodeSent = true
                    const pairCode = pairMatch[1]
                    bot.sendMessage(userId, 
                        `*KNOX PAIRING CODE*\n\n` +
                        `${pairCode}\n\n` +
                        `Open WhatsApp > Linked Devices > Link a Device`
                    )
                }
                
                if (message.includes('connected to your WhatsApp')) {
                    this.saveUserSession(userId, phoneNumber)
                    bot.sendMessage(userId,
                        `*KNOX INFO*\n\n` +
                        `WhatsApp successfully paired\n` +
                        `Bot is now active`
                    )
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
            
            bot.sendMessage(userId,
                `*KNOX INFO*\n\n` +
                `Session deleted successfully`
            )
            
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
    }

    removeUserSession(userId) {
        const sessionsFile = './database/sessions.json'
        
        if (fs.existsSync(sessionsFile)) {
            let sessions = JSON.parse(fs.readFileSync(sessionsFile))
            delete sessions[userId]
            fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2))
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