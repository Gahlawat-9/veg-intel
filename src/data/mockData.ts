// Centralized mock/dummy data for the admin dashboard

export const MOCK_VEGETABLES = [
  { id: 'v1', name: 'Tomato', icon: '🍅', shelf_life_days: 7 },
  { id: 'v2', name: 'Potato', icon: '🥔', shelf_life_days: 30 },
  { id: 'v3', name: 'Onion', icon: '🧅', shelf_life_days: 21 },
  { id: 'v4', name: 'Spinach', icon: '🥬', shelf_life_days: 3 },
  { id: 'v5', name: 'Cauliflower', icon: '🥦', shelf_life_days: 5 },
  { id: 'v6', name: 'Carrot', icon: '🥕', shelf_life_days: 14 },
  { id: 'v7', name: 'Peas', icon: '🫛', shelf_life_days: 5 },
];

export const MOCK_DEMAND_CONFIG = [
  { id: 'd1', vegetable_id: 'v1', daily_demand_kg: 800, price_per_kg: 32 },
  { id: 'd2', vegetable_id: 'v2', daily_demand_kg: 2000, price_per_kg: 18 },
  { id: 'd3', vegetable_id: 'v3', daily_demand_kg: 1100, price_per_kg: 28 },
  { id: 'd4', vegetable_id: 'v4', daily_demand_kg: 600, price_per_kg: 40 },
  { id: 'd5', vegetable_id: 'v5', daily_demand_kg: 500, price_per_kg: 25 },
  { id: 'd6', vegetable_id: 'v6', daily_demand_kg: 700, price_per_kg: 35 },
  { id: 'd7', vegetable_id: 'v7', daily_demand_kg: 400, price_per_kg: 55 },
];

export const MOCK_CROPS = [
  { id: 'c1', farmer_id: 'f1', vegetable_id: 'v1', quantity_kg: 500, harvest_date: '2026-03-26', status: 'active', city: 'Chandigarh', created_at: '2026-03-20T08:00:00Z' },
  { id: 'c2', farmer_id: 'f2', vegetable_id: 'v1', quantity_kg: 700, harvest_date: '2026-03-27', status: 'active', city: 'Chandigarh', created_at: '2026-03-20T10:00:00Z' },
  { id: 'c3', farmer_id: 'f3', vegetable_id: 'v2', quantity_kg: 2500, harvest_date: '2026-03-28', status: 'active', city: 'Chandigarh', created_at: '2026-03-19T09:00:00Z' },
  { id: 'c4', farmer_id: 'f4', vegetable_id: 'v3', quantity_kg: 900, harvest_date: '2026-03-26', status: 'active', city: 'Chandigarh', created_at: '2026-03-21T07:00:00Z' },
  { id: 'c5', farmer_id: 'f5', vegetable_id: 'v4', quantity_kg: 400, harvest_date: '2026-03-25', status: 'active', city: 'Chandigarh', created_at: '2026-03-20T14:00:00Z' },
  { id: 'c6', farmer_id: 'f6', vegetable_id: 'v5', quantity_kg: 700, harvest_date: '2026-03-27', status: 'active', city: 'Chandigarh', created_at: '2026-03-18T11:00:00Z' },
  { id: 'c7', farmer_id: 'f7', vegetable_id: 'v1', quantity_kg: 300, harvest_date: '2026-03-26', status: 'active', city: 'Chandigarh', created_at: '2026-03-21T16:00:00Z' },
  { id: 'c8', farmer_id: 'f8', vegetable_id: 'v6', quantity_kg: 800, harvest_date: '2026-03-29', status: 'active', city: 'Chandigarh', created_at: '2026-03-19T13:00:00Z' },
  { id: 'c9', farmer_id: 'f9', vegetable_id: 'v7', quantity_kg: 300, harvest_date: '2026-03-26', status: 'active', city: 'Chandigarh', created_at: '2026-03-20T09:30:00Z' },
  { id: 'c10', farmer_id: 'f10', vegetable_id: 'v2', quantity_kg: 1500, harvest_date: '2026-03-28', status: 'active', city: 'Chandigarh', created_at: '2026-03-21T08:00:00Z' },
  { id: 'c11', farmer_id: 'f11', vegetable_id: 'v3', quantity_kg: 600, harvest_date: '2026-03-27', status: 'active', city: 'Chandigarh', created_at: '2026-03-20T12:00:00Z' },
  { id: 'c12', farmer_id: 'f12', vegetable_id: 'v5', quantity_kg: 350, harvest_date: '2026-03-26', status: 'active', city: 'Chandigarh', created_at: '2026-03-21T15:00:00Z' },
];

export const MOCK_ALERTS = [
  { id: 'a1', title: 'Tomato Oversupply Warning', message: 'Tomato supply exceeding demand by 50% in Sector 26 Mandi. Consider delaying harvest.', severity: 'critical', is_active: true, created_at: '2026-03-23T10:00:00Z' },
  { id: 'a2', title: 'Heavy Rain Expected', message: 'Weather forecast indicates heavy rainfall in Chandigarh for next 3 days. Plan harvests accordingly.', severity: 'warning', is_active: true, created_at: '2026-03-22T14:00:00Z' },
  { id: 'a3', title: 'Peas Shortage Alert', message: 'Peas supply below 60% of daily demand. Encourage farmers to prioritize peas harvest.', severity: 'info', is_active: true, created_at: '2026-03-21T09:00:00Z' },
  { id: 'a4', title: 'System Maintenance', message: 'Scheduled maintenance window on March 25th, 2-4 AM IST.', severity: 'info', is_active: false, created_at: '2026-03-20T16:00:00Z' },
];

export const MOCK_FEEDBACKS = [
  { id: 'fb1', subject: 'Great advisory system', message: 'The harvest timing advice helped me avoid selling during a glut. Very useful!', rating: 5, status: 'reviewed', created_at: '2026-03-22T10:00:00Z', farmer_id: 'f1' },
  { id: 'fb2', subject: 'Need more vegetables', message: 'Please add support for bitter gourd and ridge gourd tracking.', rating: 4, status: 'pending', created_at: '2026-03-21T15:00:00Z', farmer_id: 'f3' },
  { id: 'fb3', subject: 'Price data mismatch', message: 'The prices shown for onion at Manimajra mandi are different from actual rates.', rating: 3, status: 'pending', created_at: '2026-03-20T11:00:00Z', farmer_id: 'f5' },
  { id: 'fb4', subject: 'App is very helpful', message: 'Clustering feature saved me from a price crash last week. Thank you team!', rating: 5, status: 'resolved', created_at: '2026-03-19T08:00:00Z', farmer_id: 'f7' },
  { id: 'fb5', subject: 'Slow loading', message: 'The city map page takes too long to load on my phone.', rating: 2, status: 'pending', created_at: '2026-03-18T14:00:00Z', farmer_id: 'f9' },
];

export const MOCK_WEATHER = {
  city: 'Chandigarh',
  temperature: 28,
  humidity: 72,
  weather_condition: 'Partly Cloudy',
  wind_speed: 12,
  weather_multiplier: 1.1,
};
