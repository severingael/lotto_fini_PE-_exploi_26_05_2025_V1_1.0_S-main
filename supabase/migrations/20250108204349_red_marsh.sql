/*
  # Initialisation des données des portefeuilles agents

  1. Tables
    - `agent_wallets`: Portefeuilles des agents
    - `agent_transactions`: Transactions des agents
    - `agent_commissions`: Commissions par type de pari

  2. Données initiales
    - Commissions par défaut
    - Portefeuilles pour les agents existants
    - Transactions de test
*/

-- Insertion des données de test pour les portefeuilles
INSERT INTO agent_wallets (user_id, balance, currency, unit_value)
SELECT 
  id, 
  1000, -- Solde initial de test
  'EUR',
  1
FROM auth.users 
WHERE role = 'agentuser'
ON CONFLICT (user_id) DO NOTHING;

-- Insertion des transactions de test
INSERT INTO agent_transactions (wallet_id, type, amount, reference_type, status)
SELECT 
  aw.id,
  'credit',
  1000,
  'admin_credit',
  'completed'
FROM agent_wallets aw
WHERE NOT EXISTS (
  SELECT 1 FROM agent_transactions 
  WHERE wallet_id = aw.id
)
ON CONFLICT DO NOTHING;

-- Mise à jour des commissions par défaut
INSERT INTO agent_commissions (bet_type, percentage) VALUES
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) DO UPDATE 
SET percentage = EXCLUDED.percentage;