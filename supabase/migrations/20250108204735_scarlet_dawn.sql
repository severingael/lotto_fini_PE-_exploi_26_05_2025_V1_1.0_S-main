/*
  # Initialisation des données des portefeuilles agents

  1. Nouvelles Tables
    - `agent_wallets`: Portefeuilles des agents
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence vers auth.users)
      - `balance` (numeric)
      - `currency` (text)
      - `unit_value` (numeric)
      - timestamps

    - `agent_transactions`: Historique des transactions
      - `id` (uuid, primary key) 
      - `wallet_id` (uuid, référence vers agent_wallets)
      - `type` (text: credit/debit/commission)
      - `amount` (numeric)
      - `reference_type` (text)
      - `status` (text)
      - timestamps

  2. Données initiales
    - Création des portefeuilles pour les agents existants
    - Transactions initiales de test
*/

-- Création des portefeuilles pour les agents existants
INSERT INTO agent_wallets (user_id, balance, currency, unit_value)
SELECT 
  id, 
  1000, -- Solde initial de test
  'EUR',
  1
FROM auth.users 
WHERE role = 'agentuser'
AND NOT EXISTS (
  SELECT 1 FROM agent_wallets WHERE user_id = auth.users.id
);

-- Création des transactions initiales
INSERT INTO agent_transactions (
  wallet_id,
  type,
  amount,
  reference_type,
  status
)
SELECT 
  w.id,
  'credit',
  1000,
  'admin_credit',
  'completed'
FROM agent_wallets w
WHERE NOT EXISTS (
  SELECT 1 FROM agent_transactions 
  WHERE wallet_id = w.id
);

-- Mise à jour des commissions
INSERT INTO agent_commissions (bet_type, percentage)
VALUES 
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) 
DO UPDATE SET percentage = EXCLUDED.percentage;

-- Fonction pour calculer les commissions
CREATE OR REPLACE FUNCTION calculate_agent_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Récupérer le pourcentage de commission
    DECLARE
      commission_pct numeric;
    BEGIN
      SELECT percentage INTO commission_pct
      FROM agent_commissions
      WHERE bet_type = NEW.reference_type;

      IF FOUND THEN
        -- Créer la transaction de commission
        INSERT INTO agent_transactions (
          wallet_id,
          type,
          amount,
          reference_type,
          reference_id,
          status
        ) VALUES (
          NEW.wallet_id,
          'commission',
          NEW.amount * (commission_pct / 100),
          'commission',
          NEW.id,
          'completed'
        );
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le calcul automatique des commissions
DROP TRIGGER IF EXISTS calculate_agent_commission_trigger ON agent_transactions;
CREATE TRIGGER calculate_agent_commission_trigger
  AFTER UPDATE OF status ON agent_transactions
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION calculate_agent_commission();