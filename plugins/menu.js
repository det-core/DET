// plugins/main.js
export default {
    command: ["menu", "help", "downloadmenu", "gitmenu", "groupmenu", "osintmenu", "cpanelmenu", "allmenu", "knox"],
    category: "main",
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply, command, sender, pushName } = m
        
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor(uptime / 3600) % 24
        const minutes = Math.floor(uptime / 60) % 60
        const seconds = Math.floor(uptime % 60)
        const runtime = `${days}d ${hours}h ${minutes}m ${seconds}s`
        
        const status = m.isOwner ? "Owner" : m.isReseller ? "Reseller" : "User"
        
        if (command === "downloadmenu") {
            const menu = `┏⧉ *Download Menu*
┣𖣠 .ytmp3
┣𖣠 .ytmp4
┣𖣠 .tiktok
┣𖣠 .instagram
┣𖣠 .facebook
┗━━━━━━━━━━━━━❖`
            return sock.sendMessage(m.chat, { image: { url: global.img.download }, caption: menu }, { quoted: m })
        }
        
        if (command === "gitmenu") {
            const menu = `┏⧉ *Git Menu*
┣𖣠 .clone
┣𖣠 .repo
┣𖣠 .gitpull
┗━━━━━━━━━━━━━❖`
            return sock.sendMessage(m.chat, { image: { url: global.img.git }, caption: menu }, { quoted: m })
        }
        
        if (command === "groupmenu") {
            const menu = `┏⧉ *Group Menu*
┣𖣠 .add
┣𖣠 .kick
┣𖣠 .promote
┣𖣠 .demote
┣𖣠 .groupinfo
┗━━━━━━━━━━━━━❖`
            return sock.sendMessage(m.chat, { image: { url: global.img.group }, caption: menu }, { quoted: m })
        }
        
        if (command === "osintmenu") {
            const menu = `┏⧉ *Osint Menu*
┣𖣠 .igstalk
┣𖣠 .ttstalk
┣𖣠 .ghstalk
┣𖣠 .npmstalk
┗━━━━━━━━━━━━━❖`
            return sock.sendMessage(m.chat, { image: { url: global.img.osint }, caption: menu }, { quoted: m })
        }
        
        if (command === "cpanelmenu") {
            const menu = `┏⧉ *CPanel Menu*
┣𖣠 .cpanel
┣𖣠 .listpanel
┣𖣠 .delpanel
┣𖣠 .buypanel
┣𖣠 .adminpanel
┗━━━━━━━━━━━━━❖`
            return sock.sendMessage(m.chat, { image: { url: global.img.cpanel }, caption: menu }, { quoted: m })
        }
        
        if (command === "allmenu" || command === "knox") {
            const menu = `*KNOX INFO*
> Bot name : *KNOX MD*
> Developer : *${global.ownerName}*
> Version : *1.0.0*
> Runtime : *${runtime}*
> Status : *${status}*

┏⧉ *Main Menu*
┣𖣠 .ping
┣𖣠 .owner
┣𖣠 .menu

┏⧉ *CPanel Menu*
┣𖣠 .cpanel
┣𖣠 .listpanel
┣𖣠 .delpanel
┣𖣠 .buypanel
┣𖣠 .adminpanel

┏⧉ *Download Menu*
┣𖣠 .ytmp3
┣𖣠 .ytmp4
┣𖣠 .tiktok
┣𖣠 .instagram
┣𖣠 .facebook

┏⧉ *Git Menu*
┣𖣠 .clone
┣𖣠 .repo
┣𖣠 .gitpull

┏⧉ *Group Menu*
┣𖣠 .add
┣𖣠 .kick
┣𖣠 .promote
┣𖣠 .demote
┣𖣠 .groupinfo

┏⧉ *Osint Menu*
┣𖣠 .igstalk
┣𖣠 .ttstalk
┣𖣠 .ghstalk
┣𖣠 .npmstalk

┗━━━━━━━━━━━━━❖`

            await sock.sendMessage(m.chat, {
                image: { url: global.img.menu },
                caption: menu
            }, { quoted: m })
            
            await sock.sendMessage(m.chat, {
                audio: { url: global.music.menu },
                mimetype: "audio/mp4",
                ptt: true
            }, { quoted: m })
        }
    }
}