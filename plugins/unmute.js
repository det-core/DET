import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['unmute'],
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
                '*KNOX INFO*\n\nUsage: .unmute @user or reply to user\'s message', m
            )
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            if (groupData.mutedUsers && groupData.mutedUsers[target]) {
                delete groupData.mutedUsers[target]
                db.setGroup(m.chat, groupData)
            }
            
            const targetNum = target.split('@')[0]
            await newsletter.sendText(sock, m.chat, 
                `*UNMUTE*\n\n✓ @${targetNum} has been unmuted`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}