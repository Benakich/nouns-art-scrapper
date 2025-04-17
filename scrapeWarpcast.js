// scrapeWarpcast.js
const { HubRestAPIClient } = require('@standard-crypto/farcaster-js-hub-rest');

async function fetchChannelCasts(channel = 'nouns-draws') {
  // 1) instantiate pointing at a known‑good public hub
  const client = new HubRestAPIClient({
    hubUrl: 'https://nemes.farcaster.xyz:2281',
  });

  // 2) call the convenience method for castsByChannel
  console.log(`Querying casts for channel "${channel}"…`);
  const resp = await client.apis.casts.getCastsByChannel({
    channelId: channel,
    limit: 20,
  });

  // 3) marshal out the fields we care about
  const posts = (resp.messages || []).map(m => {
    const d = m.data;
    return {
      username:  d.author.username,
      text:      d.castAddBody?.text || '',
      media:     (d.embeds || []).map(e => e.url).filter(u => u),
      timestamp: d.timestamp,
      link:      `https://warpcast.com/${m.hash}`,
    };
  });

  console.log(JSON.stringify(posts, null,2));
  return posts;
}

// entrypoint: read CHANNEL from env or default
fetchChannelCasts(process.env.CHANNEL)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
