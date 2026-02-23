import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['delppgc', 'delppgroup'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await sock.removeProfilePicture(m.chat)
            
            await newsletter.sendText(sock, m.chat, 
                '*DELETE PP*\n\n✓ Group profile picture has been removed', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}