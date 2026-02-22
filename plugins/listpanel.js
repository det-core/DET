// plugins/listpanel.js
export default {
    command: ['listpanel'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply } = m
        
        let panelList = '*KNOX PANEL PRICES*\n\n'
        
        for (let [size, data] of Object.entries(global.panelPrices)) {
            panelList += `${size} - CPU: ${data.cpu}% - RAM: ${data.ram/1024}GB - ₦${data.price.toLocaleString()}\n`
        }
        
        panelList += '\nUse .buypanel to order'
        
        reply(panelList)
    }
}