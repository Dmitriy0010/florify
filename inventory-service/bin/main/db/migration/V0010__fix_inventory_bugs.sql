-- 1. Drop the unique constraint and/or index
-- The index might be tied to a constraint if it was created as UNIQUE
ALTER TABLE stock_transactions DROP CONSTRAINT IF EXISTS idx_st_source_doc;
ALTER TABLE stock_transactions DROP CONSTRAINT IF EXISTS stock_transactions_source_document_id_key;
DROP INDEX IF EXISTS idx_st_source_doc;

-- 2. Create it as a non-unique index
CREATE INDEX idx_st_source_doc ON stock_transactions(source_document_id);
