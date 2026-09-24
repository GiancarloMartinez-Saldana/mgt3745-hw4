-- schema.sql
-- One table, because the HW3 feature stores one kind of thing: a subscription
-- the user typed in (F-05), with the monthly price the dashboard totals (F-01).
-- A second table is ADR-003 territory.
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service TEXT NOT NULL,
  -- Backstop for the Worker's price rule: the database refuses a non-positive
  -- price even if a future endpoint forgets to check.
  price REAL NOT NULL CHECK (price > 0),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
