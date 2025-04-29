-- Create a function to create the coupons table if it doesn't exist
CREATE OR REPLACE FUNCTION create_coupons_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'coupons'
  ) THEN
    -- Create the coupons table
    CREATE TABLE public.coupons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      type TEXT NOT NULL,
      discount NUMERIC NOT NULL,
      maxDiscount NUMERIC,
      minOrderValue NUMERIC,
      isActive BOOLEAN DEFAULT true,
      isHidden BOOLEAN DEFAULT false,
      specialAction TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add comment to the table
    COMMENT ON TABLE public.coupons IS 'Stores coupon codes and their details';
  END IF;
END;
$$ LANGUAGE plpgsql;
