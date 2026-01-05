#!/bin/bash

##############################################################################
# LocalServices MVP - Quick Sanity Check
# Fast validation of critical endpoints (< 30 seconds)
##############################################################################

set -e

# Check if URL provided
if [ -z "$1" ]; then
    echo "Usage: ./quick-sanity-check.sh <base-url>"
    echo "Example: ./quick-sanity-check.sh https://ls.test"
    echo "Example: ./quick-sanity-check.sh http://localhost:8000"
    exit 1
fi

BASE_URL="$1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        LocalServices MVP - Quick Sanity Check               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Target: ${YELLOW}${BASE_URL}${NC}"
echo ""

PASSED=0
FAILED=0

##############################################################################
# Helper function to test endpoint
##############################################################################
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local description="$4"
    
    printf "%-50s" "Testing: $name..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $HTTP_CODE)"
        ((FAILED++))
    fi
}

##############################################################################
# Critical Endpoint Tests
##############################################################################

echo -e "${BLUE}[1] Frontend & Static Assets${NC}"
echo "----------------------------------------------------------------"
test_endpoint "Homepage" "${BASE_URL}/" "200" "React app loads"
test_endpoint "Vite manifest" "${BASE_URL}/build/manifest.json" "200" "Build assets exist"
echo ""

echo -e "${BLUE}[2] API Health & Auth${NC}"
echo "----------------------------------------------------------------"
test_endpoint "Health check" "${BASE_URL}/api/health" "200" "Backend is alive"
test_endpoint "API v1 base" "${BASE_URL}/api/v1" "200" "API routes mounted"
test_endpoint "Register (no auth)" "${BASE_URL}/api/v1/register" "405" "POST only"
test_endpoint "Login (no auth)" "${BASE_URL}/api/v1/login" "405" "POST only"
echo ""

echo -e "${BLUE}[3] Protected Routes (Should 401)${NC}"
echo "----------------------------------------------------------------"
test_endpoint "Provider dashboard" "${BASE_URL}/api/v1/provider/dashboard" "401" "Auth required"
test_endpoint "Provider bookings" "${BASE_URL}/api/v1/provider/bookings" "401" "Auth required"
test_endpoint "Provider messages" "${BASE_URL}/api/v1/provider/messages" "401" "Auth required"
test_endpoint "Provider calendar" "${BASE_URL}/api/v1/provider/availability" "401" "Auth required"
echo ""

echo -e "${BLUE}[4] Database Connectivity${NC}"
echo "----------------------------------------------------------------"
# Health endpoint typically checks DB connection
test_endpoint "DB health check" "${BASE_URL}/api/health" "200" "Database connected"
echo ""

##############################################################################
# Summary
##############################################################################
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      Sanity Check Results                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL SANITY CHECKS PASSED!${NC}"
    echo ""
    echo "Basic functionality verified. Application is healthy."
    echo ""
    echo "Next steps:"
    echo "  - Run full smoke tests: ./tests/smoke/smoke-test.sh $BASE_URL"
    echo "  - Run manual testing: docs/MANUAL_TESTING_CHECKLIST.md"
    exit 0
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED!${NC}"
    echo ""
    echo "Review failed endpoints above. Common issues:"
    echo "  - Backend not running (500/000)"
    echo "  - Database not connected (500 on /api/health)"
    echo "  - Frontend build missing (404 on /build/*)"
    echo "  - Wrong route configuration"
    echo ""
    exit 1
fi
