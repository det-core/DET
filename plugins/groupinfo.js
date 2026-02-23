import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['groupinfo', 'infogrup'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            const groupMetadata = await sock.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            const admins = participants.filter(p => p.admin)
            
            const createdDate = groupMetadata.creation 
                ? new Date(groupMetadata.creation * 1000).toLocaleDateString()
                : 'Unknown'
            
            const infoMsg = `*GROUP INFORMATION*

┏⧉ *Group Details*
┣𖣠 Name: ${groupMetadata.subject}
┣𖣠 ID: ${m.chat}
┣𖣠 Created: ${createdDate}
┣𖣠 Owner: @${groupMetadata.owner?.split('@')[0] || 'Unknown'}
┗━━━━━━━━━

┏⧉ *Members*
┣𖣠 Total: ${participants.length}
┣𖣠 Admins: ${admins.length}
┣𖣠 Members: ${participants.length - admins.length}
┗━━━━━━━━━

${groupMetadata.desc ? `┏⧉ *Description*\n┣𖣠 ${groupMetadata.desc}\n┗━━━━━━━━━` : ''}`

            const mentions = groupMetadata.owner ? [groupMetadata.owner] : []
            await newsletter.sendText(sock, m.chat, infoMsg, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}