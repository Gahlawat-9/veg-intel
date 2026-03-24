import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MOCK_VEGETABLES, MOCK_DEMAND_CONFIG } from '@/data/mockData';

interface DemandRow {
  id: string;
  vegetable_id: string;
  daily_demand_kg: number;
  price_per_kg: number;
  veg_name: string;
  veg_icon: string;
}

export default function AdminDemandConfig() {
  const { toast } = useToast();

  const initialRows: DemandRow[] = MOCK_VEGETABLES.map(v => {
    const d = MOCK_DEMAND_CONFIG.find(dc => dc.vegetable_id === v.id);
    return {
      id: d?.id || '',
      vegetable_id: v.id,
      daily_demand_kg: d ? d.daily_demand_kg : 1000,
      price_per_kg: d ? d.price_per_kg : 30,
      veg_name: v.name,
      veg_icon: v.icon,
    };
  });

  const [rows, setRows] = useState<DemandRow[]>(initialRows);

  const handleSave = (row: DemandRow) => {
    if (row.daily_demand_kg <= 0 || row.price_per_kg <= 0) {
      toast({ title: 'Invalid values', description: 'Values must be positive', variant: 'destructive' });
      return;
    }
    toast({ title: 'Saved', description: `${row.veg_name} demand updated.` });
  };

  const updateRow = (vegId: string, field: 'daily_demand_kg' | 'price_per_kg', value: string) => {
    setRows(prev => prev.map(r => r.vegetable_id === vegId ? { ...r, [field]: parseFloat(value) || 0 } : r));
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Demand Configuration</h1>
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vegetable</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Daily Demand (kg)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price/kg (₹)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.vegetable_id} className="border-b border-border/50">
                    <td className="px-4 py-3">{row.veg_icon} {row.veg_name}</td>
                    <td className="px-4 py-3">
                      <Input type="number" min="1" className="w-32" value={row.daily_demand_kg}
                        onChange={e => updateRow(row.vegetable_id, 'daily_demand_kg', e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" min="1" className="w-32" value={row.price_per_kg}
                        onChange={e => updateRow(row.vegetable_id, 'price_per_kg', e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => handleSave(row)}>Save</Button>
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
