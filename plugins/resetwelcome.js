import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['resetwelcome'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            delete groupData.welcomeMsg
            db.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat, 
                '*RESET WELCOME*\n\n✓ Welcome message has been reset to default', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}