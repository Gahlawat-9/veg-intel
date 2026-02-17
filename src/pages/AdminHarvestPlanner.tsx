import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { calculateRisk, getRiskLabel, type RiskResult } from '@/lib/riskEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingDown, DollarSign, Leaf, ShieldCheck, Truck } from 'lucide-react';

interface CropEntry {
  id: string;
  farmer_id: string;
  vegetable_id: string;
  quantity_kg: number;
  harvest_date: string;
  created_at: string;
  city: string;
}

interface FarmerGroup {
  group: 'A' | 'B' | 'C';
  label: string;
  harvestInstruction: string;
  color: string;
  farmers: { farmerId: string; quantity: number; vegName: string; vegIcon: string; createdAt: string }[];
}

interface PolicyMetrics {
  estimatedWastePrevented: number;
  estimatedIncomeStabilized: number;
  farmersOptimized: number;
  avgPriceImpact: number;
}

export default function AdminHarvestPlanner() {
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<CropEntry[]>([]);
  const [vegetables, setVegetables] = useState<Map<string, { name: string; icon: string }>>(new Map());
  const [demandMap, setDemandMap] = useState<Map<string, number>>(new Map());
  const [weatherMultiplier, setWeatherMultiplier] = useState(1.0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: cropsData }, { data: vegsData }, { data: demandData }, { data: weatherData }] = await Promise.all([
      supabase.from('crops').select('*').eq('status', 'active'),
      supabase.from('vegetables').select('*'),
      supabase.from('demand_config').select('*'),
      supabase.from('weather_cache').select('*').order('fetched_at', { ascending: false }).limit(1),
    ]);

    setCrops(cropsData || []);
    setVegetables(new Map((vegsData || []).map(v => [v.id, { name: v.name, icon: v.icon || '🥬' }])));
    setDemandMap(new Map((demandData || []).map(d => [d.vegetable_id, Number(d.daily_demand_kg)])));
    setWeatherMultiplier(weatherData?.[0]?.weather_multiplier ? Number(weatherData[0].weather_multiplier) : 1.0);
    setLoading(false);
  };

  // Cluster farmers into 3 groups per vegetable
  const farmerGroups = useMemo(() => {
    // Group crops by vegetable
    const cropsByVeg: Record<string, CropEntry[]> = {};
    crops.forEach(c => {
      if (!cropsByVeg[c.vegetable_id]) cropsByVeg[c.vegetable_id] = [];
      cropsByVeg[c.vegetable_id].push(c);
    });

    const groups: FarmerGroup[] = [
      { group: 'A', label: 'Harvest Today', harvestInstruction: 'Proceed with harvest immediately', color: 'bg-primary/10 text-primary border-primary/20', farmers: [] },
      { group: 'B', label: 'Harvest in 2 Days', harvestInstruction: 'Delay harvest by 2 days to stagger supply', color: 'bg-accent/10 text-accent border-accent/20', farmers: [] },
      { group: 'C', label: 'Harvest in 4 Days', harvestInstruction: 'Delay harvest by 4 days for optimal pricing', color: 'bg-secondary/10 text-secondary-foreground border-secondary/20', farmers: [] },
    ];

    Object.entries(cropsByVeg).forEach(([vegId, vegCrops]) => {
      // Sort by submission time (earliest first)
      const sorted = [...vegCrops].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const third = Math.ceil(sorted.length / 3);
      sorted.forEach((crop, idx) => {
        const veg = vegetables.get(crop.vegetable_id);
        const groupIdx = idx < third ? 0 : idx < third * 2 ? 1 : 2;
        groups[groupIdx].farmers.push({
          farmerId: crop.farmer_id,
          quantity: Number(crop.quantity_kg),
          vegName: veg?.name || 'Unknown',
          vegIcon: veg?.icon || '🥬',
          createdAt: crop.created_at,
        });
      });
    });

    return groups;
  }, [crops, vegetables]);

  // Policy Dashboard metrics
  const policyMetrics = useMemo((): PolicyMetrics => {
    const totalSupply = crops.reduce((a, c) => a + Number(c.quantity_kg), 0);
    const totalDemand = Array.from(demandMap.values()).reduce((a, b) => a + b, 0) || 1;

    // Staggered harvest prevents ~15-25% waste from oversupply gluts
    const oversupplyRatio = Math.max(0, (totalSupply - totalDemand) / totalDemand);
    const wastePrevented = Math.round(totalSupply * Math.min(oversupplyRatio * 0.6, 0.25));

    // Price stabilization: preventing glut saves ~10-20% price crash
    const avgPriceKg = 30; // average ₹/kg
    const priceImpact = Math.round(oversupplyRatio * 15); // percentage saved
    const incomeStabilized = Math.round(wastePrevented * avgPriceKg * (1 + priceImpact / 100));

    return {
      estimatedWastePrevented: wastePrevented,
      estimatedIncomeStabilized: incomeStabilized,
      farmersOptimized: crops.length,
      avgPriceImpact: Math.min(priceImpact, 20),
    };
  }, [crops, demandMap]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading harvest planner...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Harvest Planner & Policy Dashboard</h1>
        <p className="text-muted-foreground">Staggered harvest clustering and estimated impact metrics</p>
      </div>

      <Tabs defaultValue="clustering" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="clustering" className="gap-2"><Users className="h-4 w-4" /> Farmer Clustering</TabsTrigger>
          <TabsTrigger value="policy" className="gap-2"><ShieldCheck className="h-4 w-4" /> Policy Dashboard</TabsTrigger>
        </TabsList>

        {/* Clustering Tab */}
        <TabsContent value="clustering" className="space-y-6">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-semibold text-foreground mb-1">How Clustering Works</h3>
            <p className="text-sm text-muted-foreground">
              Farmers are divided into 3 groups based on their crop submission time. Early registrants harvest first,
              later ones are staggered to prevent market flooding and price crashes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {farmerGroups.map(group => (
              <Card key={group.group} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-sans text-lg">Group {group.group}</CardTitle>
                    <Badge className={group.color}>{group.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{group.harvestInstruction}</p>
                </CardHeader>
                <CardContent>
                  {group.farmers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No farmers in this group</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {group.farmers.map((f, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{f.vegIcon}</span>
                            <span className="font-medium">{f.vegName}</span>
                          </div>
                          <span className="text-muted-foreground">{f.quantity} kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-border/50 text-center">
                    <span className="text-sm font-semibold text-foreground">{group.farmers.length}</span>
                    <span className="text-sm text-muted-foreground"> entries</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-sans text-lg">Clustering Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{crops.length}</p>
                  <p className="text-sm text-muted-foreground">Total Crop Entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{farmerGroups[0].farmers.length}</p>
                  <p className="text-sm text-muted-foreground">Harvesting Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{farmerGroups[1].farmers.length}</p>
                  <p className="text-sm text-muted-foreground">In 2 Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{farmerGroups[2].farmers.length}</p>
                  <p className="text-sm text-muted-foreground">In 4 Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Dashboard Tab */}
        <TabsContent value="policy" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waste Prevented (kg)</p>
                  <p className="text-2xl font-bold text-foreground">{policyMetrics.estimatedWastePrevented.toLocaleString()}</p>
                  <p className="text-xs text-primary">This week estimate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Income Stabilized</p>
                  <p className="text-2xl font-bold text-foreground">₹{policyMetrics.estimatedIncomeStabilized.toLocaleString()}</p>
                  <p className="text-xs text-primary">This week estimate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Farmers Optimized</p>
                  <p className="text-2xl font-bold text-foreground">{policyMetrics.farmersOptimized}</p>
                  <p className="text-xs text-muted-foreground">Active entries</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price Crash Avoided</p>
                  <p className="text-2xl font-bold text-foreground">~{policyMetrics.avgPriceImpact}%</p>
                  <p className="text-xs text-muted-foreground">Estimated</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-sans text-lg">Impact Methodology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" /> Waste Prevention
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Calculated as: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Oversupply × 60%</code> (capped at 25% of total supply).
                    Staggering harvest prevents market flooding which causes unsold produce to spoil.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" /> Income Stabilization
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Calculated as: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Waste Prevented × Avg Price × (1 + Price Impact%)</code>.
                    Preventing gluts stabilizes market prices, protecting farmer revenue.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2">Current Supply-Demand Snapshot</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Active Supply</p>
                    <p className="text-lg font-bold">{crops.reduce((a, c) => a + Number(c.quantity_kg), 0).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Daily Demand</p>
                    <p className="text-lg font-bold">{Array.from(demandMap.values()).reduce((a, b) => a + b, 0).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weather Multiplier</p>
                    <p className="text-lg font-bold">×{weatherMultiplier}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
