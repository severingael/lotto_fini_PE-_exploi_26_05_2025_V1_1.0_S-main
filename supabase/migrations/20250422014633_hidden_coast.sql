/*
  # Agent Commission Deduction on Ticket Cancellation

  1. Changes
    - Modify the cancel_participation function to deduct 5% of the ticket amount from the agent's commission wallet
    - Add transaction record for the commission deduction
    - Ensure all existing functionality is preserved

  2. Security
    - Maintain existing security checks and validations
    - Ensure proper error handling
*/

-- Update the function to deduct commission on ticket cancellation
CREATE OR REPLACE FUNCTION cancel_participation(
  p_participation_id uuid,
  p_cancelled_by uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_participation record;
  v_agent_id uuid;
  v_ticket_price numeric;
  v_commission_amount numeric;
  v_commission_wallet_id uuid;
  v_commission_balance numeric;
BEGIN
  -- Get the participation document
  SELECT * INTO v_participation
  FROM lotto_participations
  WHERE id = p_participation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket non trouvé';
  END IF;

  -- Check if ticket can be cancelled
  IF v_participation.status = 'cancelled' THEN
    RAISE EXCEPTION 'Ce ticket est déjà annulé';
  END IF;

  IF v_participation.paid THEN
    RAISE EXCEPTION 'Impossible d''annuler un ticket déjà payé';
  END IF;

  -- Check if lotto is still active
  DECLARE
    v_lotto record;
    v_now timestamptz := now();
  BEGIN
    SELECT * INTO v_lotto
    FROM lottos
    WHERE id = v_participation.lotto_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lotto non trouvé';
    END IF;

    IF v_now >= v_lotto.end_date THEN
      RAISE EXCEPTION 'Impossible d''annuler un ticket après la fin du lotto';
    END IF;
  END;

  -- Check cancellation window (15 minutes)
  DECLARE
    v_purchase_time timestamptz := v_participation.purchase_date;
    v_now timestamptz := now();
    v_minutes_since_purchase integer;
    v_cancellation_window_minutes constant integer := 15;
  BEGIN
    v_minutes_since_purchase := EXTRACT(EPOCH FROM (v_now - v_purchase_time)) / 60;

    IF v_minutes_since_purchase > v_cancellation_window_minutes THEN
      RAISE EXCEPTION 'Le délai d''annulation de % minutes est dépassé', v_cancellation_window_minutes;
    END IF;
  END;

  -- Check if user has permission to cancel
  DECLARE
    v_user_role text;
  BEGIN
    SELECT raw_user_meta_data->>'role' INTO v_user_role
    FROM auth.users
    WHERE id = p_cancelled_by;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;

    IF NOT v_user_role = ANY(ARRAY['agentuser', 'staffuser', 'adminuser']) THEN
      RAISE EXCEPTION 'Vous n''avez pas les droits pour annuler ce ticket';
    END IF;
  END;

  -- Store the agent ID and ticket price for commission calculation
  v_agent_id := v_participation.user_id;
  v_ticket_price := v_participation.ticket_price;
  
  -- Calculate 5% commission deduction
  v_commission_amount := v_ticket_price * 0.05;

  -- Get agent commission wallet
  SELECT id, balance INTO v_commission_wallet_id, v_commission_balance
  FROM agent_commission_wallets
  WHERE user_id = v_agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Portefeuille de commission non trouvé';
  END IF;

  -- Check if commission wallet has enough balance
  IF v_commission_balance < v_commission_amount THEN
    -- If not enough balance, deduct what's available
    v_commission_amount := v_commission_balance;
  END IF;

  -- Get agent wallet for refund
  DECLARE
    v_wallet_id uuid;
    v_current_balance numeric;
  BEGIN
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM agent_wallets
    WHERE user_id = v_agent_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Portefeuille non trouvé';
    END IF;

    -- Create refund transaction
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
      v_ticket_price,
      'refund',
      p_participation_id,
      'completed',
      now(),
      now()
    );

    -- Update wallet balance
    UPDATE agent_wallets
    SET 
      balance = v_current_balance + v_ticket_price,
      updated_at = now()
    WHERE id = v_wallet_id;

    -- If commission amount is greater than zero, deduct from commission wallet
    IF v_commission_amount > 0 THEN
      -- Create commission deduction transaction
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
        v_commission_wallet_id,
        'debit',
        v_commission_amount,
        'cancellation_fee',
        p_participation_id,
        'completed',
        now(),
        now()
      );

      -- Update commission wallet balance
      UPDATE agent_commission_wallets
      SET 
        balance = v_commission_balance - v_commission_amount,
        updated_at = now()
      WHERE id = v_commission_wallet_id;
    END IF;

    -- Update participation status
    UPDATE lotto_participations
    SET
      status = 'cancelled',
      cancelled_by = p_cancelled_by,
      cancelled_at = now(),
      cancellation_fee = v_commission_amount
    WHERE id = p_participation_id;
  END;
END;
$$;

-- Add cancellation_fee column to lotto_participations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'lotto_participations' AND column_name = 'cancellation_fee'
  ) THEN
    ALTER TABLE lotto_participations ADD COLUMN cancellation_fee numeric DEFAULT 0;
  END IF;
END $$;

-- Add cancellation_fee reference type to agent_transactions check constraint
ALTER TABLE agent_transactions DROP CONSTRAINT IF EXISTS agent_transactions_reference_type_check;
ALTER TABLE agent_transactions ADD CONSTRAINT agent_transactions_reference_type_check 
  CHECK (reference_type IN ('bet', 'payout', 'admin_credit', 'refund', 'cancellation_fee'));