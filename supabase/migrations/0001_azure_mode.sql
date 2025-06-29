/*
  # Create bets table and related schemas

  1. New Tables
    - `bets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `match` (text)
      - `selection` (text)
      - `odds` (numeric)
      - `stake` (numeric)
      - `status` (text)
      - `date` (timestamptz)
      - `type` (text)
      - `potential_win` (numeric)
      - `actual_win` (numeric)
      - `matches` (jsonb)
      - `total_odds` (numeric)
      - `match_time` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bets` table
    - Add policies for CRUD operations
*/

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  match text,
  selection text,
  odds numeric NOT NULL,
  stake numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  date timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  potential_win numeric,
  actual_win numeric,
  matches jsonb,
  total_odds numeric,
  match_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own bets"
  ON bets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bets"
  ON bets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update bet status"
  ON bets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'adminuser'
    )
  )
  WITH CHECK (
    (OLD.status, NEW.status) IN (
      ('pending', 'won'),
      ('pending', 'lost')
    )
  );

-- Indexes
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_status_idx ON bets(status);
CREATE INDEX bets_date_idx ON bets(date);