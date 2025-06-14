/*
  # Système de portefeuille agent

  1. Nouvelles Tables
    - `agent_wallets` - Portefeuilles des agents
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `balance` (numeric)
      - `currency` (text)
      - `unit_value` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `agent_transactions` - Transactions des agents
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, foreign key)
      - `type` (text) - 'credit', 'debit', 'commission'
      - `amount` (numeric)
      - `reference_type` (text) - 'bet', 'payout', 'admin_credit'
      - `reference_id` (uuid)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `agent_commissions` - Configuration des commissions
      - `id` (uuid, primary key)
      - `bet_type` (text)
      - `percentage` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for agents and admins
*/

-- Create agent_wallets table
CREATE TABLE IF NOT EXISTS agent_wallets (
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
CREATE TABLE IF NOT EXISTS agent_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES agent_wallets NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'commission')),
  amount numeric NOT NULL,
  reference_type text NOT NULL CHECK (reference_type IN ('bet', 'payout', 'admin_credit')),
  reference_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create agent_commissions table
CREATE TABLE IF NOT EXISTS agent_commissions (
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
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can create wallets"
  ON agent_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'adminuser'
    )
  );

CREATE POLICY "Only admins can update wallets"
  ON agent_wallets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'adminuser'
    )
  );

-- Policies for agent_transactions
CREATE POLICY "Agents can view own transactions"
  ON agent_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM agent_wallets
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can create transactions"
  ON agent_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM agent_wallets
      WHERE user_id = auth.uid()
    )
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
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'adminuser'
    )
  );

-- Indexes
CREATE INDEX agent_wallets_user_id_idx ON agent_wallets(user_id);
CREATE INDEX agent_transactions_wallet_id_idx ON agent_transactions(wallet_id);
CREATE INDEX agent_transactions_type_idx ON agent_transactions(type);
CREATE INDEX agent_transactions_status_idx ON agent_transactions(status);

-- Functions
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
      UPDATE agent_wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for agent transactions
CREATE TRIGGER process_agent_transaction_trigger
  AFTER UPDATE OF status ON agent_transactions
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION process_agent_transaction();

-- Insert default commissions
INSERT INTO agent_commissions (bet_type, percentage) VALUES
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) DO NOTHING;