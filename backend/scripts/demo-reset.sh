#!/bin/bash

# ============================================
# SevaSync Demo Reset Script
# ============================================
#
# Resets production database to known demo state.
# WARNING: This will DELETE ALL DATA in the database!
#
# Usage: bash scripts/demo-reset.sh
#
# This script:
# 1. Warns user about data loss
# 2. Resets Prisma migrations (drops all tables)
# 3. Re-runs all migrations
# 4. Seeds demo data (disasters, volunteers, tasks)
#
# Time to complete: ~30-60 seconds
#

set -e

echo ""
echo "🚨 ============================================"
echo "   SEVASYNC DEMO RESET"
echo "============================================"
echo ""
echo "WARNING: This will DELETE ALL DATA in the database!"
echo "This action is IRREVERSIBLE."
echo ""
echo "Demo data that will be created:"
echo "  • 5 disasters (flood, earthquake, cyclone, etc.)"
echo "  • 50+ volunteers with skills and availability"
echo "  • 100+ relief tasks"
echo "  • Test accounts (coordinator, volunteer, admin)"
echo ""
echo "Test credentials after reset:"
echo "  Coordinator: coordinator@example.com / SecurePass@123"
echo "  Volunteer: volunteer@example.com / VolunteerPass@123"
echo "  Admin: admin@sevasync.local / AdminPass@123"
echo ""
echo "============================================"
echo ""

# Confirm before proceeding
read -p "Type 'yes' to continue: " -r CONFIRM
echo

if [[ ! $CONFIRM =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "❌ Cancelled. Database unchanged."
    exit 0
fi

echo "🔄 Resetting database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    echo ""
    echo "For local development:"
    echo "  export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/sevasync'"
    echo ""
    echo "For production (Render):"
    echo "  Ensure DATABASE_URL is set in Render dashboard"
    echo ""
    exit 1
fi

# Reset the database (drops all tables and re-runs migrations)
echo "1️⃣  Dropping all tables and re-running migrations..."
npx prisma migrate reset --skip-generate --force

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Migration reset failed"
    echo "Try manually:"
    echo "  npx prisma migrate reset --skip-generate"
    exit 1
fi

echo ""
echo "2️⃣  Seeding demo data..."
npm run prisma:seed

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Seeding failed"
    echo "Check error messages above"
    exit 1
fi

echo ""
echo "✅ ============================================"
echo "   DATABASE RESET COMPLETE"
echo "============================================"
echo ""
echo "✓ All tables recreated"
echo "✓ Demo data loaded"
echo "✓ Test accounts ready"
echo ""
echo "Next steps:"
echo "  1. Start the backend: npm run dev"
echo "  2. Open dashboard: http://localhost:5173"
echo "  3. Login with test credentials"
echo ""
echo "Test accounts:"
echo "  📋 Coordinator:"
echo "     Email: coordinator@example.com"
echo "     Password: SecurePass@123"
echo ""
echo "  👤 Volunteer:"
echo "     Email: volunteer@example.com"
echo "     Password: VolunteerPass@123"
echo ""
echo "  🔐 Admin:"
echo "     Email: admin@sevasync.local"
echo "     Password: AdminPass@123"
echo ""
echo "Demo scenarios available:"
echo "  • 5 active disasters"
echo "  • 50+ volunteers ready to assign"
echo "  • 100+ tasks waiting"
echo "  • Pre-configured assignments"
echo ""
echo "See docs/DEMO_DATA_REFERENCE.md for full details"
echo ""
