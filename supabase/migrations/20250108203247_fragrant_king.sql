-- Initialisation des commissions par défaut
INSERT INTO agent_commissions (bet_type, percentage) VALUES
  ('simple', 5),
  ('combine', 7)
ON CONFLICT (bet_type) DO NOTHING;

-- Fonction pour créer automatiquement un portefeuille agent
CREATE OR REPLACE FUNCTION create_agent_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'agentuser' THEN
    INSERT INTO agent_wallets (user_id, balance, currency)
    VALUES (NEW.id, 0, 'EUR')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement un portefeuille lors de la création d'un agent
CREATE TRIGGER create_agent_wallet_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_agent_wallet();

-- Créer les portefeuilles pour les agents existants
DO $$ 
BEGIN
  INSERT INTO agent_wallets (user_id, balance, currency)
  SELECT id, 0, 'EUR'
  FROM auth.users
  WHERE role = 'agentuser'
  ON CONFLICT (user_id) DO NOTHING;
END $$;