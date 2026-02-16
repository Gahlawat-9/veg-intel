import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function FarmerFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('feedback').insert({
      farmer_id: user!.id,
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 1000),
      rating,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Feedback Sent!', description: 'Thank you for your feedback.' });
      setSubject('');
      setMessage('');
      setRating(5);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Submit Feedback</h1>
        <Card className="shadow-elevated">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="e.g., Price suggestion for tomatoes" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Your detailed feedback..." value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={5} required />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} type="button" onClick={() => setRating(r)}
                      className={`h-10 w-10 rounded-lg border-2 text-lg transition-all ${
                        r <= rating ? 'border-accent bg-accent/10' : 'border-border'
                      }`}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
