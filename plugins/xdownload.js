const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('querystring')

async function savetwt(url) {
  const base = 'https://savetwt.com'
  const headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
  }

  const home = await axios.get(base, { headers })
  const $ = cheerio.load(home.data)

  const token = $('input[name="_token"]').val()
  if (!token) throw new Error('Token tidak ditemukan')

  const cookies = home.headers['set-cookie'].map(v => v.split(';')[0]).join('; ')

  const post = await axios.post(
    base + '/download',
    qs.stringify({
      _token: token,
      locale: 'en',
      url: url
    }),
    {
      headers: {
        ...headers,
        'content-type': 'application/x-www-form-urlencoded',
        'origin': base,
        'referer': base + '/',
        'cookie': cookies
      },
      maxRedirects: 0,
      validateStatus: s => s < 500
    }
  )

  const $$ = cheerio.load(post.data)

  let results = []

  $$('a').each((i, el) => {
    const href = $$(el).attr('href')
    if (href && href.includes('/savetwt/proxy/')) {
      results.push({
        type: 'video',
        url: href.startsWith('http') ? href : 'https://myapi.app' + href
      })
    }
  })

  return {
    status: true,
    source: 'savetwt',
    result: results
  }
}

(async () => {
  try {
    const data = await savetwt('https://x.com/FCBarcelona_es/status/1977041749013909999?t=2TC-EzPCriYsGfTT8tNyBQ&s=19')
    console.log(JSON.stringify(data, null, 2))
  } catch (e) {
    console.log(JSON.stringify({
      status: false,
      error: e.message
    }, null, 2))
  }
})()