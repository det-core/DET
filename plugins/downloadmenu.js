import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['downloadmenu'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Download Menu*
┣𖣠 .ytmp3 <url>
┣𖣠 .ytmp4 <url>
┣𖣠 .tiktok <url>
┣𖣠 .instagram <url>
┣𖣠 .facebook <url>
┣𖣠 .mediafire <url>
┣𖣠 .sfile <url>
┣𖣠 .githubdl <user>/<repo>
┣𖣠 .terabox <url>
┣𖣠 .capcut <url>
┣𖣠 .likee <url>
┣𖣠 .cocofun <url>
┣𖣠 .pindl <url>
┣𖣠 .xdownload <url>
┗━━━━━━━━━━━━━❖`

        if (global.img && global.img.download) {
            try {
                const response = await axios.get(global.img.download, { responseType: 'arraybuffer' })
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