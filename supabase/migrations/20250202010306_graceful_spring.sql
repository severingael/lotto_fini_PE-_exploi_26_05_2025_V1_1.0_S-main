-- Fonction pour traiter le paiement d'un ticket lotto
CREATE OR REPLACE FUNCTION process_lotto_payment(
  p_participation_id uuid,
  p_agent_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_participation record;
  v_wallet_id uuid;
  v_payment_amount numeric;
  v_current_balance numeric;
BEGIN
  -- Vérifier et verrouiller la participation
  SELECT * INTO v_participation
  FROM lotto_participations
  WHERE id = p_participation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket non trouvé';
  END IF;

  IF NOT v_participation.is_winner THEN
    RAISE EXCEPTION 'Ce ticket n''est pas gagnant';
  END IF;

  IF v_participation.paid THEN
    RAISE EXCEPTION 'Ce ticket a déjà été payé';
  END IF;

  -- Récupérer l'ID du portefeuille de l'agent
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM agent_wallets
  WHERE user_id = p_agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Portefeuille agent non trouvé';
  END IF;

  v_payment_amount := v_participation.win_amount;

  -- Créer la transaction de crédit
  INSERT INTO agent_transactions (
    wallet_id,
    type,
    amount,
    reference_type,
    reference_id,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_wallet_id,
    'credit',
    v_payment_amount,
    'payout',
    p_participation_id,
    'completed',
    NOW(),
    NOW()
  );

  -- Mettre à jour le solde du portefeuille
  UPDATE agent_wallets
  SET 
    balance = balance + v_payment_amount,
    updated_at = NOW()
  WHERE id = v_wallet_id;

  -- Marquer le ticket comme payé
  UPDATE lotto_participations
  SET
    paid = true,
    paid_at = NOW(),
    paid_by = p_agent_id,
    payment_method = 'cash',
    payment_amount = v_payment_amount
  WHERE id = p_participation_id;

END;
$$;