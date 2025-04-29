-- Create coupons table if it doesn't exist
CREATE OR REPLACE FUNCTION create_coupons_table()
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
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      discount NUMERIC NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      min_order_value NUMERIC DEFAULT 0,
      max_discount NUMERIC,
      is_active BOOLEAN DEFAULT true,
      is_hidden BOOLEAN DEFAULT false,
      special_action TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add comment
    COMMENT ON TABLE public.coupons IS 'Stores discount coupons for the website';
  END IF;
END;
$$ LANGUAGE plpgsql;
