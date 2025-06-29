/*
  # Implémentation du portefeuille staff

  1. New Tables
    - `staff_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `balance` (numeric)
      - `currency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `staff_commission_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `balance` (numeric)
      - `currency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `staff_transactions`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, references staff_wallets)
      - `type` (text)
      - `amount` (numeric)
      - `reference_type` (text)
      - `reference_id` (uuid)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for staff and admin access
*/

-- Create staff_wallets table
CREATE TABLE IF NOT EXISTS staff_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create staff_commission_wallets table
CREATE TABLE IF NOT EXISTS staff_commission_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create staff_transactions table
CREATE TABLE IF NOT EXISTS staff_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES staff_wallets NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'commission')),
  amount numeric NOT NULL CHECK (amount > 0),
  reference_type text NOT NULL CHECK (reference_type IN ('payout', 'admin_credit')),
  reference_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_commission_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for staff_wallets
CREATE POLICY "Staff can view own wallet"
  ON staff_wallets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'adminuser'
  );

CREATE POLICY "Only admins can manage staff wallets"
  ON staff_wallets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'adminuser')
  WITH CHECK (auth.jwt() ->> 'role' = 'adminuser');

-- Policies for staff_commission_wallets
CREATE POLICY "Staff can view own commission wallet"
  ON staff_commission_wallets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'adminuser'
  );

CREATE POLICY "Only admins can manage staff commission wallets"
  ON staff_commission_wallets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'adminuser')
  WITH CHECK (auth.jwt() ->> 'role' = 'adminuser');

-- Policies for staff_transactions
CREATE POLICY "Staff can view own transactions"
  ON staff_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM staff_wallets
      WHERE user_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'adminuser'
  );

-- Function to process staff transactions
CREATE OR REPLACE FUNCTION process_staff_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type IN ('credit', 'commission') THEN
      UPDATE staff_wallets 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'debit' THEN
      -- Check sufficient balance
      IF NOT EXISTS (
        SELECT 1 FROM staff_wallets
        WHERE id = NEW.wallet_id AND balance >= NEW.amount
      ) THEN
        RAISE EXCEPTION 'Insufficient balance';
      END IF;
      
      UPDATE staff_wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction processing
CREATE TRIGGER process_staff_transaction_trigger
  AFTER UPDATE OF status ON staff_transactions
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION process_staff_transaction();

-- Function to create staff wallets automatically
CREATE OR REPLACE FUNCTION create_staff_wallets()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'staffuser' THEN
    -- Create main wallet
    INSERT INTO staff_wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create commission wallet
    INSERT INTO staff_commission_wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic wallet creation
CREATE TRIGGER create_staff_wallets_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_staff_wallets();

-- Create wallets for existing staff
INSERT INTO staff_wallets (user_id, balance, currency)
SELECT 
  id,
  1000,
  'EUR'
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'staffuser'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO staff_commission_wallets (user_id, balance, currency)
SELECT 
  id,
  0,
  'EUR'
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'staffuser'
ON CONFLICT (user_id) DO NOTHING;