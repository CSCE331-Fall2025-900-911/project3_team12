import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple proxy to OpenWeather's Current Weather API
// Query params: ?city=College+Station or ?lat=..&lon=..
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.WEATHER_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing WEATHER_API_KEY' });

  const { city, lat, lon } = req.query as Record<string, string>;
  let url: string;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${encodeURIComponent(key)}`;
  } else {
    const q = city ? city : 'College Station';
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=imperial&appid=${encodeURIComponent(key)}`;
  }

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt);
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('weather proxy error', err);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
}
