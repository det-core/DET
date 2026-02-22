export default {
    command: ['groupmenu'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Group Menu*
┣𖣠 .add @user
┣𖣠 .kick @user
┣𖣠 .promote @user
┣𖣠 .demote @user
┣𖣠 .groupinfo
┗━━━━━━━━━━━━━❖`

        await sock.sendMessage(m.chat, {
            image: { url: global.img.group },
            caption: menu
        }, { quoted: m })
    }
}