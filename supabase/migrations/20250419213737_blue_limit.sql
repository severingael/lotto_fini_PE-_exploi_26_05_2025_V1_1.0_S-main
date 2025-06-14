/*
  # Dual Manager Approval System

  1. New Tables
    - `approval_requests` - Stores approval requests that need manager validation
      - `id` (uuid, primary key)
      - `lotto_id` (uuid, reference to lottos)
      - `request_type` (text) - Type of request (e.g., 'prize_calculation')
      - `request_data` (jsonb) - Data associated with the request
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `created_at` (timestamptz)
      - `created_by` (uuid, reference to auth.users)
      - `updated_at` (timestamptz)
    
    - `approval_votes` - Stores individual manager votes on requests
      - `id` (uuid, primary key)
      - `request_id` (uuid, reference to approval_requests)
      - `manager_id` (uuid, reference to auth.users)
      - `decision` (text) - 'approve' or 'reject'
      - `comment` (text) - Optional comment
      - `created_at` (timestamptz)
    
    - `approval_history` - Tracks all approval-related activities
      - `id` (uuid, primary key)
      - `request_id` (uuid, reference to approval_requests)
      - `user_id` (uuid, reference to auth.users)
      - `action` (text) - 'created', 'approved', 'rejected', 'commented', etc.
      - `details` (jsonb) - Additional details about the action
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for managers and admins

  3. Functions
    - Function to create approval requests
    - Function to vote on approval requests
    - Function to check if request is approved (requires 2 approvals)
    - Function to process approved requests
*/

-- Create approval_requests table
CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lotto_id uuid REFERENCES lottos NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('prize_calculation')),
  request_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create approval_votes table
CREATE TABLE IF NOT EXISTS approval_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES approval_requests NOT NULL,
  manager_id uuid REFERENCES auth.users NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, manager_id)
);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES approval_requests NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'commented', 'processed')),
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

-- Policies for approval_requests
CREATE POLICY "Managers and admins can view approval requests"
  ON approval_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('manageruser', 'adminuser')
  );

CREATE POLICY "Managers and admins can create approval requests"
  ON approval_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('manageruser', 'adminuser')
  );

CREATE POLICY "Only admins can update approval requests"
  ON approval_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'adminuser'
  );

-- Policies for approval_votes
CREATE POLICY "Managers can vote on approval requests"
  ON approval_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'manageruser'
  );

CREATE POLICY "Managers and admins can view votes"
  ON approval_votes
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('manageruser', 'adminuser')
  );

-- Policies for approval_history
CREATE POLICY "Managers and admins can view approval history"
  ON approval_history
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('manageruser', 'adminuser')
  );

CREATE POLICY "System can create approval history"
  ON approval_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('manageruser', 'adminuser')
  );

