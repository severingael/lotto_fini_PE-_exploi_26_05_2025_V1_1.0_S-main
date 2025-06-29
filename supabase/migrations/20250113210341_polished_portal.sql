/*
  # Vérification du solde de l'agent pour les tickets Lotto

  1. Nouvelles fonctions
    - Fonction pour vérifier le solde de l'agent
    - Fonction pour valider la soumission d'un ticket Lotto

  2. Sécurité
    - Vérification du solde positif avant la soumission
    - Vérification du rôle agent
    - Vérification de l'existence du portefeuille

  3. Changements
    - Ajout d'une fonction de validation
    - Ajout d'une politique RLS pour la soumission
*/

-- Fonction pour vérifier si l'agent a un solde positif
CREATE OR REPLACE FUNCTION check_agent_wallet_balance(agent_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallet_balance numeric;
BEGIN
  SELECT balance INTO wallet_balance
  FROM agent_wallets
  WHERE user_id = agent_id;
  
  RETURN COALESCE(wallet_balance > 0, false);
END;
$$;

-- Fonction pour valider la soumission d'un ticket Lotto
CREATE OR REPLACE FUNCTION validate_lotto_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'utilisateur est un agent
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'agentuser'
  ) THEN
    RAISE EXCEPTION 'Seuls les agents peuvent soumettre des tickets Lotto';
  END IF;

  -- Vérifier si l'agent a un solde positif
  IF NOT check_agent_wallet_balance(auth.uid()) THEN
    RAISE EXCEPTION 'Solde insuffisant pour soumettre un ticket Lotto';
  END IF;

  RETURN NEW;
END;
$$;

-- Créer le trigger pour la validation
DROP TRIGGER IF EXISTS validate_lotto_submission_trigger ON lotto_participations;
CREATE TRIGGER validate_lotto_submission_trigger
  BEFORE INSERT ON lotto_participations
  FOR EACH ROW
  EXECUTE FUNCTION validate_lotto_submission();

-- Mettre à jour la politique RLS pour la soumission
DROP POLICY IF EXISTS "Agents can submit lotto tickets" ON lotto_participations;
CREATE POLICY "Agents can submit lotto tickets"
  ON lotto_participations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'agentuser'
    AND check_agent_wallet_balance(auth.uid())
  );