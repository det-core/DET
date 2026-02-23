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
            let sessionStarted = false
            
            waProcess.stdout.on('data', (data) => {
                const message = data.toString()
                console.log(chalk.blue(`[WA:${userId}]`), message)
                
                // ===========================================
                // CAPTURE ANY PAIRING CODE - MULTIPLE PATTERNS
                // ===========================================
                
                let pairCode = null
                
                // Pattern 1: Your DARKTECH Pairing code : XXXX-XXXX
                const specificMatch = message.match(/Your .*? Pairing code : ([A-Z0-9]{4}-[A-Z0-9]{4})/i)
                if (specificMatch && !pairCodeSent) {
                    pairCode = specificMatch[1].toUpperCase()
                    console.log(chalk.green(`[BRIDGE] Found pairing code (specific): ${pairCode}`))
                }
                
                // Pattern 2: XXXX-XXXX (with hyphen)
                if (!pairCode && !pairCodeSent) {
                    const hyphenMatch = message.match(/\b([A-Z0-9]{4})-([A-Z0-9]{4})\b/i)
                    if (hyphenMatch) {
                        pairCode = `${hyphenMatch[1]}-${hyphenMatch[2]}`.toUpperCase()
                        console.log(chalk.green(`[BRIDGE] Found pairing code (hyphen): ${pairCode}`))
                    }
                }
                
                // Pattern 3: 8 character code (XXXXXX)
                if (!pairCode && !pairCodeSent) {
                    const eightCharMatch = message.match(/\b([A-Z0-9]{8})\b/i)
                    if (eightCharMatch) {
                        const code = eightCharMatch[1].toUpperCase()
                        // Format as XXXX-XXXX for better readability
                        pairCode = `${code.slice(0,4)}-${code.slice(4)}`
                        console.log(chalk.green(`[BRIDGE] Found pairing code (8char): ${pairCode}`))
                    }
                }
                
                // Pattern 4: Any code after "code:" or "Code:"
                if (!pairCode && !pairCodeSent) {
                    const codeLabelMatch = message.match(/code:?\s*([A-Z0-9]{4,8}[-\s]?[A-Z0-9]{4,8})/i)
                    if (codeLabelMatch) {
                        let code = codeLabelMatch[1].toUpperCase().replace(/\s+/g, '')
                        if (code.length === 8 && !code.includes('-')) {
                            pairCode = `${code.slice(0,4)}-${code.slice(4)}`
                        } else {
                            pairCode = code
                        }
                        console.log(chalk.green(`[BRIDGE] Found pairing code (label): ${pairCode}`))
                    }
                }
                
                // Pattern 5: ANY alphanumeric string that looks like a code (4-10 chars)
                if (!pairCode && !pairCodeSent) {
                    const anyCodeMatch = message.match(/\b([A-Z0-9]{4,10})\b/i)
                    if (anyCodeMatch) {
                        const code = anyCodeMatch[1].toUpperCase()
                        if (code.length === 8) {
                            pairCode = `${code.slice(0,4)}-${code.slice(4)}`
                        } else if (code.length === 7 || code.length === 9 || code.length === 10) {
                            // Keep as is
                            pairCode = code
                        }
                        console.log(chalk.green(`[BRIDGE] Found pairing code (any): ${pairCode || code}`))
                        if (!pairCode) pairCode = code
                    }
                }
                
                // If we found a code, send it to Telegram
                if (pairCode && !pairCodeSent) {
                    pairCodeSent = true
                    
                    console.log(chalk.green.bold(`[BRIDGE] Sending code to user ${userId}: ${pairCode}`))
                    
                    const pairMessage = `*KNOX PAIRING CODE*

┏⧉ *Your Pairing Code*
┣𖣠 \`${pairCode}\`
┗━━━━━━━━━━━━━❖

Open WhatsApp > Linked Devices > Link a Device
Enter this code to pair your WhatsApp`
                    
                    bot.sendMessage(userId, pairMessage, { parse_mode: "Markdown" })
                        .then(() => console.log(chalk.green(`[BRIDGE] Code sent successfully!`)))
                        .catch(err => console.error(chalk.red(`[BRIDGE] Failed to send message:`, err)))
                }
                
                // Check for successful connection
                if (message.includes('connected to your WhatsApp') && !sessionStarted) {
                    sessionStarted = true
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