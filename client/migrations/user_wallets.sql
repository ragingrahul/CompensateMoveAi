-- Create user_wallets table to link Supabase user accounts with blockchain wallets
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(wallet_address)
);

-- Create RLS policies for the user_wallets table

-- Allow users to view only their own wallet links
CREATE POLICY "Users can view their own wallet links" ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create wallet links for their own account
CREATE POLICY "Users can create wallet links for themselves" ON user_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own wallet links
CREATE POLICY "Users can update their own wallet links" ON user_wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete only their own wallet links
CREATE POLICY "Users can delete their own wallet links" ON user_wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Enable Row Level Security
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_user_wallets_updated_at
BEFORE UPDATE ON user_wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 