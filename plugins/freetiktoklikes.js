const axios = require('axios')

async function freetiktoklike(url) {
  const page = await axios.get('https://leofame.com/free-tiktok-likes')
  const html = page.data
  const tokenMatch = html.match(/var\s+token\s*=\s*'([^']+)'/)
  const token = tokenMatch[1]
  const cookies = page.headers['set-cookie']
    .map(v => v.split(';')[0])
    .join('; ')

  const res = await axios.post('https://leofame.com/free-tiktok-likes?api=1',
    new URLSearchParams({
      token,
      timezone_offset: 'Asia/Jakarta',
      free_link: url
    }).toString(),
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://leofame.com',
        'Referer': 'https://leofame.com/free-tiktok-likes',
        'Cookie': cookies
      }
    }
  )

  return res.data
}

freetiktoklike('https://vt.tiktok.com/ZSaRyk39b/')
.then(console.log)
.catch(console.error)