-- Function to create an approval request
CREATE OR REPLACE FUNCTION create_approval_request(
  p_lotto_id uuid,
  p_request_type text,
  p_request_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Validate request type
  IF p_request_type NOT IN ('prize_calculation') THEN
    RAISE EXCEPTION 'Invalid request type';
  END IF;

  -- Create the request
  INSERT INTO approval_requests (
    lotto_id,
    request_type,
    request_data,
    created_by
  ) VALUES (
    p_lotto_id,
    p_request_type,
    p_request_data,
    auth.uid()
  ) RETURNING id INTO v_request_id;

  -- Log the creation in history
  INSERT INTO approval_history (
    request_id,
    user_id,
    action,
    details
  ) VALUES (
    v_request_id,
    auth.uid(),
    'created',
    jsonb_build_object(
      'lotto_id', p_lotto_id,
      'request_type', p_request_type
    )
  );

  RETURN v_request_id;
END;
$$;

-- Function to vote on an approval request
CREATE OR REPLACE FUNCTION vote_on_approval_request(
  p_request_id uuid,
  p_decision text,
  p_comment text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request record;
  v_approval_count integer;
  v_rejection_count integer;
  v_manager_role text;
  v_can_approve boolean;
BEGIN
  -- Check if user is a manager
  SELECT raw_user_meta_data->>'role' INTO v_manager_role
  FROM auth.users
  WHERE id = auth.uid();

  IF v_manager_role != 'manageruser' THEN
    RAISE EXCEPTION 'Only managers can vote on approval requests';
  END IF;

  -- Check if manager has permission to approve
  SELECT COALESCE(raw_user_meta_data->>'canApprove', 'true')::boolean INTO v_can_approve
  FROM auth.users
  WHERE id = auth.uid();

  IF NOT v_can_approve THEN
    RAISE EXCEPTION 'You do not have permission to approve requests';
  END IF;

  -- Get the request
  SELECT * INTO v_request
  FROM approval_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request not found';
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'This request has already been % and cannot be voted on', v_request.status;
  END IF;

  -- Record the vote
  INSERT INTO approval_votes (
    request_id,
    manager_id,
    decision,
    comment
  ) VALUES (
    p_request_id,
    auth.uid(),
    p_decision,
    p_comment
  )
  ON CONFLICT (request_id, manager_id) DO UPDATE
  SET 
    decision = EXCLUDED.decision,
    comment = EXCLUDED.comment,
    created_at = now();

  -- Log the vote in history
  INSERT INTO approval_history (
    request_id,
    user_id,
    action,
    details
  ) VALUES (
    p_request_id,
    auth.uid(),
    CASE WHEN p_decision = 'approve' THEN 'approved' ELSE 'rejected' END,
    jsonb_build_object(
      'comment', p_comment
    )
  );

  -- Count votes
  SELECT 
    COUNT(*) FILTER (WHERE decision = 'approve'),
    COUNT(*) FILTER (WHERE decision = 'reject')
  INTO 
    v_approval_count,
    v_rejection_count
  FROM approval_votes
  WHERE request_id = p_request_id;

  -- Update request status based on votes
  IF v_rejection_count > 0 THEN
    -- Any rejection means the request is rejected
    UPDATE approval_requests
    SET 
      status = 'rejected',
      updated_at = now()
    WHERE id = p_request_id;

    -- Log the rejection in history
    INSERT INTO approval_history (
      request_id,
      user_id,
      action,
      details
    ) VALUES (
      p_request_id,
      auth.uid(),
      'processed',
      jsonb_build_object(
        'final_status', 'rejected',
        'reason', 'Rejected by at least one manager'
      )
    );
  ELSIF v_approval_count >= 2 THEN
    -- At least 2 approvals means the request is approved
    UPDATE approval_requests
    SET 
      status = 'approved',
      updated_at = now()
    WHERE id = p_request_id;

    -- Log the approval in history
    INSERT INTO approval_history (
      request_id,
      user_id,
      action,
      details
    ) VALUES (
      p_request_id,
      auth.uid(),
      'processed',
      jsonb_build_object(
        'final_status', 'approved',
        'reason', 'Approved by at least two managers'
      )
    );

    -- Process the approved request
    CASE v_request.request_type
      WHEN 'prize_calculation' THEN
        -- Process prize calculation
        PERFORM process_prize_calculation(p_request_id);
      ELSE
        -- Unknown request type
        RAISE EXCEPTION 'Unknown request type: %', v_request.request_type;
    END CASE;
  END IF;
END;
$$;

-- Function to process an approved prize calculation
CREATE OR REPLACE FUNCTION process_prize_calculation(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request record;
  v_calculation_id uuid;
BEGIN
  -- Get the request
  SELECT * INTO v_request
  FROM approval_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request not found';
  END IF;

  IF v_request.status != 'approved' THEN
    RAISE EXCEPTION 'Cannot process unapproved request';
  END IF;

  IF v_request.request_type != 'prize_calculation' THEN
    RAISE EXCEPTION 'Not a prize calculation request';
  END IF;

  -- Extract data from the request
  DECLARE
    v_lotto_id uuid := v_request.lotto_id;
    v_winning_numbers integer[] := v_request.request_data->>'winningNumbers';
    v_jackpot_amount numeric := (v_request.request_data->>'jackpotAmount')::numeric;
    v_prize_distribution jsonb := v_request.request_data->'prizeDistribution';
  BEGIN
    -- Call the existing prize calculation function
    SELECT calculate_lotto_prizes(
      v_lotto_id,
      v_winning_numbers,
      v_jackpot_amount,
      v_prize_distribution
    ) INTO v_calculation_id;

    -- Log the processing in history
    INSERT INTO approval_history (
      request_id,
      user_id,
      action,
      details
    ) VALUES (
      p_request_id,
      auth.uid(),
      'processed',
      jsonb_build_object(
        'calculation_id', v_calculation_id,
        'lotto_id', v_lotto_id
      )
    );
  END;
END;
$$;

-- Function to get approval request details with votes
CREATE OR REPLACE FUNCTION get_approval_request_details(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT 
    jsonb_build_object(
      'request', row_to_json(r),
      'votes', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', v.id,
            'manager_id', v.manager_id,
            'manager_email', (SELECT email FROM auth.users WHERE id = v.manager_id),
            'decision', v.decision,
            'comment', v.comment,
            'created_at', v.created_at
          )
        )
        FROM approval_votes v
        WHERE v.request_id = r.id
      ),
      'history', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', h.id,
            'user_id', h.user_id,
            'user_email', (SELECT email FROM auth.users WHERE id = h.user_id),
            'action', h.action,
            'details', h.details,
            'created_at', h.created_at
          )
          ORDER BY h.created_at DESC
        )
        FROM approval_history h
        WHERE h.request_id = r.id
      )
    ) INTO v_result
  FROM approval_requests r
  WHERE r.id = p_request_id;

  RETURN v_result;
END;
$$;

-- Function to get all approval requests with summary information
CREATE OR REPLACE FUNCTION get_approval_requests_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'lotto_id', r.lotto_id,
      'lotto_name', (SELECT event_name FROM lottos WHERE id = r.lotto_id),
      'request_type', r.request_type,
      'status', r.status,
      'created_at', r.created_at,
      'created_by', r.created_by,
      'created_by_email', (SELECT email FROM auth.users WHERE id = r.created_by),
      'vote_count', (SELECT COUNT(*) FROM approval_votes WHERE request_id = r.id),
      'approval_count', (SELECT COUNT(*) FROM approval_votes WHERE request_id = r.id AND decision = 'approve'),
      'rejection_count', (SELECT COUNT(*) FROM approval_votes WHERE request_id = r.id AND decision = 'reject')
    )
    ORDER BY r.created_at DESC
  ) INTO v_result
  FROM approval_requests r;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_approval_requests_lotto_id ON approval_requests(lotto_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_votes_request_id ON approval_votes(request_id);
CREATE INDEX idx_approval_history_request_id ON approval_history(request_id);
CREATE INDEX idx_approval_history_user_id ON approval_history(user_id);