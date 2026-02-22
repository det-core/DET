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
┣𖣠 .clone <url>
┣𖣠 .repo
┣𖣠 .gitpull
┗━━━━━━━━━━━━━❖`

        await sock.sendMessage(m.chat, {
            image: { url: global.img.git },
            caption: menu
        }, { quoted: m })
    }
}