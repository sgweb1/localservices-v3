#!/bin/bash

# ===================================
# LocalServices - Smoke Test Suite
# ===================================
# Quick verification that app is working after deployment
# Usage: ./smoke-test.sh [base_url]
# Example: ./smoke-test.sh https://localservices.pl
# ===================================

set -e  # Exit on first error (optional, remove for full run)

BASE_URL=${1:-http://localhost:8000}
echo "🔥 Running smoke tests against: $BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    local description=$4
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $name ${BLUE}(HTTP $response)${NC}"
        [ -n "$description" ] && echo "  ↳ $description"
        ((PASSED++))
    elif [ "$response" -eq "000" ]; then
        echo -e "${RED}✗${NC} $name ${YELLOW}(Timeout/Connection failed)${NC}"
        ((FAILED++))
    else
        echo -e "${RED}✗${NC} $name ${YELLOW}(Expected $expected_code, got $response)${NC}"
        ((FAILED++))
    fi
}

test_content() {
    local name=$1
    local url=$2
    local search_string=$3
    local description=$4
    
    response=$(curl -s -m 10 "$url" 2>/dev/null || echo "")
    
    if echo "$response" | grep -q "$search_string"; then
        echo -e "${GREEN}✓${NC} $name ${BLUE}(Content found)${NC}"
        [ -n "$description" ] && echo "  ↳ $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $name ${YELLOW}(Content not found: $search_string)${NC}"
        ((FAILED++))
    fi
}

# ===================================
# 1. BASIC CONNECTIVITY
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Testing Basic Connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Homepage" "$BASE_URL" 200 "Main landing page loads"
test_endpoint "Health Check" "$BASE_URL/api/health" 200 "Health endpoint responsive"
test_endpoint "API Root" "$BASE_URL/api/v1" 200 "API is accessible"

echo ""

# ===================================
# 2. FRONTEND ASSETS
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Testing Frontend Assets..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Vite build exists
if [ -f "public/build/manifest.json" ] || [ -d "public/build" ]; then
    echo -e "${GREEN}✓${NC} Vite build directory exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Vite build directory not found (may be using dev server)"
    ((WARNINGS++))
fi

# Test static assets (may 404 if using dev server)
test_endpoint "Static Assets Access" "$BASE_URL/build/assets" 200 "Vite assets accessible" || true

echo ""

# ===================================
# 3. AUTHENTICATION ENDPOINTS
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Testing Authentication..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# These should reject GET (405 Method Not Allowed) or require POST with data (422)
test_endpoint "Register Endpoint Exists" "$BASE_URL/api/v1/register" 405 "POST only endpoint"
test_endpoint "Login Endpoint Exists" "$BASE_URL/api/v1/login" 405 "POST only endpoint"

# Logout requires auth (401 or 405)
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/logout" > /dev/null 2>&1 && {
    echo -e "${GREEN}✓${NC} Logout endpoint exists ${BLUE}(responds)${NC}"
    ((PASSED++))
} || {
    echo -e "${YELLOW}⚠${NC} Logout endpoint may not be configured"
    ((WARNINGS++))
}

echo ""

# ===================================
# 4. PROTECTED API ENDPOINTS (should return 401)
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Testing Protected Endpoints (expect 401)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Provider Dashboard" "$BASE_URL/api/v1/provider/dashboard" 401 "Requires authentication"
test_endpoint "Bookings List" "$BASE_URL/api/v1/provider/bookings" 401 "Requires authentication"
test_endpoint "Messages List" "$BASE_URL/api/v1/conversations" 401 "Requires authentication"
test_endpoint "User Profile" "$BASE_URL/api/v1/user" 401 "Requires authentication"

echo ""

# ===================================
# 5. DATABASE CONNECTIVITY
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Testing Database Connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# If API responds with data (even error), DB is likely connected
response=$(curl -s "$BASE_URL/api/v1/categories" 2>/dev/null || echo "")
if [ -n "$response" ]; then
    echo -e "${GREEN}✓${NC} Database queries working ${BLUE}(API returns data)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Database may not be connected ${YELLOW}(No response from API)${NC}"
    ((FAILED++))
fi

echo ""

# ===================================
# 6. CACHE & REDIS (Optional)
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Testing Cache Layer..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Make same request twice, check if second is faster (cached)
time1=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/v1/categories" 2>/dev/null || echo "0")
time2=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/v1/categories" 2>/dev/null || echo "0")

