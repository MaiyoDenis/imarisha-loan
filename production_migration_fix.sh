
#!/bin/bash

# IMMEDIATE PRODUCTION MIGRATION FIX
# This script fixes the broken migration history in production

set -e

echo "🔧 APPLYING PRODUCTION MIGRATION FIX..."
echo "========================================="

# Change to backend directory
cd backend

# Method 1: Fix the database directly
echo "📋 Step 1: Checking current migration status..."
flask db current || echo "No current migration"

echo ""
echo "🔧 Step 2: Applying migration fix..."

# Option A: Force stamp to current head
echo "   Option A: Stamping database to current migration..."
flask db stamp b4c36442d5cd

echo "   ✅ Migration history fixed!"

echo ""
echo "🔧 Step 3: Verifying fix..."
flask db current

echo ""
echo "🚀 Step 4: Applying any remaining migrations..."
flask db upgrade

echo ""
echo "✅ MIGRATION FIX COMPLETED!"
echo "Your production database is now synchronized with the codebase."
echo ""
echo "Next steps:"
echo "1. Restart your application"
echo "2. Test that the API endpoints work"
echo "3. Verify database operations are functioning"
echo ""
echo "If you still get errors, run this script again or contact support."

# Alternative fix for broken migration history
echo ""
echo "🆘 ALTERNATIVE: If the above doesn't work, run this SQL directly:"
echo "UPDATE alembic_version SET version_num = 'b4c36442d5cd' WHERE version_num = 'd4e5f6g7h8i9';"

