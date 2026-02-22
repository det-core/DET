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

        await sock.sendMessage(m.chat, {
            image: { url: global.img.cpanel },
            caption: menu
        }, { quoted: m })
    }
}