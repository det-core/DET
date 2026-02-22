export default {
    command: ['ping'],
    category: 'main',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const start = Date.now()
        await m.reply('*KNOX INFO*\n\nPinging...')
        const end = Date.now()
        await m.reply(`*KNOX INFO*\n\nPong!\nSpeed: ${end - start}ms`)
    }
}