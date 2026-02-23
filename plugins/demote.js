import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['demote', 'turunadmin'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.isGroup) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nThis command can only be used in groups', m)
        }
        
        let target = null
        
        if (m.quoted) {
            target = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0]
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .demote @user or reply to user\'s message', m
            )
        }
        
        try {
            await sock.groupParticipantsUpdate(m.chat, [target], 'demote')
            
            const targetNum = target.split('@')[0]
            await newsletter.sendText(sock, m.chat, 
                `*DEMOTE RESULT*\n\n✓ @${targetNum} is no longer an admin`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}