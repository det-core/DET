import newsletter from '../Bridge/newsletter.js'

const afkUsers = new Map()

export default {
    command: ['afk'],
    category: 'utility',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const reason = text?.trim() || 'No reason'
        
        afkUsers.set(m.sender, {
            reason: reason,
            time: Date.now()
        })
        
        await newsletter.sendText(sock, m.chat, 
            `*AFK MODE*\n\n✓ You are now AFK\nReason: ${reason}`, 
            m
        )
    }
}

// Function to check AFK status (called from main handler)
export async function checkAfk(sock, m) {
    // Check if user is returning from AFK
    if (afkUsers.has(m.sender)) {
        const afkData = afkUsers.get(m.sender)
        const duration = Math.floor((Date.now() - afkData.time) / 1000)
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        const seconds = duration % 60
        
        let durationStr = ''
        if (hours > 0) durationStr += `${hours}h `
        if (minutes > 0) durationStr += `${minutes}m `
        durationStr += `${seconds}s`
        
        afkUsers.delete(m.sender)
        
        await newsletter.sendText(sock, m.chat, 
            `*AFK RETURN*\n\n✓ Welcome back!\nAFK Duration: ${durationStr}`, 
            m
        )
    }
    
    // Check if someone mentioned an AFK user
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            if (afkUsers.has(mentioned)) {
                const afkData = afkUsers.get(mentioned)
                const duration = Math.floor((Date.now() - afkData.time) / 1000)
                const hours = Math.floor(duration / 3600)
                const minutes = Math.floor((duration % 3600) / 60)
                
                let durationStr = ''
                if (hours > 0) durationStr += `${hours} hours `
                if (minutes > 0) durationStr += `${minutes} minutes `
                
                await newsletter.sendText(sock, m.chat, 
                    `*AFK NOTICE*\n\n@${mentioned.split('@')[0]} is AFK\nReason: ${afkData.reason}\nSince: ${durationStr}ago`, 
                    m
                )
                break
            }
        }
    }
}