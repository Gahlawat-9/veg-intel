import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Vegetable {
  id: string;
  name: string;
  icon: string;
}

export default function AddCrop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [vegId, setVegId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('vegetables').select('id, name, icon').order('name').then(({ data }) => {
      setVegetables(data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vegId || !quantity || !harvestDate) {
      toast({ title: 'Missing fields', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > 100000) {
      toast({ title: 'Invalid quantity', description: 'Quantity must be between 0 and 100,000 kg', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('crops').insert({
      farmer_id: user!.id,
      vegetable_id: vegId,
      quantity_kg: qty,
      harvest_date: harvestDate,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Crop Added!', description: 'Your crop has been registered successfully.' });
      navigate('/farmer');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Add New Crop</h1>
        <Card className="shadow-elevated">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Vegetable</Label>
                <Select value={vegId} onValueChange={setVegId}>
                  <SelectTrigger><SelectValue placeholder="Select vegetable" /></SelectTrigger>
                  <SelectContent>
                    {vegetables.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.icon} {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input id="quantity" type="number" min="1" max="100000" step="0.1" placeholder="e.g. 500" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harvest-date">Expected Harvest Date</Label>
                <Input id="harvest-date" type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Crop'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
