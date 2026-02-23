import newsletter from '../Bridge/newsletter.js'
import { runtime } from '../Bridge/utils.js'
import axios from 'axios'

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
        
        const menu = `*KNOX INFO*
> Bot name : *${global.nameBot}*
> Developer : *${global.ownerName}*
> Version : *${global.versionBot}*
> Runtime : *${runtime(uptime)}*
> Status : *${status}*

┏⧉ *Main Menu*
┣𖣠 .ping
┣𖣠 .owner
┣𖣠 .menu
┣𖣠 .runtime
┗━━━━━━━━━━━━━❖

┏⧉ *Download Menu*
┣𖣠 .ytmp3 <url>
┣𖣠 .ytmp4 <url>
┣𖣠 .tiktok <url>
┣𖣠 .instagram <url>
┣𖣠 .facebook <url>
┣𖣠 .mediafire <url>
┣𖣠 .sfile <url>
┣𖣠 .terabox <url>
┣𖣠 .capcut <url>
┣𖣠 .likee <url>
┗━━━━━━━━━━━━━❖

┏⧉ *Music Menu*
┣𖣠 .play <song name>
┣𖣠 .ytmp3 <url>
┣𖣠 .spotify <song>
┣𖣠 .spotplay <song>
┣𖣠 .ttmp3 <url>
┣𖣠 .bass (reply audio)
┣𖣠 .nightcore (reply audio)
┣𖣠 .slow (reply audio)
┣𖣠 .fast (reply audio)
┣𖣠 .earrape (reply audio)
┣𖣠 .deep (reply audio)
┣𖣠 .echo (reply audio)
┣𖣠 .smooth (reply audio)
┣𖣠 .tupai (reply audio)
┣𖣠 .robot (reply audio)
┗━━━━━━━━━━━━━❖

┏⧉ *Image Menu*
┣𖣠 .hd (reply image)
┣𖣠 .hd2 (reply image)
┣𖣠 .removebg (reply image)
┣𖣠 .img2prompt (reply image)
┣𖣠 .faceswap (reply 2 images)
┣𖣠 .unblur (reply image)
┣𖣠 .txt2img <prompt>
┣𖣠 .pins <query>
┣𖣠 .wallpaper <query>
┗━━━━━━━━━━━━━❖

┏⧉ *Video Menu*
┣𖣠 .videoenhancer (reply video)
┣𖣠 .slow (reply video)
┣𖣠 .fast (reply video)
┣𖣠 .reverse (reply video)
┣𖣠 .txt2vid <prompt>
┗━━━━━━━━━━━━━❖

┏⧉ *AI Menu*
┣𖣠 .ai <question>
┣𖣠 .gemini <question>
┣𖣠 .gpt4 <question>
┣𖣠 .deepseek <question>
┣𖣠 .glm4 <question>
┣𖣠 .gita <question>
┗━━━━━━━━━━━━━❖

┏⧉ *Sticker Menu*
┣𖣠 .sticker (reply image/video)
┣𖣠 .toimage (reply sticker)
┣𖣠 .tovideo (reply sticker)
┣𖣠 .togif (reply sticker)
┗━━━━━━━━━━━━━❖

┏⧉ *Group Menu*
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
┣𖣠 .vcf
┣𖣠 .savests (reply status)
┗━━━━━━━━━━━━━❖

┏⧉ *Antilink Menu*
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
┗━━━━━━━━━━━━━❖

┏⧉ *Admin Tools*
┣𖣠 .mute @user <minutes>
┣𖣠 .unmute @user
┣𖣠 .warn @user <reason>
┣𖣠 .listadmin
┣𖣠 .listantilink
┣𖣠 .delete (reply)
┣𖣠 .pin (reply)
┣𖣠 .cekonline
┣𖣠 .poll <question>|<options>
┗━━━━━━━━━━━━━❖

┏⧉ *Owner Menu*
┣𖣠 .addowner @user
┣𖣠 .removeowner @user
┣𖣠 .addadmin @user
┣𖣠 .removeadmin @user
┣𖣠 .addreseller @user
┣𖣠 .removereseller @user
┣𖣠 .broadcast <message>
┣𖣠 .cleardb
┣𖣠 .block @user
┣𖣠 .unblock @user
┣𖣠 .blocklist
┣𖣠 .update
┣𖣠 .autoupdate
┣𖣠 .gitpull
┣𖣠 .restart
┣𖣠 .shutdown
┗━━━━━━━━━━━━━❖

┏⧉ *CPanel Menu*
┣𖣠 .cpanel name|size
┣𖣠 .listpanel
┣𖣠 .delpanel <id>
┣𖣠 .buypanel
┣𖣠 .adminpanel
┗━━━━━━━━━━━━━❖

┏⧉ *Stalker Menu*
┣𖣠 .igstalk <username>
┣𖣠 .ttstalk <username>
┣𖣠 .ghstalk <username>
┣𖣠 .ipwho <ip>
┣𖣠 .lookup <domain>
┣𖣠 .wastalk <number>
┣𖣠 .discordstalk <userid>
┣𖣠 .robloxstalk <username>
┣𖣠 .pintereststalk <username>
┣𖣠 .ffstalk <id>
┣𖣠 .ytstalk <channel>
┗━━━━━━━━━━━━━❖

┏⧉ *Search Menu*
┣𖣠 .film <title>
┣𖣠 .manga <title>
┣𖣠 .dramabox <title>
┣𖣠 .apkmod <app>
┣𖣠 .apkpure <app>
┣𖣠 .npm <package>
┣𖣠 .cnnnews
┗━━━━━━━━━━━━━❖`

        // Try to send with image if available
        if (global.img && global.img.menu) {
            try {
                const response = await axios.get(global.img.menu, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, menu, m)
                
                // Send menu music if available
                if (global.music && global.music.menu) {
                    try {
                        const musicResponse = await axios.get(global.music.menu, { responseType: 'arraybuffer' })
                        const musicBuffer = Buffer.from(musicResponse.data)
                        await sock.sendMessage(m.chat, {
                            audio: musicBuffer,
                            mimetype: 'audio/mpeg',
                            ptt: false
                        })
                    } catch (musicError) {
                        // Ignore music errors
                    }
                }
            } catch {
                await newsletter.sendText(sock, m.chat, menu, m)
            }
        } else {
            await newsletter.sendText(sock, m.chat, menu, m)
        }
    }
}