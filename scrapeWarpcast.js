const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWarpcast(channel = 'nouns-draws') {
  const url = `https://warpcast.com/~/channel/${channel}`;
  console.log('Fetching:', url);
  const { data: html } = await axios.get(url);

  // load HTML into cheerio
  const $ = cheerio.load(html);

  // grab the Next.js data blob
  const nextDataScript = $('#__NEXT_DATA__').html();
  if (!nextDataScript) {
    console.error('❌ __NEXT_DATA__ script not found');
    return [];
  }
  const nextData = JSON.parse(nextDataScript);

  // drill in to the casts array
  const casts = nextData.props.pageProps.feed?.casts || [];

  const results = casts.map(cast => {
    const { author, text, embeds, hash } = cast;
    return {
      username: author.username,
      text: text || '',
      media: (embeds || []).map(e => e.url).filter(u => u),
      link: `https://warpcast.com/${hash}`,
    };
  });

  console.log(JSON.stringify(results, null, 2));
  return results;
}

scrapeWarpcast('nouns-draws').catch(err => {
  console.error(err);
  process.exit(1);
});
