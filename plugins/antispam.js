import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['antispam'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option || (option !== 'on' && option !== 'off')) {
            const helpMsg = `*ANTISPAM SETTINGS*

┏⧉ *Usage*
┣𖣠 .antispam on
┣𖣠 .antispam off
┣𖣠 .antispam warn <count>
┣𖣠 .antispam action kick/mute
┣𖣠 .antispam reset @user
┗━━━━━━━━━`

            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            if (!groupData.antispam) groupData.antispam = {}
            
            if (option === 'on') {
                groupData.antispam.enabled = true
            } else if (option === 'off') {
                groupData.antispam.enabled = false
            }
            
            db.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat, 
                `*ANTISPAM*\n\n✓ Antispam has been turned ${option.toUpperCase()}`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}