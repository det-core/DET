import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['broadcast', 'bc'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const message = text?.trim()
        
        if (!message) {
            return newsletter.sendText(sock, m.chat, 
                '*BROADCAST*\n\nUsage: .broadcast <message>', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*BROADCAST*\n\nSending broadcast to all users...', m)
        
        const users = det.db.user || []
        const chats = [...new Set([...users, ...global.owner])]
        
        let sent = 0
        let failed = 0
        
        for (const user of chats) {
            try {
                const jid = user.includes('@') ? user : user + '@s.whatsapp.net'
                await newsletter.sendText(sock, jid, 
                    `*BROADCAST MESSAGE*\n\n${message}\n\n- ${global.ownerName}`, 
                    null
                )
                sent++
                await new Promise(r => setTimeout(r, 1000))
            } catch {
                failed++
            }
        }
        
        await newsletter.sendText(sock, m.chat, 
            `*BROADCAST RESULT*\n\nSent: ${sent}\nFailed: ${failed}`, 
            m
        )
    }
}