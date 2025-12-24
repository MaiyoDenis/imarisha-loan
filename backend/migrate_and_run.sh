#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Running database migrations..."
# Only run upgrade, do not stamp as it skips migrations on fresh DB
flask db upgrade

echo "Seeding database with fresh data..."
python seed.py

echo "Starting gunicorn..."
python -m gunicorn -w 1 -b 0.0.0.0:$PORT --timeout 120 wsgi:app
