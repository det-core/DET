import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['hidetag2', 'ht2'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            const groupMetadata = await sock.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            const mentions = participants.map(p => p.id)
            
            let message = text?.trim()
            
            if (!message && m.quoted) {
                message = m.quoted.message?.conversation || 
                         m.quoted.message?.extendedTextMessage?.text || 
                         'Hidden tag message'
            }
            
            if (!message) {
                return newsletter.sendText(sock, m.chat, 
                    '*KNOX INFO*\n\nUsage: .hidetag2 <message> or reply to a message', m
                )
            }
            
            await sock.sendMessage(m.chat, {
                text: message,
                mentions: mentions
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}