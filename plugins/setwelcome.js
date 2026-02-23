import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['setwelcome'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const message = text?.trim()
        
        if (!message) {
            const helpMsg = `*SET WELCOME*

┏⧉ *Placeholders*
┣𖣠 {user} - Mention new member
┣𖣠 {group} - Group name
┣𖣠 {count} - Member count
┣𖣠 {desc} - Group description
┗━━━━━━━━━

Example: .setwelcome Welcome {user} to {group}!`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            groupData.welcomeMsg = message
            groupData.welcome = true
            db.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat, 
                '*SET WELCOME*\n\n✓ Welcome message has been set', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}