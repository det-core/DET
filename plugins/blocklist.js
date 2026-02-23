import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['blocklist'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        try {
            const blocklist = await sock.fetchBlocklist()
            
            if (!blocklist || blocklist.length === 0) {
                return newsletter.sendText(sock, m.chat, 
                    '*BLOCK LIST*\n\nNo blocked users found', m
                )
            }
            
            let listText = `*BLOCK LIST*\n\nTotal Blocked: ${blocklist.length}\n\n`
            
            blocklist.forEach((jid, i) => {
                const number = jid.split('@')[0]
                listText += `${i + 1}. @${number}\n`
            })
            
            await sock.sendMessage(m.chat, {
                text: listText,
                mentions: blocklist
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}