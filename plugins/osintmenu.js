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
┣𖣠 .ipstalk <ip>
┣𖣠 .numbertrack <e.g 234xxx>
┗━━━━━━━━━━━━━❖`

        await sock.sendMessage(m.chat, {
            image: { url: global.img.osint },
            caption: menu
        }, { quoted: m })
    }
}