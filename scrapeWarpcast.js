// scrapeWarpcast.js
const axios = require('axios');

async function fetchChannelCasts(channel = 'nouns-draws') {
  const parentUrl = `https://warpcast.com/~/channel/${channel}`;
  const hub        = process.env.HUB_URL || 'https://foss.farchiver.xyz';
  const endpoint   = `${hub}/v1/casts`
                   + `?parentUrl=${encodeURIComponent(parentUrl)}`
                   + `&pageSize=50&reverse=1`;

  console.log('Fetching:', endpoint);
  const res = await axios.get(endpoint);
  const msgs = res.data.messages || [];

  const posts = msgs.map(m => {
    const d = m.data;
    return {
      username: d.author.username,
      text:     d.castAddBody?.text || '',
      media:    (d.embeds || []).map(e => e.url).filter(u => u),
      ts:       d.timestamp,
      link:     `https://warpcast.com/${d.hash}`
    };
  });

  console.log(JSON.stringify(posts, null,2));
}

fetchChannelCasts(process.env.CHANNEL).catch(err => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});
