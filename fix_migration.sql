-- IMMEDIATE PRODUCTION FIX
-- Run this SQL command directly in your PostgreSQL database

-- This fixes the broken migration history by updating the alembic_version table

UPDATE alembic_version 
SET version_num = 'b4c36442d5cd' 
WHERE version_num = 'd4e5f6g7h8i9';

-- If the record doesn't exist, insert it:
INSERT INTO alembic_version (version_num) 
VALUES ('b4c36442d5cd') 
ON CONFLICT DO NOTHING;

-- Verify the fix:
SELECT * FROM alembic_version;

