const axios = require('axios');

async function fetchChannelCasts(channel = 'nouns-draws') {
  const channelUrl = `https://warpcast.com/~/channel/${channel}`;
  const hubBase   = 'https://foss.farchiver.xyz';
  // Here we pass fid=1 (any valid Farcaster ID, e.g. the original Nouns bot)
  const endpoint  = `${hubBase}/v1/castsByParent?fid=1&url=${encodeURIComponent(channelUrl)}`;

  console.log('Fetching:', endpoint);
  const { data } = await axios.get(endpoint);

  const msgs = data.messages || [];
  const results = msgs.map(m => {
    const d = m.data;
    return {
      username:  d.author.username,
      text:      (d.castAddBody?.text || '').trim(),
      media:     (d.embeds || []).map(e => e.url).filter(u => u),
      timestamp: d.timestamp,
      link:      `https://warpcast.com/${d.hash}`,
    };
  });

  console.log(JSON.stringify(results, null, 2));
  return results;
}

fetchChannelCasts(process.env.CHANNEL || 'nouns-draws')
  .catch(err => { console.error(err); process.exit(1); });
