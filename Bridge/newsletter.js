// Newsletter context utility for Knox
const newsletterContext = {
    // Default Knox newsletter info
    knox: {
        jid: '120363161513685998@newsletter',
        name: 'Knox By CODEBREAKER'
    },
    
    // Create context info for messages
    createContext: (newsletterJid = null, newsletterName = null) => {
        return {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid || newsletterContext.knox.jid,
                newsletterName: newsletterName || newsletterContext.knox.name,
                serverMessageId: -1
            }
        }
    },
    
    // Send image with newsletter context
    sendImage: async (sock, chatId, imageBuffer, caption, quoted = null) => {
        try {
            return await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: caption,
                contextInfo: newsletterContext.createContext()
            }, { quoted })
        } catch (error) {
            // Fallback without context if newsletter fails
            return await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: caption
            }, { quoted })
        }
    },
    
    // Send text with newsletter context
    sendText: async (sock, chatId, text, quoted = null) => {
        try {
            return await sock.sendMessage(chatId, {
                text: text,
                contextInfo: newsletterContext.createContext()
            }, { quoted })
        } catch (error) {
            // Fallback without context
            return await sock.sendMessage(chatId, {
                text: text
            }, { quoted })
        }
    },
    
    // Send video with newsletter context
    sendVideo: async (sock, chatId, videoBuffer, caption = '', quoted = null) => {
        try {
            return await sock.sendMessage(chatId, {
                video: videoBuffer,
                caption: caption,
                contextInfo: newsletterContext.createContext()
            }, { quoted })
        } catch (error) {
            return await sock.sendMessage(chatId, {
                video: videoBuffer,
                caption: caption
            }, { quoted })
        }
    },
    
    // Send audio with newsletter context
    sendAudio: async (sock, chatId, audioBuffer, ptt = false, quoted = null) => {
        try {
            return await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: ptt,
                contextInfo: newsletterContext.createContext()
            }, { quoted })
        } catch (error) {
            return await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: ptt
            }, { quoted })
        }
    },
    
    // Send document with newsletter context
    sendDocument: async (sock, chatId, documentBuffer, fileName, caption = '', quoted = null) => {
        try {
            return await sock.sendMessage(chatId, {
                document: documentBuffer,
                fileName: fileName,
                caption: caption,
                contextInfo: newsletterContext.createContext()
            }, { quoted })
        } catch (error) {
            return await sock.sendMessage(chatId, {
                document: documentBuffer,
                fileName: fileName,
                caption: caption
            }, { quoted })
        }
    },
    
    // Send album with newsletter context
    sendAlbum: async (sock, chatId, mediaList, quoted = null) => {
        try {
            const { generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } = await import('@whiskeysockets/baileys')
            const crypto = await import('crypto')
            
            const opener = generateWAMessageFromContent(
                chatId,
                {
                    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                    albumMessage: {
                        expectedImageCount: mediaList.filter(m => m.image).length,
                        expectedVideoCount: mediaList.filter(m => m.video).length
                    }
                },
                {
                    userJid: jidNormalizedUser(sock.user.id),
                    quoted: quoted,
                    upload: sock.waUploadToServer
                }
            )
            
            await sock.relayMessage(opener.key.remoteJid, opener.message, {
                messageId: opener.key.id
            })
            
            for (const content of mediaList) {
                content.contextInfo = newsletterContext.createContext()
                const msg = await generateWAMessage(
                    opener.key.remoteJid,
                    content,
                    { upload: sock.waUploadToServer }
                )
                
                msg.message.messageContextInfo = {
                    messageSecret: crypto.randomBytes(32),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: opener.key
                    }
                }
                
                await sock.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                })
            }
            
            return true
        } catch (error) {
            // Fallback: send individually without album
            for (const content of mediaList) {
                if (content.image) {
                    await sock.sendMessage(chatId, {
                        image: content.image,
                        caption: content.caption || ''
                    }, { quoted })
                } else if (content.video) {
                    await sock.sendMessage(chatId, {
                        video: content.video,
                        caption: content.caption || ''
                    }, { quoted })
                }
            }
            return false
        }
    }
}

export default newsletterContext