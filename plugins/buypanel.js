// plugins/buypanel.js
export default {
    command: ['buypanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply } = m
        
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${global.ownerName}\n` +
            `TEL;type=CELL;type=VOICE;waid=${global.ownerNumber}:${global.ownerNumber}\n` +
            'END:VCARD'
        
        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: global.ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m })
        
        reply(`*KNOX INFO*\n\nContact ${global.ownerName} to order a panel\nTG: ${global.ownerUsername}`)
    }
}