const axios = require('axios')

function toAppleMusicUrl(trackViewUrl, trackId) {
  if (!trackViewUrl) return null
  try {
    const u = new URL(trackViewUrl)
    const origin = 'https://music.apple.com'
    const path = u.pathname
    const params = new URLSearchParams()
    if (trackId) params.set('i', String(trackId))
    params.set('uo', '4')
    return `${origin}${path}?${params.toString()}`
  } catch {
    return null
  }
}

async function searchAppleMusic(query) {
  const response = await axios({
    method: 'GET',
    url: 'https://itunes.apple.com/search',
    params: {
      term: query,
      media: 'music',
      entity: 'song',
      limit: 5
    }
  })

  const songs = (response.data.results || []).map(item => ({
    trackId: item.trackId || null,
    title: item.trackName || null,
    artist: item.artistName || null,
    album: item.collectionName || null,
    previewUrl: item.previewUrl || null,
    appleUrl:
      toAppleMusicUrl(item.trackViewUrl, item.trackId) ||
      item.trackViewUrl ||
      null
  }))

  return {
    status: true,
    source: 'apple-music',
    query,
    total: songs.length,
    result: songs
  }
}

(async () => {
  try {
    const query = process.argv[2] || 'monolog'
    const data = await searchAppleMusic(query)

    console.log(JSON.stringify(data, null, 2))
  } catch (e) {
    console.log(
      JSON.stringify(
        {
          status: false,
          error: e.message
        },
        null,
        2
      )
    )
  }
})()