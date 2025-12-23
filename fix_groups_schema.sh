#!/bin/bash

# Add missing columns to the groups table
psql "postgresql://imarisha_postgres_gua6_user:YeQSmgRC6Wg4o4l2d0fCfCiF3jAiJmnt@dpg-d53ddtmmcj7s73e5knbg-a.oregon-postgres.render.com/imarisha_postgres_gua6" << 'EOF'

-- Add missing columns to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the fix
\d groups

-- Check if columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'groups' 
ORDER BY ordinal_position;

EOF

