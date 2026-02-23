const axios = require('axios')

async function vidssave(link) {
  const body = new URLSearchParams({
    auth: '20250901majwlqo',
    domain: 'api-ak.vidssave.com',
    origin: 'source',
    link
  }).toString()

  const res = await axios.post('https://api.vidssave.com/api/contentsite_api/media/parse',
    body,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        origin: 'https://vidssave.com',
        referer: 'https://vidssave.com/'
      }
    }
  )

  return res.data
}

vidssave('https://www.instagram.com/reel/DOuW_Ouj3DR/?igsh=cTAyZzVoeGhlMm12')
.then(console.log)
.catch(console.error)