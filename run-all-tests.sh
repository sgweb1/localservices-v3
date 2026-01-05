#!/bin/bash

##############################################################################
# LocalServices MVP - Complete Test Suite Runner
# Run all automated tests before deployment
##############################################################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
UNIT_TESTS_PASSED=false
E2E_TESTS_PASSED=false
SMOKE_TESTS_PASSED=false

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     LocalServices MVP - Complete Test Suite Runner         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# 1. Unit & Integration Tests (npm test)
##############################################################################
echo -e "${BLUE}[1/3] Running Unit & Integration Tests (Vitest)...${NC}"
echo "----------------------------------------------------------------"

if npm test -- --run; then
    UNIT_TESTS_PASSED=true
    echo -e "${GREEN}✅ Unit & Integration Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Unit & Integration Tests: FAILED${NC}"
    echo -e "${YELLOW}⚠️  Fix unit tests before proceeding to deployment!${NC}"
fi

echo ""
echo ""

##############################################################################
# 2. E2E Tests (Playwright) - Optional
##############################################################################
echo -e "${BLUE}[2/3] Running E2E Tests (Playwright)...${NC}"
echo "----------------------------------------------------------------"

# Check if playwright tests exist
if [ -f "playwright.config.ts" ]; then
    echo -e "${YELLOW}ℹ️  E2E tests require a running backend (https://ls.test)${NC}"
    read -p "Do you want to run E2E tests? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if npm run test:e2e; then
            E2E_TESTS_PASSED=true
            echo -e "${GREEN}✅ E2E Tests: PASSED${NC}"
        else
            echo -e "${RED}❌ E2E Tests: FAILED${NC}"
            echo -e "${YELLOW}⚠️  E2E failures won't block deployment (backend might not be running)${NC}"
        fi
    else
        echo -e "${YELLOW}⏭️  E2E Tests: SKIPPED${NC}"
        E2E_TESTS_PASSED="skipped"
    fi
else
    echo -e "${YELLOW}⏭️  E2E Tests: NOT CONFIGURED${NC}"
    E2E_TESTS_PASSED="skipped"
fi

echo ""
echo ""

##############################################################################
# 3. Smoke Tests (Local or Production)
##############################################################################
echo -e "${BLUE}[3/3] Running Smoke Tests...${NC}"
echo "----------------------------------------------------------------"

# Check if backend is running locally
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local backend detected at http://localhost:8000${NC}"
    TARGET_URL="http://localhost:8000"
elif curl -s https://ls.test/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Development backend detected at https://ls.test${NC}"
    TARGET_URL="https://ls.test"
else
    echo -e "${YELLOW}⚠️  No backend detected (localhost:8000 or ls.test)${NC}"
    read -p "Enter backend URL for smoke tests (or press Enter to skip): " TARGET_URL
    
    if [ -z "$TARGET_URL" ]; then
        echo -e "${YELLOW}⏭️  Smoke Tests: SKIPPED (no backend)${NC}"
        SMOKE_TESTS_PASSED="skipped"
    fi
fi

# Run smoke tests if we have a target
if [ -n "$TARGET_URL" ] && [ "$SMOKE_TESTS_PASSED" != "skipped" ]; then
    if bash tests/smoke/smoke-test.sh "$TARGET_URL"; then
        SMOKE_TESTS_PASSED=true
        echo -e "${GREEN}✅ Smoke Tests: PASSED${NC}"
    else
        echo -e "${RED}❌ Smoke Tests: FAILED${NC}"
        echo -e "${YELLOW}⚠️  Review smoke test output above${NC}"
    fi
fi

echo ""
echo ""

##############################################################################
# Final Summary
##############################################################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Results Summary                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Unit tests
if [ "$UNIT_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ Unit & Integration Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Unit & Integration Tests: FAILED${NC}"
fi

# E2E tests
if [ "$E2E_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ E2E Tests: PASSED${NC}"
elif [ "$E2E_TESTS_PASSED" = "skipped" ]; then
    echo -e "${YELLOW}⏭️  E2E Tests: SKIPPED${NC}"
else
    echo -e "${RED}❌ E2E Tests: FAILED${NC}"
fi

# Smoke tests
if [ "$SMOKE_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ Smoke Tests: PASSED${NC}"
elif [ "$SMOKE_TESTS_PASSED" = "skipped" ]; then
    echo -e "${YELLOW}⏭️  Smoke Tests: SKIPPED${NC}"
else
    echo -e "${RED}❌ Smoke Tests: FAILED${NC}"
fi

echo ""
echo "----------------------------------------------------------------"

# Deployment decision
if [ "$UNIT_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}🚀 READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review manual testing checklist: docs/MANUAL_TESTING_CHECKLIST.md"
    echo "  2. Review deployment checklist: docs/DEPLOYMENT_CHECKLIST.md"
    echo "  3. Deploy using: ./deploy.sh (VPS) or push to Railway.app"
    echo "  4. Run smoke tests against production after deployment"
    exit 0
else
    echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Fix failing unit tests before deploying."
    echo "Run individual test suites:"
    echo "  - npm test               (unit & integration)"
    echo "  - npm run test:e2e       (e2e with Playwright)"
    exit 1
fi
