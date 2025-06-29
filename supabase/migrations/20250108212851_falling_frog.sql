-- Create function to credit agent wallet
CREATE OR REPLACE FUNCTION credit_agent_wallet(
  p_wallet_id uuid,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify wallet exists
  IF NOT EXISTS (SELECT 1 FROM agent_wallets WHERE id = p_wallet_id) THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Verify amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Update wallet balance
  UPDATE agent_wallets 
  SET 
    balance = balance + p_amount,
    updated_at = now()
  WHERE id = p_wallet_id;

  -- Create transaction record
  INSERT INTO agent_transactions (
    wallet_id,
    type,
    amount,
    reference_type,
    status
  ) VALUES (
    p_wallet_id,
    'credit',
    p_amount,
    'admin_credit',
    'completed'
  );
END;
$$;