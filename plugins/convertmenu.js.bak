import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['convertmenu', 'convmenu'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const menu = `┏⧉ *Convert Menu*
┣𖣠 .hd (reply image)
┣𖣠 .hd2 (reply image)
┣𖣠 .removebg (reply image)
┣𖣠 .img2prompt (reply image)
┣𖣠 .faceswap (reply 2 images)
┣𖣠 .unblur (reply image)
┣𖣠 .videoenhancer (reply video)
┣𖣠 .slow (reply video/audio)
┣𖣠 .fast (reply video/audio)
┣𖣠 .reverse (reply video/audio)
┣𖣠 .bass (reply audio)
┣𖣠 .earrape (reply audio)
┣𖣠 .nightcore (reply audio)
┣𖣠 .deep (reply audio)
┣𖣠 .blown (reply audio)
┣𖣠 .echo (reply audio)
┣𖣠 .smooth (reply audio)
┣𖣠 .tupai (reply audio)
┣𖣠 .robot (reply audio)
┣𖣠 .mconverter <format> (reply file)
┗━━━━━━━━━━━━━❖`

        await newsletter.sendText(sock, m.chat, menu, m)
    }
}