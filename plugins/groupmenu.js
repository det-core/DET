import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

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
┣𖣠 .linkgc
┣𖣠 .resetlinkgc
┣𖣠 .setnamegc <name>
┣𖣠 .setdeskgc <desc>
┣𖣠 .setppgc (reply image)
┣𖣠 .delppgc
┣𖣠 .close
┣𖣠 .open
┣𖣠 .tagall <message>
┣𖣠 .hidetag2 <message>
┣𖣠 .totag (reply)
┣𖣠 .welcome on/off
┣𖣠 .goodbye on/off
┣𖣠 .antilink on/off
┣𖣠 .antilinkall on/off
┣𖣠 .antitoxic on/off
┣𖣠 .antimedia on/off
┣𖣠 .antisticker on/off
┣𖣠 .antidocument on/off
┣𖣠 .antibot on/off
┣𖣠 .antiremove on/off
┣𖣠 .antitagsw on/off
┣𖣠 .antispam on/off
┣𖣠 .slowmode on/off
┣𖣠 .mute @user <minutes>
┣𖣠 .unmute @user
┣𖣠 .warn @user <reason>
┣𖣠 .listadmin
┣𖣠 .listantilink
┣𖣠 .delete (reply)
┣𖣠 .pin (reply)
┣𖣠 .cekonline
┗━━━━━━━━━━━━━❖`

        if (global.img && global.img.group) {
            try {
                const response = await axios.get(global.img.group, { responseType: 'arraybuffer' })
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