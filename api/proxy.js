export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { target_url, api_key, api_mode, ...body } = req.body;
    if (!target_url) return res.status(400).json({ error: 'Missing target_url' });

    const headers = { 'Content-Type': 'application/json' };

    if (api_mode === 'anthropic') {
      headers['x-api-key']         = api_key;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${api_key}`;
    }

    const upstream = await fetch(target_url, {
      method:  'POST',
      headers,
      body:    JSON.stringify(body)
    });

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Proxy error', detail: e.message });
  }
}
