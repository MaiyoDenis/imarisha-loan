#!/bin/bash

# Quick database schema check
psql "postgresql://imarisha_postgres_gua6_user:YeQSmgRC6Wg4o4l2d0fCfCiF3jAiJmnt@dpg-d53ddtmmcj7s73e5knbg-a.oregon-postgres.render.com/imarisha_postgres_gua6" << 'EOF'

-- Check current groups table schema
\d groups

-- Check all tables in the database
\dt

-- Check if migration was applied
SELECT * FROM alembic_version;

EOF

