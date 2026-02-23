import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['setppgc', 'setppgroup'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        
        if (m.quoted && (m.quoted.message?.imageMessage || m.quoted.message?.videoMessage)) {
            buffer = await m.quoted.download()
        } else if (m.message?.imageMessage || m.message?.videoMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nPlease reply to an image or video with .setppgc', m
            )
        }
        
        try {
            await sock.updateProfilePicture(m.chat, buffer)
            
            await newsletter.sendText(sock, m.chat, 
                '*UPDATE PP*\n\n✓ Group profile picture has been updated', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}