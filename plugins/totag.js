import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['totag'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.quoted) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nPlease reply to a message to tag all members', m
            )
        }
        
        try {
            const groupMetadata = await sock.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            const mentions = participants.map(p => p.id)
            
            await sock.sendMessage(m.chat, {
                forward: m.quoted,
                mentions: mentions
            })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}