import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MOCK_ALERTS } from '@/data/mockData';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    const newAlert: Alert = {
      id: `a${Date.now()}`,
      title: title.trim().slice(0, 200),
      message: message.trim().slice(0, 1000),
      severity,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    setTitle('');
    setMessage('');
    toast({ title: 'Alert Created' });
  };

  const toggleActive = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Alert Management</h1>

      <Card className="mb-8 shadow-elevated">
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Alert title" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Alert message for farmers..." value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} required />
            </div>
            <Button type="submit">Create Alert</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {alerts.map(a => (
          <Card key={a.id} className={`shadow-card ${!a.is_active ? 'opacity-50' : ''}`}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    a.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                    a.severity === 'warning' ? 'bg-risk-yellow/10 text-yellow-700' :
                    'bg-primary/10 text-primary'
                  }`}>{a.severity}</span>
                  <span className="font-semibold text-foreground">{a.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleActive(a.id)}>
                {a.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
