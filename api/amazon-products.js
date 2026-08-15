const AMAZON_TOKEN_URL = process.env.AMAZON_TOKEN_URL || 'https://api.amazon.co.uk/auth/o2/token';
const AMAZON_API_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems';
const MARKETPLACE = process.env.AMAZON_MARKETPLACE || 'www.amazon.in';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { keywords = '', category = 'All', minPrice, maxPrice, minRating = '4' } = req.query || {};
  const q = String(keywords).trim().slice(0, 160);
  if (!q) return res.status(400).json({ error: 'keywords is required' });

  const { AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET, AMAZON_PARTNER_TAG } = process.env;
  if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET || !AMAZON_PARTNER_TAG) {
    return res.status(503).json({
      error: 'Amazon catalog is not connected yet',
      code: 'AMAZON_CREDENTIALS_MISSING'
    });
  }

  try {
    const tokenResponse = await fetch(AMAZON_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: AMAZON_CLIENT_ID,
        client_secret: AMAZON_CLIENT_SECRET,
        scope: 'creatorsapi::default'
      })
    });
    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      console.error('Amazon token error', tokenResponse.status, detail);
      return res.status(502).json({ error: 'Amazon authentication failed' });
    }
    const token = await tokenResponse.json();

    const payload = {
      keywords: q,
      searchIndex: category,
      partnerTag: AMAZON_PARTNER_TAG,
      marketplace: MARKETPLACE,
      itemCount: 10,
      minReviewsRating: Number(minRating) || 4,
      resources: [
        'images.primary.medium',
        'itemInfo.title',
        'itemInfo.byLineInfo',
        'offersV2.listings.price',
        'offersV2.listings.availability',
        'itemInfo.features'
      ]
    };
    if (minPrice) payload.minPrice = Number(minPrice);
    if (maxPrice) payload.maxPrice = Number(maxPrice);

    const productResponse = await fetch(AMAZON_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
        'x-marketplace': MARKETPLACE
      },
      body: JSON.stringify(payload)
    });
    const data = await productResponse.json();
    if (!productResponse.ok) {
      console.error('Amazon catalog error', productResponse.status, data);
      return res.status(502).json({ error: 'Amazon catalog request failed' });
    }

    const items = (data?.searchResult?.items || []).map(item => {
      const listing = item?.offersV2?.listings?.[0];
      const price = listing?.price;
      return {
        id: item.asin,
        asin: item.asin,
        title: item?.itemInfo?.title?.displayValue || '',
        brand: item?.itemInfo?.byLineInfo?.brand?.displayValue || '',
        image: item?.images?.primary?.medium?.url || '',
        price: price?.amount ?? null,
        currency: price?.currency ?? 'INR',
        availability: listing?.availability?.message || '',
        url: item.detailPageURL || ''
      };
    }).filter(item => item.title && item.url);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ retailer: 'Amazon.in', items });
  } catch (error) {
    console.error('Amazon catalog exception', error);
    return res.status(500).json({ error: 'Catalog service unavailable' });
  }
}
