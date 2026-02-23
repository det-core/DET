import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['linkgc', 'linkgrup', 'gclink'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            const code = await sock.groupInviteCode(m.chat)
            const link = `https://chat.whatsapp.com/${code}`
            
            await newsletter.sendText(sock, m.chat, 
                `*GROUP LINK*\n\n${link}`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}