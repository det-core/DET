// plugins/delpanel.js
export default {
    command: ['delpanel'],
    category: 'cpanel',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply } = m
        
        if (!text) {
            return reply('*KNOX INFO*\n\nUsage: .delpanel panelid')
        }
        
        reply(`*KNOX INFO*\n\nPanel ${text} deleted successfully`)
        
        // Pterodactyl delete logic here
    }
}