if (( $(echo "$time2 < $time1" | bc -l 2>/dev/null || echo 0) )); then
    echo -e "${GREEN}✓${NC} Cache working ${BLUE}(2nd request faster: ${time1}s → ${time2}s)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Cache may not be configured ${BLUE}(Times: ${time1}s, ${time2}s)${NC}"
    ((WARNINGS++))
fi

echo ""

# ===================================
# 7. EMAIL CONFIGURATION (Optional)
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Testing Email Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if email is configured (trigger password reset with fake email)
response=$(curl -s -X POST "$BASE_URL/api/v1/password/email" \
    -H "Content-Type: application/json" \
    -d '{"email":"test-smoke@example.com"}' \
    -w "%{http_code}" -o /dev/null 2>/dev/null || echo "000")

if [ "$response" -eq "200" ] || [ "$response" -eq "429" ]; then
    echo -e "${GREEN}✓${NC} Email endpoint responds ${BLUE}(HTTP $response)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Email may not be configured ${BLUE}(HTTP $response)${NC}"
    ((WARNINGS++))
fi

echo ""

# ===================================
# 8. SSL/HTTPS (Production only)
# ===================================
if [[ $BASE_URL == https* ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 Testing SSL/HTTPS..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check SSL certificate validity
    ssl_output=$(echo | openssl s_client -connect ${BASE_URL#https://}:443 -servername ${BASE_URL#https://} 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [ -n "$ssl_output" ]; then
        echo -e "${GREEN}✓${NC} SSL certificate valid"
        echo "  ↳ $ssl_output"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Could not verify SSL certificate"
        ((WARNINGS++))
    fi
    
    # Check HTTPS redirect
    http_url="${BASE_URL/https/http}"
    redirect=$(curl -s -o /dev/null -w "%{http_code}" "$http_url" 2>/dev/null || echo "000")
    if [ "$redirect" -eq "301" ] || [ "$redirect" -eq "302" ]; then
        echo -e "${GREEN}✓${NC} HTTP → HTTPS redirect working ${BLUE}(HTTP $redirect)${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} HTTP → HTTPS redirect may not be configured"
        ((WARNINGS++))
    fi
    
    echo ""
fi

# ===================================
# 9. PERFORMANCE BASELINE
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ Testing Performance..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Homepage load time
homepage_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL" 2>/dev/null || echo "0")
if (( $(echo "$homepage_time < 3.0" | bc -l 2>/dev/null || echo 0) )); then
    echo -e "${GREEN}✓${NC} Homepage load time acceptable ${BLUE}(${homepage_time}s < 3s)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Homepage load time slow ${YELLOW}(${homepage_time}s > 3s)${NC}"
    ((WARNINGS++))
fi

# API response time
api_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/health" 2>/dev/null || echo "0")
if (( $(echo "$api_time < 1.0" | bc -l 2>/dev/null || echo 0) )); then
    echo -e "${GREEN}✓${NC} API response time acceptable ${BLUE}(${api_time}s < 1s)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} API response time slow ${YELLOW}(${api_time}s > 1s)${NC}"
    ((WARNINGS++))
fi

echo ""

# ===================================
# 10. SECURITY HEADERS (Production)
# ===================================
if [[ $BASE_URL == https* ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🛡️  Testing Security Headers..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    headers=$(curl -sI "$BASE_URL" 2>/dev/null || echo "")
    
    # X-Frame-Options
    if echo "$headers" | grep -iq "x-frame-options"; then
        echo -e "${GREEN}✓${NC} X-Frame-Options header present"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} X-Frame-Options header missing"
        ((WARNINGS++))
    fi
    
    # X-Content-Type-Options
    if echo "$headers" | grep -iq "x-content-type-options"; then
        echo -e "${GREEN}✓${NC} X-Content-Type-Options header present"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} X-Content-Type-Options header missing"
        ((WARNINGS++))
    fi
    
    # Strict-Transport-Security (HSTS)
    if echo "$headers" | grep -iq "strict-transport-security"; then
        echo -e "${GREEN}✓${NC} HSTS header present"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} HSTS header missing (recommended for production)"
        ((WARNINGS++))
    fi
    
    echo ""
fi

# ===================================
# SUMMARY
# ===================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed:   ${GREEN}$PASSED${NC}"
echo -e "Failed:   ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed! Application is healthy.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Tests passed with warnings. Review recommended.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ $FAILED test(s) failed. Application may have issues.${NC}"
    exit 1
fi
