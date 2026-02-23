import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['gitmenu'],
    category: 'git',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Git Menu*
┣𖣠 .githubdl <user>/<repo>
┣𖣠 .githubstalk <username>
┣𖣠 .npm <package>
┗━━━━━━━━━━━━━❖`

        if (global.img && global.img.git) {
            try {
                const response = await axios.get(global.img.git, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, menu, m)
            } catch {
                await newsletter.sendText(sock, m.chat, menu, m)
            }
        } else {
            await newsletter.sendText(sock, m.chat, menu, m)
        }
    }
}