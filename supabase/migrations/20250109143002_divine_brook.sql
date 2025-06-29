/*
  # Fix Wallet Access Issues

  1. New Tables
    - `agent_wallets` table with proper constraints and defaults
    - `agent_transactions` table for tracking wallet operations
    - `agent_commissions` table for commission configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Add functions for wallet operations

  3. Changes
    - Add indexes for performance
    - Add triggers for automatic balance updates
    - Add default data for testing
*/

-- Drop existing tables if they exist to ensure clean state
DROP TABLE IF EXISTS agent_transactions CASCADE;
DROP TABLE IF EXISTS agent_wallets CASCADE;
DROP TABLE IF EXISTS agent_commissions CASCADE;

-- Create agent_wallets table
CREATE TABLE agent_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  unit_value numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create agent_transactions table
CREATE TABLE agent_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES agent_wallets NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'commission')),
  amount numeric NOT NULL CHECK (amount > 0),
  reference_type text NOT NULL CHECK (reference_type IN ('bet', 'payout', 'admin_credit')),
  reference_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create agent_commissions table
CREATE TABLE agent_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_type text NOT NULL UNIQUE,
  percentage numeric NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;

-- Policies for agent_wallets
CREATE POLICY "Agents can view own wallet"
  ON agent_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'adminuser');

CREATE POLICY "Only admins can manage wallets"
  ON agent_wallets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'adminuser')
  WITH CHECK (auth.jwt() ->> 'role' = 'adminuser');

-- Policies for agent_transactions
CREATE POLICY "Users can view own transactions"
  ON agent_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM agent_wallets
      WHERE user_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'adminuser'
  );

-- Policies for agent_commissions
CREATE POLICY "Everyone can view commissions"
  ON agent_commissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage commissions"
  ON agent_commissions
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'adminuser')
  WITH CHECK (auth.jwt() ->> 'role' = 'adminuser');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_wallets_user_id ON agent_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_wallet_id ON agent_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_status ON agent_transactions(status);

-- Function to process wallet transactions
CREATE OR REPLACE FUNCTION process_agent_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type IN ('credit', 'commission') THEN
      UPDATE agent_wallets 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'debit' THEN
      -- Check sufficient balance
      IF NOT EXISTS (
        SELECT 1 FROM agent_wallets
        WHERE id = NEW.wallet_id AND balance >= NEW.amount
      ) THEN
        RAISE EXCEPTION 'Insufficient balance';
      END IF;
      
      UPDATE agent_wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction processing
DROP TRIGGER IF EXISTS process_agent_transaction_trigger ON agent_transactions;
CREATE TRIGGER process_agent_transaction_trigger
  AFTER UPDATE OF status ON agent_transactions
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION process_agent_transaction();

-- Function to create agent wallet automatically
CREATE OR REPLACE FUNCTION create_agent_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'agentuser' THEN
    INSERT INTO agent_wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic wallet creation
DROP TRIGGER IF EXISTS create_agent_wallet_trigger ON auth.users;
CREATE TRIGGER create_agent_wallet_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_agent_wallet();

-- Insert default commissions
INSERT INTO agent_commissions (bet_type, percentage)
VALUES 
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) DO UPDATE
SET percentage = EXCLUDED.percentage;

-- Create wallets for existing agents
INSERT INTO agent_wallets (user_id, balance, currency, unit_value)
SELECT 
  id,
  1000,
  'EUR',
  1
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'agentuser'
ON CONFLICT (user_id) DO NOTHING;