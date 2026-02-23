import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['osintmenu'],
    category: 'osint',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Osint Menu*
┣𖣠 .igstalk <username>
┣𖣠 .ttstalk <username>
┣𖣠 .ghstalk <username>
┣𖣠 .npmstalk <package>
┣𖣠 .ipwho <ip>
┣𖣠 .lookup <domain>
┣𖣠 .wastalk <number>
┣𖣠 .discordstalk <userid>
┣𖣠 .robloxstalk <username>
┣𖣠 .pintereststalk <username>
┣𖣠 .ffstalk <id>
┣𖣠 .ytstalk <channel>
┗━━━━━━━━━━━━━❖`

        if (global.img && global.img.osint) {
            try {
                const response = await axios.get(global.img.osint, { responseType: 'arraybuffer' })
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