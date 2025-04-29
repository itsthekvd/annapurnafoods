CREATE OR REPLACE FUNCTION create_coupons_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'coupons'
  ) THEN
    -- Create the table
    CREATE TABLE public.coupons (
      id UUID PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount NUMERIC NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      min_order_value NUMERIC DEFAULT 0,
      max_discount NUMERIC,
      is_active BOOLEAN DEFAULT true,
      is_hidden BOOLEAN DEFAULT false,
      special_action TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous read access" 
      ON public.coupons FOR SELECT 
      USING (true);
      
    CREATE POLICY "Allow authenticated users to update" 
      ON public.coupons FOR UPDATE 
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END;
$$ LANGUAGE plpgsql;
