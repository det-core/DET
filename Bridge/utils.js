function runtime(seconds) {
    seconds = Number(seconds)
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor(seconds % (3600 * 24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d ${h}h ${m}m ${s}s`
}

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

function isUrl(string) {
    try {
        new URL(string)
        return true
    } catch {
        return false
    }
}

function isNumber(string) {
    return /^\d+$/.test(string)
}

function isGroupChat(jid) {
    return jid.endsWith('@g.us')
}

function isPrivateChat(jid) {
    return jid.endsWith('@s.whatsapp.net')
}

function extractNumberFromJid(jid) {
    return jid.split('@')[0]
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getRandomFileName(extension = '') {
    return Math.random().toString(36).substring(2, 15) + (extension ? '.' + extension : '')
}

export { 
    runtime, 
    formatSize, 
    formatTime, 
    isUrl, 
    isNumber, 
    isGroupChat, 
    isPrivateChat, 
    extractNumberFromJid,
    sleep,
    getRandomFileName
}