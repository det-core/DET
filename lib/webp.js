const fs = require('fs')
const { exec } = require('child_process')
const { promisify } = require('util')
const path = require('path')

const execAsync = promisify(exec)

// WebP conversion utilities
const webpUtils = {
    // Convert image to WebP sticker
    imageToWebp: async (inputPath, outputPath) => {
        const cmd = `ffmpeg -y -i "${inputPath}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(512-iw)/2:(512-ih)/2:color=#00000000" -vcodec libwebp -lossless 1 -q:v 70 -preset default -loop 0 -an -vsync 0 "${outputPath}"`
        
        try {
            await execAsync(cmd, { timeout: 30000 })
            return fs.existsSync(outputPath)
        } catch {
            return false
        }
    },

    // Convert video to WebP sticker
    videoToWebp: async (inputPath, outputPath, fps = 10) => {
        const cmd = `ffmpeg -y -i "${inputPath}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(512-iw)/2:(512-ih)/2:color=#00000000,fps=${fps}" -vcodec libwebp -lossless 0 -q:v 70 -preset default -loop 0 -an -vsync 0 "${outputPath}"`
        
        try {
            await execAsync(cmd, { timeout: 60000 })
            return fs.existsSync(outputPath)
        } catch {
            return false
        }
    },

    // Convert WebP to image
    webpToImage: async (inputPath, outputPath) => {
        const cmd = `ffmpeg -y -i "${inputPath}" -vframes 1 "${outputPath}"`
        
        try {
            await execAsync(cmd, { timeout: 30000 })
            return fs.existsSync(outputPath)
        } catch {
            return false
        }
    },

    // Add metadata to WebP
    addMetadata: async (webpPath, packname, author) => {
        const exif = require('./exif')
        const metadata = exif.createMetadata(packname, author)
        const exifBuffer = exif.buildExif(metadata)
        
        const exifPath = webpPath + '.exif'
        fs.writeFileSync(exifPath, exifBuffer)
        
        const outputPath = webpPath.replace('.webp', '_with_meta.webp')
        const cmd = `webpmux -set exif "${exifPath}" "${webpPath}" -o "${outputPath}"`
        
        try {
            await execAsync(cmd, { timeout: 30000 })
            fs.unlinkSync(exifPath)
            return outputPath
        } catch {
            fs.unlinkSync(exifPath)
            return webpPath
        }
    }
}

module.exports = webpUtils