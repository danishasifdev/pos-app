CREATE TABLE IF NOT EXISTS account_activity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id TEXT NOT NULL,
  account_email TEXT NOT NULL,
  actor_id TEXT,
  actor_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'account_created',
      'signed_in',
      'account_disabled',
      'account_reactivated',
      'account_deleted',
      'receipt_created',
      'receipt_voided'
    )
  ),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS account_activity_created_at_idx
  ON account_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS account_activity_account_history_idx
  ON account_activity (account_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS account_activity_one_created_event_idx
  ON account_activity (account_id)
  WHERE event_type = 'account_created';

ALTER TABLE account_activity ENABLE ROW LEVEL SECURITY;

INSERT INTO account_activity (
  account_id, account_email, actor_id, actor_email, event_type, created_at, details
)
SELECT
  id, email, id, email, 'account_created', created_at, '{"migrated": true}'::jsonb
FROM users
WHERE role IN ('user', 'demo')
ON CONFLICT (account_id) WHERE event_type = 'account_created' DO NOTHING;

INSERT INTO account_activity (
  account_id, account_email, actor_id, actor_email, event_type, created_at, details
)
SELECT
  id, email, id, email, 'signed_in', last_login_at, '{"migrated": true}'::jsonb
FROM users
WHERE role IN ('admin', 'user')
  AND last_login_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM account_activity
    WHERE account_activity.account_id = users.id
      AND account_activity.event_type = 'signed_in'
      AND account_activity.details->>'migrated' = 'true'
  );

INSERT INTO account_activity (
  account_id, account_email, actor_id, actor_email, event_type, details, created_at
)
SELECT
  receipts.account_id,
  users.email,
  receipts.account_id,
  users.email,
  'receipt_created',
  jsonb_build_object(
    'receiptId', receipts.id,
    'receiptNumber', receipts.number,
    'total', receipts.total,
    'migrated', true
  ),
  receipts.created_at
FROM receipts
JOIN users ON users.id = receipts.account_id
WHERE NOT EXISTS (
    SELECT 1
    FROM account_activity
    WHERE account_activity.account_id = receipts.account_id
      AND account_activity.event_type = 'receipt_created'
      AND account_activity.details->>'receiptId' = receipts.id
  );

INSERT INTO account_activity (
  account_id, account_email, actor_id, actor_email, event_type, details, created_at
)
SELECT
  receipts.account_id,
  users.email,
  receipts.account_id,
  users.email,
  'receipt_voided',
  jsonb_build_object(
    'receiptId', receipts.id,
    'receiptNumber', receipts.number,
    'total', receipts.total,
    'migrated', true
  ),
  receipts.created_at
FROM receipts
JOIN users ON users.id = receipts.account_id
WHERE receipts.voided
  AND NOT EXISTS (
    SELECT 1
    FROM account_activity
    WHERE account_activity.account_id = receipts.account_id
      AND account_activity.event_type = 'receipt_voided'
      AND account_activity.details->>'receiptId' = receipts.id
  );
