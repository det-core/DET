const axios = require('axios')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Download file from URL
async function downloadFromUrl(url, destPath) {
    const writer = fs.createWriteStream(destPath)
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 300000
    })
    
    response.data.pipe(writer)
    
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

// Get random element from array
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}

// Format number to short format (1K, 1M, etc)
function formatNumber(num) {
    if (!num) return '0'
    const n = parseInt(num)
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
}

// Format duration seconds to MM:SS
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Generate random string
function randomString(length = 10) {
    return crypto.randomBytes(length).toString('hex').slice(0, length)
}

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if URL is valid
function isValidUrl(string) {
    try {
        new URL(string)
        return true
    } catch {
        return false
    }
}

// Get file extension from URL or string
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase()
}

// Clean string from special characters
function cleanString(str) {
    return str.replace(/[^\w\s]/gi, '')
}

module.exports = {
    downloadFromUrl,
    randomElement,
    formatNumber,
    formatDuration,
    randomString,
    sleep,
    isValidUrl,
    getFileExtension,
    cleanString
}