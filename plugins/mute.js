import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['mute'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        let target = null
        
        if (m.quoted) {
            target = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0]
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .mute @user <minutes> or reply to user\'s message', m
            )
        }
        
        const duration = parseInt(args[0]) || 30
        if (duration < 1 || duration > 1440) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nDuration must be between 1-1440 minutes (24 hours)', m
            )
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            if (!groupData.mutedUsers) groupData.mutedUsers = {}
            
            groupData.mutedUsers[target] = {
                until: Date.now() + (duration * 60 * 1000),
                by: m.sender
            }
            
            db.setGroup(m.chat, groupData)
            
            const targetNum = target.split('@')[0]
            await newsletter.sendText(sock, m.chat, 
                `*MUTE*\n\n✓ @${targetNum} has been muted for ${duration} minutes`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}