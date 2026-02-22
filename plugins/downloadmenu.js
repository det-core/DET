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
┗━━━━━━━━━━━━━❖`

        await sock.sendMessage(m.chat, {
            image: { url: global.img.download },
            caption: menu
        }, { quoted: m })
    }
}