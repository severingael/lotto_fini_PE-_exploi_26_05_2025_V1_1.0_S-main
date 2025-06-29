/*
  # Fix Wallet Access Policies

  1. Changes
    - Update RLS policies to properly check user roles
    - Add helper function for role checking
    - Fix wallet access for both agents and admins

  2. Security
    - Ensure proper access control based on user roles
    - Maintain data isolation between agents
*/

-- Create helper function to check user role
CREATE OR REPLACE FUNCTION auth.check_user_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = required_role OR
    current_setting('request.jwt.claims', true)::json ->> 'role' = required_role OR
    auth.jwt() ->> 'raw_user_meta_data'->>'role' = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Agents can view own wallet" ON agent_wallets;
DROP POLICY IF EXISTS "Only admins can manage wallets" ON agent_wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON agent_transactions;
DROP POLICY IF EXISTS "Only admins can manage commissions" ON agent_commissions;

-- Create updated policies for agent_wallets
CREATE POLICY "Agents can view own wallet"
  ON agent_wallets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.check_user_role('adminuser')
  );

CREATE POLICY "Only admins can manage wallets"
  ON agent_wallets
  FOR ALL
  TO authenticated
  USING (auth.check_user_role('adminuser'))
  WITH CHECK (auth.check_user_role('adminuser'));

-- Update policies for agent_transactions
CREATE POLICY "Users can view own transactions"
  ON agent_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM agent_wallets
      WHERE user_id = auth.uid()
    ) OR auth.check_user_role('adminuser')
  );

-- Update policies for agent_commissions
CREATE POLICY "Only admins can manage commissions"
  ON agent_commissions
  FOR ALL
  TO authenticated
  USING (auth.check_user_role('adminuser'))
  WITH CHECK (auth.check_user_role('adminuser'));

-- Ensure wallets exist for all agents
INSERT INTO agent_wallets (user_id, balance, currency, unit_value)
SELECT 
  id,
  1000,
  'EUR',
  1
FROM auth.users
WHERE 
  raw_user_meta_data->>'role' = 'agentuser' OR
  raw_user_meta_data->>'role' = 'agent'
ON CONFLICT (user_id) DO NOTHING;