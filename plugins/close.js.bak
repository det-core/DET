import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['close', 'tutup'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await sock.groupSettingUpdate(m.chat, 'announcement')
            
            await newsletter.sendText(sock, m.chat, 
                '*GROUP CLOSED*\n\n✓ Group is now closed. Only admins can send messages.', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}