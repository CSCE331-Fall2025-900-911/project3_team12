import { Button } from './ui/button';
import logo from 'figma:asset/b5d7481338868fab8060868bddef0f79048a537c.png';
import { useEffect, useState } from 'react';

type Weather = {
  name: string;
  main?: { temp: number };
  weather?: { description: string; icon: string }[];
};

interface WelcomeScreenProps {
  onStartOrder: () => void;
}

export function WelcomeScreen({ onStartOrder }: WelcomeScreenProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Prefer explicit VITE_API_URL, but fall back to localhost server during development
        const envUrl = import.meta.env.VITE_API_URL;
        const isLocalhost = (typeof window !== 'undefined') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const base = envUrl || (isLocalhost ? 'http://localhost:3001/api' : '/api');
        // No city param: backend defaults to College Station
        const res = await fetch(`${base}/weather`);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('weather response not ok', res.status, txt);
          setError(`Weather API error: ${res.status} ${txt}`);
          return;
        }
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error('weather load error', e);
        setError('Failed to load weather (network error)');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-yellow-50 flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-primary">
            <img src={logo} alt="Machamp Tea House Logo" className="w-64 h-auto" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl text-primary">
            Welcome to Machamp Tea House
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">
            {loading && <span>Loading weather...</span>}
            {error && <span className="text-red-600">{error}</span>}
            {weather && (
              <span>
                {weather.name}: {weather.main?.temp ?? '--'}°F — {weather.weather?.[0]?.description ?? ''}
              </span>
            )}
          </div>
        </div>

        <div className="pt-8">
          <Button 
            onClick={onStartOrder}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-12 py-8 text-2xl rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            Start Your Order
          </Button>
        </div>
      </div>
    </div>
  );
}
