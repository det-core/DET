import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['setnamegc', 'setnamegrup'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const newName = text?.trim()
        
        if (!newName) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .setnamegc New Group Name', m
            )
        }
        
        if (newName.length > 100) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nGroup name cannot exceed 100 characters', m
            )
        }
        
        try {
            await sock.groupUpdateSubject(m.chat, newName)
            
            await newsletter.sendText(sock, m.chat, 
                `*UPDATE NAME*\n\n✓ Group name changed to: ${newName}`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}