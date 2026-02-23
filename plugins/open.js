import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['open', 'buka'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await sock.groupSettingUpdate(m.chat, 'not_announcement')
            
            await newsletter.sendText(sock, m.chat, 
                '*GROUP OPENED*\n\n✓ Group is now open. All members can send messages.', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}