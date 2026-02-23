import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['searchmenu'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Search Menu*
┣𖣠 .film <title>
┣𖣠 .manga <title>
┣𖣠 .dramabox <title>
┣𖣠 .apkmod <app>
┣𖣠 .apkpure <app>
┣𖣠 .melolo <title>
┣𖣠 .npm <package>
┣𖣠 .cnnnews
┣𖣠 .wallpaper <query>
┣𖣠 .pins <query>
┗━━━━━━━━━━━━━❖`

        await newsletter.sendText(sock, m.chat, menu, m)
    }
}