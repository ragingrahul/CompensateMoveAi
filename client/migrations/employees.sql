-- Create employees table to store employee information
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  aptos_wallet_address TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(aptos_wallet_address)
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for the employees table
-- Basic policy to allow authenticated users to access employees
CREATE POLICY "Allow authenticated users to view employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert employees
CREATE POLICY "Allow authenticated users to insert employees" ON employees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update employees
CREATE POLICY "Allow authenticated users to update employees" ON employees
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete employees
CREATE POLICY "Allow authenticated users to delete employees" ON employees
  FOR DELETE USING (auth.role() = 'authenticated'); 