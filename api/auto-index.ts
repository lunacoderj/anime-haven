const INDEXNOW_KEY = 'a78f219c63b44e05b38d9f1234abcd56';
const HOST = 'animeworlddata.com';
const BASE_URL = 'https://animeworlddata.com';

export default async function handler(req: any, res: any) {
  try {
    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/anime`,
      `${BASE_URL}/manga`,
      `${BASE_URL}/chat`
    ];

    const results: any = {
      submittedUrls: urls,
      indexNow: null,
      sitemapPings: []
    };

    // 1. IndexNow API Broadcast
    try {
      const indexNowPayload = {
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls
      };

      const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload)
      });

      results.indexNow = {
        status: indexNowRes.status,
        ok: indexNowRes.ok
      };
    } catch (e: any) {
      results.indexNow = { error: e.message };
    }

    // 2. Google & Bing Sitemap Pings
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const pingEndpoints = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ];

    for (const pingUrl of pingEndpoints) {
      try {
        const pingRes = await fetch(pingUrl);
        results.sitemapPings.push({ url: pingUrl, status: pingRes.status, ok: pingRes.ok });
      } catch (err: any) {
        results.sitemapPings.push({ url: pingUrl, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully broadcast ${urls.length} URLs to search engine indexing bots.`,
      results
    });
  } catch (error: any) {
    console.error('Auto-index error:', error);
    return res.status(500).json({ error: error.message });
  }
}
