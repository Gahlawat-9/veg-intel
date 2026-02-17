import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MandiVeg {
  name: string;
  icon: string;
  supply: number;
  demand: number;
  price: number;
}

interface MandiData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vegetables: MandiVeg[];
}

// Mock mandi data for Chandigarh
const MOCK_MANDIS: MandiData[] = [
  {
    id: '1', name: 'Sector 26 Mandi', lat: 30.7333, lng: 76.7794,
    vegetables: [
      { name: 'Tomato', icon: '🍅', supply: 1200, demand: 800, price: 32 },
      { name: 'Potato', icon: '🥔', supply: 2500, demand: 2000, price: 18 },
      { name: 'Onion', icon: '🧅', supply: 900, demand: 1100, price: 28 },
    ],
  },
  {
    id: '2', name: 'Sector 17 Sabzi Mandi', lat: 30.7410, lng: 76.7840,
    vegetables: [
      { name: 'Spinach', icon: '🥬', supply: 400, demand: 600, price: 40 },
      { name: 'Cauliflower', icon: '🥦', supply: 700, demand: 500, price: 25 },
      { name: 'Tomato', icon: '🍅', supply: 1500, demand: 900, price: 30 },
    ],
  },
  {
    id: '3', name: 'Manimajra Mandi', lat: 30.7270, lng: 76.8100,
    vegetables: [
      { name: 'Carrot', icon: '🥕', supply: 800, demand: 700, price: 35 },
      { name: 'Potato', icon: '🥔', supply: 3000, demand: 1800, price: 16 },
      { name: 'Peas', icon: '🫛', supply: 300, demand: 500, price: 55 },
    ],
  },
  {
    id: '4', name: 'Dhanas Mandi', lat: 30.7600, lng: 76.7650,
    vegetables: [
      { name: 'Tomato', icon: '🍅', supply: 600, demand: 1000, price: 38 },
      { name: 'Onion', icon: '🧅', supply: 1800, demand: 1200, price: 22 },
      { name: 'Spinach', icon: '🥬', supply: 250, demand: 400, price: 45 },
    ],
  },
  {
    id: '5', name: 'Hallomajra Market', lat: 30.7150, lng: 76.8000,
    vegetables: [
      { name: 'Cauliflower', icon: '🥦', supply: 500, demand: 600, price: 30 },
      { name: 'Carrot', icon: '🥕', supply: 350, demand: 300, price: 32 },
      { name: 'Peas', icon: '🫛', supply: 200, demand: 350, price: 60 },
    ],
  },
];

function getSupplyDemandBadge(supply: number, demand: number) {
  const ratio = supply / demand;
  if (ratio >= 1.2) return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Oversupply</Badge>;
  if (ratio >= 0.8) return <Badge className="bg-primary/10 text-primary border-primary/20">Balanced</Badge>;
  return <Badge className="bg-accent/10 text-accent border-accent/20">Shortage</Badge>;
}

function getPriceColor(price: number) {
  if (price >= 45) return 'text-destructive font-bold';
  if (price >= 30) return 'text-foreground font-medium';
  return 'text-primary font-medium';
}

const createMandiIcon = (status: 'oversupply' | 'balanced' | 'shortage') => {
  const colors = { oversupply: '#dc2626', balanced: '#2d8a4e', shortage: '#d4a017' };
  return L.divIcon({
    className: 'custom-mandi-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${colors[status]};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function getMandiStatus(mandi: MandiData): 'oversupply' | 'balanced' | 'shortage' {
  const totalSupply = mandi.vegetables.reduce((a, v) => a + v.supply, 0);
  const totalDemand = mandi.vegetables.reduce((a, v) => a + v.demand, 0);
  const ratio = totalSupply / totalDemand;
  if (ratio >= 1.2) return 'oversupply';
  if (ratio >= 0.8) return 'balanced';
  return 'shortage';
}

export default function AdminCityMap() {
  const [selectedMandi, setSelectedMandi] = useState<MandiData | null>(null);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">City Digital Map</h1>
        <p className="text-muted-foreground">Mandi-wise price variations and supply-demand across Chandigarh</p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-primary" /> <span className="text-sm text-muted-foreground">Balanced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-destructive" /> <span className="text-sm text-muted-foreground">Oversupply</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ background: 'hsl(45, 90%, 50%)' }} /> <span className="text-sm text-muted-foreground">Shortage</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <div style={{ height: '500px' }}>
              <MapContainer
                center={[30.7333, 76.7794]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {MOCK_MANDIS.map(mandi => (
                  <Marker
                    key={mandi.id}
                    position={[mandi.lat, mandi.lng]}
                    icon={createMandiIcon(getMandiStatus(mandi))}
                    eventHandlers={{
                      click: () => setSelectedMandi(mandi),
                    }}
                  >
                    <Popup>
                      <div className="text-sm font-semibold">{mandi.name}</div>
                      <div className="text-xs text-muted-foreground">{mandi.vegetables.length} vegetables tracked</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-sans text-lg">
              {selectedMandi ? selectedMandi.name : 'Select a Mandi'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMandi ? (
              <div className="space-y-3">
                {selectedMandi.vegetables.map(veg => (
                  <div key={veg.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{veg.icon} {veg.name}</span>
                      {getSupplyDemandBadge(veg.supply, veg.demand)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Supply</p>
                        <p className="font-medium">{veg.supply} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Demand</p>
                        <p className="font-medium">{veg.demand} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className={getPriceColor(veg.price)}>₹{veg.price}/kg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Click on a mandi marker on the map to see vegetable prices and supply-demand data.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* City-wide Summary Table */}
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="font-sans text-lg">City-wide Price Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mandi</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vegetable</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price (₹/kg)</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supply</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Demand</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MANDIS.flatMap(mandi =>
                  mandi.vegetables.map(veg => (
                    <tr key={`${mandi.id}-${veg.name}`} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{mandi.name}</td>
                      <td className="px-4 py-2.5">{veg.icon} {veg.name}</td>
                      <td className={`px-4 py-2.5 ${getPriceColor(veg.price)}`}>₹{veg.price}</td>
                      <td className="px-4 py-2.5">{veg.supply} kg</td>
                      <td className="px-4 py-2.5">{veg.demand} kg</td>
                      <td className="px-4 py-2.5">{getSupplyDemandBadge(veg.supply, veg.demand)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
