import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getWeatherMultiplier(condition: string, humidity: number): number {
  const lc = condition.toLowerCase();
  let multiplier = 1.0;
  if (lc.includes('rain') || lc.includes('storm') || lc.includes('thunder')) {
    multiplier = 1.3;
  } else if (lc.includes('drizzle')) {
    multiplier = 1.15;
  } else if (lc.includes('cloud') || lc.includes('mist') || lc.includes('fog') || lc.includes('haze')) {
    multiplier = 1.1;
  } else if (lc.includes('clear') || lc.includes('sun')) {
    multiplier = 0.9;
  }
  if (humidity > 80) multiplier *= 1.15;
  if (humidity > 90) multiplier *= 1.1;
  return Math.round(multiplier * 100) / 100;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
    if (!WEATHER_API_KEY) {
      throw new Error('WEATHER_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const { city = 'Chandigarh' } = await req.json().catch(() => ({}));
    
    // Validate city input
    const sanitizedCity = String(city).slice(0, 100).replace(/[^a-zA-Z\s-]/g, '');
    if (!sanitizedCity) {
      throw new Error('Invalid city name');
    }

    // Fetch from OpenWeatherMap
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(sanitizedCity)}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!weatherRes.ok) {
      const errText = await weatherRes.text();
      throw new Error(`Weather API error [${weatherRes.status}]: ${errText}`);
    }

    const weatherJson = await weatherRes.json();
    const temperature = weatherJson.main?.temp ?? null;
    const humidity = weatherJson.main?.humidity ?? 50;
    const weatherCondition = weatherJson.weather?.[0]?.main ?? 'Unknown';
    const windSpeed = weatherJson.wind?.speed ?? null;
    const weatherMultiplier = getWeatherMultiplier(weatherCondition, humidity);

    // Store in cache using service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: insertError } = await supabase.from('weather_cache').insert({
      city: sanitizedCity,
      temperature,
      humidity,
      weather_condition: weatherCondition,
      wind_speed: windSpeed,
      weather_multiplier: weatherMultiplier,
    });

    if (insertError) {
      console.error('DB insert error:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: { city: sanitizedCity, temperature, humidity, weather_condition: weatherCondition, wind_speed: windSpeed, weather_multiplier: weatherMultiplier },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Weather fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
