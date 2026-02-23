import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['runtime', 'uptime'],
    category: 'utility',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor(uptime / 3600) % 24
        const minutes = Math.floor(uptime / 60) % 60
        const seconds = Math.floor(uptime % 60)
        
        const memory = process.memoryUsage()
        const heapUsed = (memory.heapUsed / 1024 / 1024).toFixed(2)
        const heapTotal = (memory.heapTotal / 1024 / 1024).toFixed(2)
        const rss = (memory.rss / 1024 / 1024).toFixed(2)
        
        const resultText = `*BOT RUNTIME*

┏⧉ *Uptime*
┣𖣠 ${days}d ${hours}h ${minutes}m ${seconds}s
┗━━━━━━━━━

┏⧉ *Memory Usage*
┣𖣠 Heap Used: ${heapUsed} MB
┣𖣠 Heap Total: ${heapTotal} MB
┣𖣠 RSS: ${rss} MB
┗━━━━━━━━━

┏⧉ *System*
┣𖣠 Platform: ${process.platform}
┣𖣠 Node: ${process.version}
┣𖣠 PID: ${process.pid}
┗━━━━━━━━━`

        await newsletter.sendText(sock, m.chat, resultText, m)
    }
}