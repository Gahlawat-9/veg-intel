import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateRisk, getRiskLabel, type RiskResult } from '@/lib/riskEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, AlertTriangle, Leaf } from 'lucide-react';

const COLORS = ['#2d8a4e', '#d4a017', '#dc2626', '#3b82f6', '#8b5cf6', '#f97316'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [totalCrops, setTotalCrops] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [supplyDemandData, setSupplyDemandData] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ name: string; value: number }[]>([]);
  const [vegRisks, setVegRisks] = useState<{ name: string; icon: string; risk: RiskResult }[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);

    const [
      { count: farmerCount },
      { data: cropsData },
      { data: vegsData },
      { data: demandData },
      { data: weatherData },
      { count: alertCount },
    ] = await Promise.all([
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('crops').select('*').eq('status', 'active'),
      supabase.from('vegetables').select('*'),
      supabase.from('demand_config').select('*'),
      supabase.from('weather_cache').select('*').order('fetched_at', { ascending: false }).limit(1),
      supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    setTotalFarmers(farmerCount || 0);
    setActiveAlerts(alertCount || 0);

    const vegsMap = new Map((vegsData || []).map(v => [v.id, v]));
    const demandMap = new Map((demandData || []).map(d => [d.vegetable_id, d]));
    const wm = weatherData?.[0]?.weather_multiplier ? Number(weatherData[0].weather_multiplier) : 1.0;

    // Aggregate supply per vegetable
    const supplyByVeg: Record<string, number> = {};
    (cropsData || []).forEach(c => {
      supplyByVeg[c.vegetable_id] = (supplyByVeg[c.vegetable_id] || 0) + Number(c.quantity_kg);
    });

    setTotalCrops((cropsData || []).length);
    setTotalSupply(Object.values(supplyByVeg).reduce((a, b) => a + b, 0));

    // Build supply vs demand chart data and risk
    const sdData: any[] = [];
    const risks: { name: string; icon: string; risk: RiskResult }[] = [];
    let greenCount = 0, yellowCount = 0, redCount = 0;

    (vegsData || []).forEach(veg => {
      const supply = supplyByVeg[veg.id] || 0;
      const demand = demandMap.get(veg.id);
      const dailyDemand = demand ? Number(demand.daily_demand_kg) : 1000;
      
      if (supply > 0 || demand) {
        sdData.push({
          name: veg.name,
          supply: Math.round(supply),
          demand: Math.round(dailyDemand),
        });
      }

      if (supply > 0) {
        const risk = calculateRisk(supply, dailyDemand, wm);
        risks.push({ name: veg.name, icon: veg.icon || '🥬', risk });
        if (risk.level === 'green') greenCount++;
        else if (risk.level === 'yellow') yellowCount++;
        else redCount++;
      }
    });

    setSupplyDemandData(sdData);
    setVegRisks(risks.sort((a, b) => b.risk.score - a.risk.score));
    setRiskDistribution([
      { name: 'Safe', value: greenCount },
      { name: 'Caution', value: yellowCount },
      { name: 'Oversupply', value: redCount },
    ].filter(d => d.value > 0));

    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading control center...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Market Intelligence Control Center</h1>
        <p className="text-muted-foreground">Real-time overview of city-scale vegetable supply and risk</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered Farmers</p>
              <p className="text-2xl font-bold text-foreground">{totalFarmers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Leaf className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Crops</p>
              <p className="text-2xl font-bold text-foreground">{totalCrops}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Supply (kg)</p>
              <p className="text-2xl font-bold text-foreground">{totalSupply.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold text-foreground">{activeAlerts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Supply vs Demand */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-sans text-lg">Supply vs Demand Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {supplyDemandData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="supply" name="Supply (kg)" fill="hsl(145, 45%, 28%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="demand" name="Demand (kg)" fill="hsl(38, 70%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No supply data yet. Farmers need to add crops first.</p>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-sans text-lg">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {riskDistribution.map((_, i) => (
                      <Cell key={i} fill={['#2d8a4e', '#d4a017', '#dc2626'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No risk data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vegetable Risk Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-sans text-lg">Vegetable Risk Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vegetable</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supply (kg)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Demand (kg)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Risk Score</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Advisory</th>
                </tr>
              </thead>
              <tbody>
                {vegRisks.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No active supply data.</td></tr>
                ) : vegRisks.map(vr => (
                  <tr key={vr.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">{vr.icon} {vr.name}</td>
                    <td className="px-4 py-3 font-medium">{vr.risk.supplyKg.toLocaleString()}</td>
                    <td className="px-4 py-3">{vr.risk.demandKg.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">{vr.risk.score}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        vr.risk.level === 'green' ? 'bg-risk-green/10 text-emerald-700' :
                        vr.risk.level === 'yellow' ? 'bg-risk-yellow/10 text-yellow-700' :
                        'bg-risk-red/10 text-red-700'
                      }`}>
                        {getRiskLabel(vr.risk.level)}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">{vr.risk.advisory}</td>
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
