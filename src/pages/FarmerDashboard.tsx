import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { calculateRisk, getRiskLabel, type RiskResult } from '@/lib/riskEngine';
import { Cloud, AlertTriangle, Plus, TrendingUp, Droplets, Wind, Thermometer } from 'lucide-react';

interface CropWithVeg {
  id: string;
  quantity_kg: number;
  harvest_date: string;
  status: string;
  vegetable_id: string;
  vegetable_name: string;
  vegetable_icon: string;
}

interface WeatherData {
  temperature: number | null;
  humidity: number | null;
  weather_condition: string | null;
  wind_speed: number | null;
  weather_multiplier: number;
  fetched_at: string;
}

interface AlertData {
  id: string;
  title: string;
  message: string;
  severity: string;
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<CropWithVeg[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [riskMap, setRiskMap] = useState<Record<string, RiskResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch crops with vegetable names
    const { data: cropsData } = await supabase
      .from('crops')
      .select('id, quantity_kg, harvest_date, status, vegetable_id')
      .eq('farmer_id', user!.id)
      .order('created_at', { ascending: false });

    // Fetch all vegetables
    const { data: vegsData } = await supabase.from('vegetables').select('*');
    
    // Fetch demand config
    const { data: demandData } = await supabase.from('demand_config').select('*');
    
    // Fetch latest weather
    const { data: weatherData } = await supabase
      .from('weather_cache')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Fetch active alerts
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('id, title, message, severity')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const vegsMap = new Map((vegsData || []).map(v => [v.id, v]));
    const demandMap = new Map((demandData || []).map(d => [d.vegetable_id, d]));

    const enrichedCrops: CropWithVeg[] = (cropsData || []).map(c => {
      const veg = vegsMap.get(c.vegetable_id);
      return {
        ...c,
        quantity_kg: Number(c.quantity_kg),
        vegetable_name: veg?.name || 'Unknown',
        vegetable_icon: veg?.icon || '🥬',
      };
    });

    // Calculate risk per vegetable (aggregate all active supply for that veg in the city)
    // For now we use the farmer's own crops to show individual risk
    const wm = weatherData?.weather_multiplier ? Number(weatherData.weather_multiplier) : 1.0;
    const risks: Record<string, RiskResult> = {};
    
    // Group active crops by vegetable
    const supplyByVeg: Record<string, number> = {};
    enrichedCrops.filter(c => c.status === 'active').forEach(c => {
      supplyByVeg[c.vegetable_id] = (supplyByVeg[c.vegetable_id] || 0) + c.quantity_kg;
    });

    Object.entries(supplyByVeg).forEach(([vegId, supply]) => {
      const demand = demandMap.get(vegId);
      const dailyDemand = demand ? Number(demand.daily_demand_kg) : 1000;
      risks[vegId] = calculateRisk(supply, dailyDemand, wm);
    });

    setCrops(enrichedCrops);
    setWeather(weatherData ? {
      temperature: weatherData.temperature ? Number(weatherData.temperature) : null,
      humidity: weatherData.humidity ? Number(weatherData.humidity) : null,
      weather_condition: weatherData.weather_condition,
      wind_speed: weatherData.wind_speed ? Number(weatherData.wind_speed) : null,
      weather_multiplier: Number(weatherData.weather_multiplier),
      fetched_at: weatherData.fetched_at,
    } : null);
    setAlerts(alertsData || []);
    setRiskMap(risks);
    setLoading(false);
  };

  const fetchWeather = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-weather', {
        body: { city: 'Chandigarh' },
      });
      if (!error) {
        loadData();
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    }
  };

  const activeCrops = crops.filter(c => c.status === 'active');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Monitor your crops and market risk in real-time</p>
        </div>
        <Link to="/farmer/add-crop">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Crop</Button>
        </Link>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={`flex items-start gap-3 rounded-lg border p-4 ${
              a.severity === 'critical' ? 'border-destructive/50 bg-destructive/5' :
              a.severity === 'warning' ? 'border-risk-yellow/50 bg-yellow-50' :
              'border-border bg-muted/50'
            }`}>
              <AlertTriangle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                a.severity === 'critical' ? 'text-destructive' : 'text-risk-yellow'
              }`} />
              <div>
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weather Card */}
      <Card className="mb-6 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 font-sans text-lg">
            <Cloud className="h-5 w-5 text-primary" /> Weather Intelligence
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchWeather}>Refresh Weather</Button>
        </CardHeader>
        <CardContent>
          {weather ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="font-semibold text-foreground">{weather.temperature ?? '--'}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold text-foreground">{weather.humidity ?? '--'}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold text-foreground">{weather.wind_speed ?? '--'} m/s</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Weather Multiplier</p>
                  <p className="font-semibold text-foreground">×{weather.weather_multiplier}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No weather data yet. Click "Refresh Weather" to fetch latest data.</p>
          )}
        </CardContent>
      </Card>

      {/* Risk Status Cards */}
      <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">Risk Status by Vegetable</h2>
      {Object.keys(riskMap).length === 0 ? (
        <Card className="mb-6 shadow-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            No active crops. <Link to="/farmer/add-crop" className="text-primary hover:underline">Add your first crop</Link> to see risk analysis.
          </CardContent>
        </Card>
      ) : (
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(riskMap).map(([vegId, risk]) => {
            const crop = crops.find(c => c.vegetable_id === vegId);
            return (
              <Card key={vegId} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl">{crop?.vegetable_icon}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      risk.level === 'green' ? 'bg-risk-green/10 text-emerald-700' :
                      risk.level === 'yellow' ? 'bg-risk-yellow/10 text-yellow-700' :
                      'bg-risk-red/10 text-red-700'
                    }`}>
                      {getRiskLabel(risk.level)}
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{crop?.vegetable_name}</h3>
                  <div className="mb-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>Supply: <span className="font-semibold text-foreground">{risk.supplyKg}kg</span></div>
                    <div>Demand: <span className="font-semibold text-foreground">{risk.demandKg}kg</span></div>
                    <div>Score: <span className="font-semibold text-foreground">{risk.score}</span></div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{risk.advisory}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* My Crops Table */}
      <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">My Crops ({crops.length})</h2>
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vegetable</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Quantity (kg)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Harvest Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {crops.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No crops added yet.</td></tr>
                ) : crops.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="mr-2">{c.vegetable_icon}</span>
                      {c.vegetable_name}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.quantity_kg}</td>
                    <td className="px-4 py-3">{new Date(c.harvest_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'active' ? 'bg-primary/10 text-primary' :
                        c.status === 'harvested' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
