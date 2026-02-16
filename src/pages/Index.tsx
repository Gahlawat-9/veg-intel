import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, BarChart3, Shield, Cloud, ArrowRight, Leaf } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const sdgs = [
  { num: 1, title: 'No Poverty', desc: 'Stabilizes farmer income through market intelligence', color: 'bg-red-500' },
  { num: 2, title: 'Zero Hunger', desc: 'Reduces food waste, improves food availability', color: 'bg-amber-500' },
  { num: 12, title: 'Responsible Consumption', desc: 'Optimizes supply chains, reduces overproduction waste', color: 'bg-yellow-600' },
  { num: 13, title: 'Climate Action', desc: 'Weather-aware decisions reduce emissions from waste', color: 'bg-emerald-600' },
];

const features = [
  { icon: BarChart3, title: 'Supply-Demand Analytics', desc: 'Real-time tracking of vegetable supply against city demand with transparent risk scoring.' },
  { icon: Cloud, title: 'Weather Intelligence', desc: 'Live weather data feeds into risk calculations, adjusting recommendations dynamically.' },
  { icon: Shield, title: 'Explainable Decisions', desc: 'Every recommendation shows exactly why — no black-box AI, pure rule-based transparency.' },
  { icon: Leaf, title: 'Harvest Coordination', desc: 'City-scale coordination prevents market gluts by advising optimal harvest timing.' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">VEG-INTEL</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Smart agricultural landscape" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sprout className="h-4 w-4" /> AgriTech • SDG Aligned
            </div>
            <h1 className="mb-4 font-display text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              City-Scale Vegetable Intelligence
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Harvest smart, not in crowds. VEG-INTEL coordinates vegetable supply across cities to prevent market gluts, reduce waste, and stabilize farmer incomes — all with transparent, rule-based intelligence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-base">
                  Start as Farmer <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-base">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Formula */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Transparent Risk Engine</h2>
          <p className="mb-6 text-muted-foreground">Every decision is explainable. No black-box AI.</p>
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-muted/50 p-6">
            <code className="text-lg font-semibold text-foreground">
              Risk Score = <span className="text-primary">(Total Supply ÷ Demand)</span> × <span className="text-accent">Weather Multiplier</span>
            </code>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-risk-green" /> Safe (&lt;0.7)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-risk-yellow" /> Caution (0.7-1.0)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-risk-red" /> Oversupply (&gt;1.0)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">Core Capabilities</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center font-display text-3xl font-bold text-foreground">SDG Alignment</h2>
          <p className="mb-12 text-center text-muted-foreground">Contributing to 4 Sustainable Development Goals</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sdgs.map(s => (
              <div key={s.num} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${s.color} text-primary-foreground`}>
                  {s.num}
                </div>
                <h3 className="mb-1 font-sans text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">VEG-INTEL</span>
          </div>
          <p>City-Scale Vegetable Intelligence System • Team Kalpana • Chandigarh University</p>
        </div>
      </footer>
    </div>
  );
}
