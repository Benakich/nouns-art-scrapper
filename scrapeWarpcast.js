// scrapeWarpcast.js
const axios = require('axios');

async function fetchChannelCasts(channel = 'nouns-draws') {
  const ENDPOINT = 'https://hub.dwr.dev/graphql';
  const query = `
    query {
      castsByChannel(channelId: "${channel}", limit: 20) {
        messages {
          hash
          data {
            author { username }
            castAddBody { text }
            embeds { url }
            timestamp
          }
        }
      }
    }
  `;

  console.log('Querying GraphQL:', channel);
  const { data } = await axios.post(ENDPOINT, { query }, {
    headers: { 'Content-Type': 'application/json' }
  });

  const msgs = data.data.castsByChannel.messages || [];
  const results = msgs.map(m => {
    const d = m.data;
    return {
      username:  d.author.username,
      text:      (d.castAddBody?.text || '').trim(),
      media:     (d.embeds || []).map(e => e.url).filter(u=>u),
      timestamp: d.timestamp,
      link:      `https://warpcast.com/${m.hash}`,
    };
  });

  console.log(JSON.stringify(results, null,2));
}

fetchChannelCasts(process.env.CHANNEL || 'nouns-draws')
  .catch(err => { console.error(err); process.exit(1); });
