import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Feedback {
  id: string;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [ratingData, setRatingData] = useState<{ rating: string; count: number }[]>([]);

  useEffect(() => { loadFeedback(); }, []);

  const loadFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    const items = data || [];
    setFeedbacks(items);

    // Build rating distribution
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    items.forEach(f => { if (f.rating) counts[f.rating]++; });
    setRatingData(Object.entries(counts).map(([r, c]) => ({ rating: `${r}⭐`, count: c })));
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('feedback').update({ status }).eq('id', id);
    toast({ title: 'Updated' });
    loadFeedback();
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Feedback Analytics</h1>

      <Card className="mb-8 shadow-card">
        <CardHeader><CardTitle className="font-sans text-lg">Rating Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="rating" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(38, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {feedbacks.map(f => (
          <Card key={f.id} className="shadow-card">
            <CardContent className="flex items-start justify-between py-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-foreground">{f.subject}</span>
                  {f.rating && <span className="text-sm text-muted-foreground">{'⭐'.repeat(f.rating)}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{f.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</p>
              </div>
              <Select value={f.status} onValueChange={v => updateStatus(f.id, v)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {feedbacks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No feedback received yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
