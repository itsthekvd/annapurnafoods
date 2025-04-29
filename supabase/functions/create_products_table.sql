-- Create a function to create the products table if it doesn't exist
CREATE OR REPLACE FUNCTION create_products_table()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'products'
  ) THEN
    -- Create the products table
    CREATE TABLE public.products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      original_price DECIMAL(10, 2),
      description TEXT,
      image TEXT,
      is_subscription BOOLEAN DEFAULT FALSE,
      slug TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create an updated_at trigger
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END;
$$ LANGUAGE plpgsql;
