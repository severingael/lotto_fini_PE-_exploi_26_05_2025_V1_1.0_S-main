/*
  # Wallet System Implementation

  1. New Tables
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `balance` (numeric)
      - `currency` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key) 
      - `wallet_id` (uuid, references wallets)
      - `type` (text - deposit/withdraw/bet/win)
      - `amount` (numeric)
      - `status` (text - pending/completed/failed)
      - `reference` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create wallets table
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win')),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Wallet policies
CREATE POLICY "Users can view own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX wallets_user_id_idx ON wallets(user_id);
CREATE INDEX transactions_wallet_id_idx ON transactions(wallet_id);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX transactions_status_idx ON transactions(status);

-- Updated trigger function
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type IN ('deposit', 'win') THEN
      UPDATE wallets 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('withdraw', 'bet') THEN
      UPDATE wallets 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_wallet_balance_trigger
  AFTER UPDATE OF status ON transactions
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION update_wallet_balance();