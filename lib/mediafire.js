import axios from 'axios'
import * as cheerio from 'cheerio'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.mediafire.com/',
  'Upgrade-Insecure-Requests': '1'
}

export async function mediafiredl(url) {
  try {
    const res = await axios.get(url, {headers, maxRedirects: 5 })
    const $ = cheerio.load(res.data)
    const download = $('#downloadButton').attr('href') || $('a.input.popsok').attr('href')
    const filename = $('.dl-btn-label').first().text().trim() || $('.filename').text().trim()
    const filesize = $('.details li').first().find('span').text().trim()
    const uploaded = $('.details li').eq(1).find('span').text().trim()
    
    return {
      filename: filename || 'Unknown',
      filesize: filesize || 'Unknown',
      uploaded: uploaded || 'Unknown',
      download: download || null
    }
  } catch (error) {
    console.error('Mediafire error:', error)
    return null
  }
}