// Message handler utilities
const msgUtils = {
    // Parse mentioned JIDs from message
    getMentions: (message) => {
        const mentions = []
        if (message.mentionedJid) mentions.push(...message.mentionedJid)
        if (message.participant) mentions.push(message.participant)
        return mentions
    },

    // Get message type
    getType: (message) => {
        if (!message) return null
        const type = Object.keys(message)[0]
        return type
    },

    // Check if message is media
    isMedia: (message) => {
        const type = msgUtils.getType(message)
        return ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(type)
    },

    // Get caption from message
    getCaption: (message) => {
        const type = msgUtils.getType(message)
        if (!type) return ''
        return message[type]?.caption || message[type]?.text || ''
    },

    // Extract quoted message
    getQuoted: (message) => {
        return message?.extendedTextMessage?.contextInfo?.quotedMessage || null
    },

    // Get quoted participant
    getQuotedParticipant: (message) => {
        return message?.extendedTextMessage?.contextInfo?.participant || null
    },

    // Check if message is from bot
    isFromBot: (message, botId) => {
        const sender = message.key?.participant || message.key?.remoteJid
        return sender === botId || message.key?.fromMe
    },

    // Get message text content
    getText: (message) => {
        const type = msgUtils.getType(message)
        if (!type) return ''
        
        if (type === 'conversation') return message.conversation
        if (type === 'extendedTextMessage') return message.extendedTextMessage.text
        if (type === 'imageMessage') return message.imageMessage.caption
        if (type === 'videoMessage') return message.videoMessage.caption
        if (type === 'documentMessage') return message.documentMessage.caption
        
        return ''
    }
}

module.exports = msgUtils