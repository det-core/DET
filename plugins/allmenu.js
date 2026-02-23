import newsletter from '../Bridge/newsletter.js'
import { runtime } from '../Bridge/utils.js'

export default {
    command: ['allmenu', 'menu', 'knox'],
    category: 'main',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const uptime = process.uptime()
        const status = m.isOwner ? 'Owner' : m.isReseller ? 'Reseller' : 'User'
        
        const menu = `*KNOX*
> Bot name : *KNOX MD*
> Developer : *${global.ownerName}*
> Version : *1.0.0*
> Runtime : *${runtime(uptime)}*
> Status : *${status}*

┏⧉ *Available Menus*
┣𖣠 .allmenu
┣𖣠 .convertmenu
┣𖣠 .gamemenu
┣𖣠 .searchmenu
┣𖣠 .cpanelmenu
┣𖣠 .downloadmenu
┣𖣠 .gitmenu
┣𖣠 .groupmenu
┣𖣠 .osintmenu 
┗━━━━━━━━━❖`

        await newsletter.sendText(sock, m.chat, menu, m)
    }
}