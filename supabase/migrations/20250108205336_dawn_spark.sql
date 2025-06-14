/*
  # Configuration des commissions des agents

  1. Tables
    - `agent_commissions` pour stocker les configurations de commission
    - Colonnes pour différents types de paris et pourcentages

  2. Sécurité
    - RLS pour restreindre l'accès aux administrateurs
    - Politiques de lecture pour les agents
*/

-- Create agent commissions table
CREATE TABLE IF NOT EXISTS agent_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_type text NOT NULL UNIQUE,
  percentage numeric NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;

-- Policies
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
    auth.jwt() ->> 'role' = 'adminuser'
  );

-- Insert default commissions
INSERT INTO agent_commissions (bet_type, percentage) VALUES
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) DO NOTHING;