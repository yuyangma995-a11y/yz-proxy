export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { target_url, ...body } = req.body;
  if (!target_url) return res.status(400).json({ error: 'Missing target_url' });

  const authHeader = req.headers['authorization'] || '';
  const apiKey     = req.headers['x-api-key'] || '';
  const antVer     = req.headers['anthropic-version'] || '';

  const headers = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization']     = authHeader;
  if (apiKey)     headers['x-api-key']         = apiKey;
  if (antVer)     headers['anthropic-version'] = antVer;

  try {
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
