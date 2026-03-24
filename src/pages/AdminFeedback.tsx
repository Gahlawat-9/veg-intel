import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_FEEDBACKS } from '@/data/mockData';

export default function AdminFeedbackPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);

  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r}⭐`,
    count: feedbacks.filter(f => f.rating === r).length,
  }));

  const updateStatus = (id: string, status: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    toast({ title: 'Updated' });
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
      </div>
    </DashboardLayout>
  );
}
