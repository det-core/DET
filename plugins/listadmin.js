import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['listadmin', 'adminlist'],
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
            
            let adminList = `*ADMIN LIST*\n\n`
            adminList += `Total Admins: ${admins.length}\n\n`
            
            admins.forEach((admin, i) => {
                const number = admin.id.split('@')[0]
                const role = admin.admin === 'superadmin' ? 'Owner' : 'Admin'
                adminList += `${i + 1}. @${number} (${role})\n`
            })
            
            const mentions = admins.map(a => a.id)
            await sock.sendMessage(m.chat, {
                text: adminList,
                mentions: mentions
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}