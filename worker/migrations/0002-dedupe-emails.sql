DELETE FROM emails
WHERE message_id IS NOT NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM emails
    WHERE message_id IS NOT NULL
    GROUP BY message_id, to_email
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_message_recipient
ON emails(message_id, to_email)
WHERE message_id IS NOT NULL;
