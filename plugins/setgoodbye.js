import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['setgoodbye'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const message = text?.trim()
        
        if (!message) {
            const helpMsg = `*SET GOODBYE*

┏⧉ *Placeholders*
┣𖣠 {user} - Mention leaving member
┣𖣠 {group} - Group name
┣𖣠 {count} - Remaining member count
┗━━━━━━━━━

Example: .setgoodbye Goodbye {user}, see you later!`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            groupData.goodbyeMsg = message
            groupData.goodbye = true
            db.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat, 
                '*SET GOODBYE*\n\n✓ Goodbye message has been set', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}