
-- Drop the overly permissive weather cache insert policy
DROP POLICY "Service can insert weather" ON public.weather_cache;

-- Weather cache should only be inserted by service role (edge functions), no user-level insert needed
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
