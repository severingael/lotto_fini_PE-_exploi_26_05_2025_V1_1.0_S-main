/*
  # Calcul des gains Lotto

  1. Nouvelles Tables
    - `lotto_prize_calculations`
      - `id` (uuid, primary key)
      - `lotto_id` (uuid, référence vers lottos)
      - `winning_numbers` (integer[])
      - `jackpot_amount` (numeric)
      - `calculation_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lotto_prize_tiers`
      - `id` (uuid, primary key)
      - `calculation_id` (uuid, référence vers lotto_prize_calculations)
      - `numbers_matched` (integer)
      - `prize_amount` (numeric)
      - `winners_count` (integer)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les nouvelles tables
    - Politiques pour les administrateurs et le staff

  3. Fonctions
    - Fonction pour calculer les gains
    - Fonction pour mettre à jour les participations
*/

-- Table pour stocker les calculs de gains
CREATE TABLE IF NOT EXISTS lotto_prize_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lotto_id uuid REFERENCES lottos NOT NULL,
  winning_numbers integer[] NOT NULL,
  jackpot_amount numeric NOT NULL CHECK (jackpot_amount >= 0),
  calculation_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table pour stocker les niveaux de gains
CREATE TABLE IF NOT EXISTS lotto_prize_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id uuid REFERENCES lotto_prize_calculations NOT NULL,
  numbers_matched integer NOT NULL CHECK (numbers_matched >= 0),
  prize_amount numeric NOT NULL CHECK (prize_amount >= 0),
  winners_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE lotto_prize_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotto_prize_tiers ENABLE ROW LEVEL SECURITY;

-- Policies pour lotto_prize_calculations
CREATE POLICY "Admins can manage prize calculations"
  ON lotto_prize_calculations
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('adminuser', 'staffuser'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('adminuser', 'staffuser'));

CREATE POLICY "Everyone can view prize calculations"
  ON lotto_prize_calculations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour lotto_prize_tiers
CREATE POLICY "Admins can manage prize tiers"
  ON lotto_prize_tiers
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('adminuser', 'staffuser'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('adminuser', 'staffuser'));

CREATE POLICY "Everyone can view prize tiers"
  ON lotto_prize_tiers
  FOR SELECT
  TO authenticated
  USING (true);

-- Fonction pour calculer les gains
CREATE OR REPLACE FUNCTION calculate_lotto_prizes(
  p_lotto_id uuid,
  p_winning_numbers integer[],
  p_jackpot_amount numeric,
  p_prize_tiers jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_calculation_id uuid;
  v_tier jsonb;
BEGIN
  -- Créer l'enregistrement de calcul
  INSERT INTO lotto_prize_calculations (
    lotto_id,
    winning_numbers,
    jackpot_amount
  ) VALUES (
    p_lotto_id,
    p_winning_numbers,
    p_jackpot_amount
  ) RETURNING id INTO v_calculation_id;

  -- Insérer les niveaux de prix
  FOR v_tier IN SELECT * FROM jsonb_array_elements(p_prize_tiers)
  LOOP
    INSERT INTO lotto_prize_tiers (
      calculation_id,
      numbers_matched,
      prize_amount,
      winners_count
    ) VALUES (
      v_calculation_id,
      (v_tier->>'numbers')::integer,
      (v_tier->>'amount')::numeric,
      0 -- Sera mis à jour plus tard
    );
  END LOOP;

  -- Mettre à jour les participations
  WITH matched_numbers AS (
    SELECT 
      p.id,
      p.selected_numbers,
      (
        SELECT COUNT(*)
        FROM unnest(p.selected_numbers) n
        WHERE n = ANY(p_winning_numbers)
      ) as matches
    FROM lotto_participations p
    WHERE p.lotto_id = p_lotto_id
      AND p.status = 'active'
  ),
  winners AS (
    UPDATE lotto_participations p
    SET 
      is_winner = m.matches >= (
        SELECT MIN(numbers_matched)
        FROM lotto_prize_tiers
        WHERE calculation_id = v_calculation_id
      ),
      matched_numbers = m.matches,
      win_amount = COALESCE((
        SELECT prize_amount
        FROM lotto_prize_tiers
        WHERE calculation_id = v_calculation_id
          AND numbers_matched = m.matches
      ), 0)
    FROM matched_numbers m
    WHERE p.id = m.id
    RETURNING p.matched_numbers
  )
  UPDATE lotto_prize_tiers t
  SET winners_count = w.count
  FROM (
    SELECT matched_numbers, COUNT(*) as count
    FROM winners
    GROUP BY matched_numbers
  ) w
  WHERE t.calculation_id = v_calculation_id
    AND t.numbers_matched = w.matched_numbers;

  -- Marquer le lotto comme calculé
  UPDATE lottos
  SET 
    prize_calculated = true,
    winning_numbers = p_winning_numbers,
    status = 'completed'
  WHERE id = p_lotto_id;

  RETURN v_calculation_id;
END;
$$;