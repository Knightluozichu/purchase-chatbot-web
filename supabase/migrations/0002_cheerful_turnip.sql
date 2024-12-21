/*
  # Create registration_errors table

  1. New Tables
    - `registration_errors`
      - `id` (uuid, primary key)
      - `message` (text)
      - `timestamp` (timestamp)
*/

CREATE TABLE IF NOT EXISTS registration_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE registration_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to insert"
  ON registration_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
