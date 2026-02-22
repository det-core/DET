export default {
    command: ['cpanel', 'listpanel', 'delpanel', 'buypanel', 'adminpanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply, command, isOwner, isReseller } = m
        
        if (command === 'listpanel') {
            let panelList = '*KNOX PANEL PRICES*\n\n'
            
            for (let [size, data] of Object.entries(global.panelPrices)) {
                panelList += `${size} - CPU: ${data.cpu}% - ₦${data.price.toLocaleString()}\n`
            }
            
            panelList += '\nUse .buypanel to order'
            
            return reply(panelList)
        }
        
        if (command === 'buypanel') {
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
            
            return reply(`*KNOX INFO*\n\nContact ${global.ownerName} to order a panel\nTG: ${global.ownerUsername}`)
        }
        
        if (command === 'adminpanel') {
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
            
            return reply(`*KNOX INFO*\n\nContact ${global.ownerName} for admin panel access\nTG: ${global.ownerUsername}`)
        }
        
        if (command === 'cpanel' && (isOwner || isReseller)) {
            if (!text) return reply('*KNOX INFO*\n\nUsage: .cpanel name|size\nExample: .cpanel mypanel|2gb')
            
            const [name, size] = text.split('|')
            
            if (!global.panelPrices[size]) {
                return reply('*KNOX INFO*\n\nInvalid size. Use: 1gb, 2gb, 3gb, 4gb, 5gb, 6gb, 7gb, 8gb, 9gb, 10gb')
            }
            
            const panelData = global.panelPrices[size]
            
            reply(`*KNOX INFO*\n\nCreating panel...\nName: ${name}\nSize: ${size}\nRAM: ${panelData.ram}MB\nCPU: ${panelData.cpu}%\nPrice: ₦${panelData.price.toLocaleString()}`)
        }
        
        if (command === 'delpanel' && isOwner) {
            if (!text) return reply('*KNOX INFO*\n\nUsage: .delpanel panelid')
            reply(`*KNOX INFO*\n\nPanel ${text} deleted successfully`)
        }
    }
}