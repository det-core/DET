// EXIF data utilities for stickers
const exifUtils = {
    // Create sticker metadata
    createMetadata: (packname, author) => {
        return {
            'sticker-pack-id': 'com.knox.sticker',
            'sticker-pack-name': packname || 'KNOX MD',
            'sticker-pack-publisher': author || 'CODEBREAKER',
            'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.whatsapp',
            'ios-app-store-link': 'https://apps.apple.com/us/app/whatsapp-messenger/id310633997'
        }
    },

    // Build EXIF buffer
    buildExif: (metadata) => {
        const exif = [0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]
        const json = JSON.stringify(metadata)
        const jsonBuffer = Buffer.from(json, 'utf8')
        
        return Buffer.concat([Buffer.from(exif), jsonBuffer])
    },

    // Extract metadata from EXIF
    extractMetadata: (buffer) => {
        try {
            const jsonStart = 14 // EXIF header length
            const jsonString = buffer.toString('utf8', jsonStart)
            return JSON.parse(jsonString)
        } catch {
            return null
        }
    }
}

module.exports = exifUtils