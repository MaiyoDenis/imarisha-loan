#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Running database migrations..."
flask db upgrade d4e5f6g7h8i9

echo "Seeding database..."
python seed.py

echo "Starting gunicorn..."
python -m gunicorn -w 1 -b 0.0.0.0:$PORT --timeout 120 wsgi:app
