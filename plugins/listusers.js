import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['listusers', 'users'],
    category: 'admin',
    owner: false,
    admin: true,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const owners = det.db.owner || []
        const admins = det.db.admin || []
        const resellers = det.db.reseller || []
        const users = det.db.user || []
        
        let resultText = `*USER LIST*

┏⧉ *Statistics*
┣𖣠 Owners: ${owners.length}
┣𖣠 Admins: ${admins.length}
┣𖣠 Resellers: ${resellers.length}
┣𖣠 Users: ${users.length}
┣𖣠 Total: ${owners.length + admins.length + resellers.length + users.length}
┗━━━━━━━━━

┏⧉ *Owners*
${owners.slice(0, 10).map(id => `┣𖣠 @${id}`).join('\n')}${owners.length > 10 ? `\n┣𖣠 ... and ${owners.length - 10} more` : ''}
┗━━━━━━━━━

┏⧉ *Admins*
${admins.slice(0, 10).map(id => `┣𖣠 @${id}`).join('\n')}${admins.length > 10 ? `\n┣𖣠 ... and ${admins.length - 10} more` : ''}
┗━━━━━━━━━

┏⧉ *Resellers*
${resellers.slice(0, 10).map(id => `┣𖣠 @${id}`).join('\n')}${resellers.length > 10 ? `\n┣𖣠 ... and ${resellers.length - 10} more` : ''}
┗━━━━━━━━━`

        const mentions = [...owners, ...admins, ...resellers].map(id => id + '@s.whatsapp.net')
        
        await sock.sendMessage(m.chat, {
            text: resultText,
            mentions: mentions.slice(0, 30)
        }, { quoted: m })
    }
}