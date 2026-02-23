import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['tagall', 'everyone'],
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
            
            const message = text?.trim() || 'Attention all members'
            
            await sock.sendMessage(m.chat, {
                text: `*TAG ALL*\n\nMessage: ${message}\n\nTotal Members: ${participants.length}`,
                mentions: mentions
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}