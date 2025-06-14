/*
  # Initialisation des données des portefeuilles agents

  1. Données de test
    - Création de portefeuilles pour les agents existants
    - Ajout de transactions initiales
    - Configuration des commissions par défaut

  2. Sécurité
    - Ajout de politiques RLS pour les agents et administrateurs
*/

-- Création des portefeuilles pour les agents existants
INSERT INTO agent_wallets (user_id, balance, currency, unit_value)
SELECT 
  id, 
  FLOOR(RANDOM() * 10000), -- Solde aléatoire entre 0 et 10000
  'EUR',
  1
FROM auth.users 
WHERE role = 'agentuser'
ON CONFLICT (user_id) DO UPDATE
SET balance = EXCLUDED.balance;

-- Création des transactions de test
INSERT INTO agent_transactions (
  wallet_id,
  type,
  amount,
  reference_type,
  status,
  created_at
)
SELECT 
  w.id,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'credit'
    WHEN 1 THEN 'debit'
    ELSE 'commission'
  END,
  FLOOR(RANDOM() * 1000),
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'bet'
    WHEN 1 THEN 'payout'
    ELSE 'admin_credit'
  END,
  'completed',
  NOW() - (floor(random() * 30) || ' days')::interval
FROM agent_wallets w
CROSS JOIN generate_series(1, 10);

-- Mise à jour des commissions
INSERT INTO agent_commissions (bet_type, percentage)
VALUES 
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) 
DO UPDATE SET percentage = EXCLUDED.percentage;

-- Politiques RLS supplémentaires
CREATE POLICY "Admins can view all wallets"
  ON agent_wallets
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'adminuser'
  );

CREATE POLICY "Admins can manage all wallets"
  ON agent_wallets
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'adminuser'
  );

CREATE POLICY "Admins can view all transactions"
  ON agent_transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'adminuser'
  );

CREATE POLICY "Admins can manage all transactions"
  ON agent_transactions
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'adminuser'
  );