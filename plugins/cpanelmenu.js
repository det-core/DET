import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['cpanelmenu'],
    category: 'cpanel',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *CPanel Menu*
┣𖣠 .cpanel name|size
┣𖣠 .listpanel
┣𖣠 .delpanel <id>
┣𖣠 .buypanel
┣𖣠 .adminpanel
┗━━━━━━━━━━━━━❖`

        if (global.img && global.img.cpanel) {
            try {
                const response = await axios.get(global.img.cpanel, { responseType: 'arraybuffer' })
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