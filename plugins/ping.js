import newsletter from '../Bridge/newsletter.js'

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
        await newsletter.sendText(sock, m.chat, '*PING*\n\nCalculating...', m)
        const end = Date.now()
        
        const dbStatus = '✓'
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        
        const resultText = `*PONG!*

┏⧉ *Response Time*
┣𖣠 Speed: ${end - start}ms
┣𖣠 Database: ${dbStatus}
┣𖣠 Memory: ${memory} MB
┣𖣠 Uptime: ${Math.floor(process.uptime() / 60)} minutes
┗━━━━━━━━━`

        await newsletter.sendText(sock, m.chat, resultText, m)
    }
}