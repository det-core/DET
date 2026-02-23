import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['delete', 'del', 'hapus'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.quoted) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nPlease reply to a message to delete it', m
            )
        }
        
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const isBotMessage = m.quoted.key?.fromMe || m.quoted.sender === botJid
        const isOwnMessage = m.quoted.sender === m.sender
        
        if (!isOwnMessage && !isBotMessage && !m.isAdmin) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nYou can only delete your own messages or bot messages', m
            )
        }
        
        try {
            const key = {
                remoteJid: m.chat,
                id: m.quoted.key.id,
                fromMe: m.quoted.key.fromMe || isBotMessage,
                participant: m.quoted.key.participant || m.quoted.sender
            }
            
            await sock.sendMessage(m.chat, { delete: key })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}