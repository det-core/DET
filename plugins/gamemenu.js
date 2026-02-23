import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['gamemenu'],
    category: 'game',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Game Menu*
┣𖣠 .poll <question>|<option1>,<option2>
┣𖣠 .absen
┣𖣠 .cekabsen
┣𖣠 .topchat
┗━━━━━━━━━━━━━❖`

        await newsletter.sendText(sock, m.chat, menu, m)
    }
}