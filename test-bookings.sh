#!/bin/bash

# Test E2E dla booking API

BASE_URL="http://127.0.0.1:8000/api/v1"

echo "🧪 Provider Bookings API Test"
echo "=============================="

# Get token via quick-login
echo "1️⃣ Login as provider..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/dev/quick-login" \
  -H "Content-Type: application/json" \
  -d '{"role": "provider"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Test 1: Get bookings page 1
echo ""
echo "2️⃣ Get bookings (page 1, per_page=15)..."
RESPONSE=$(curl -s "$BASE_URL/provider/bookings?page=1&per_page=15" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
COUNT=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | wc -l)

echo "Total bookings: $TOTAL"
echo "Bookings on page 1: $COUNT"

# Get first booking ID
BOOKING_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$BOOKING_ID" ]; then
  echo "❌ No bookings found"
  exit 1
fi

echo "First booking ID: $BOOKING_ID"

# Test 2: Get single booking
echo ""
echo "3️⃣ Get booking details (ID: $BOOKING_ID)..."
BOOKING=$(curl -s "$BASE_URL/provider/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

STATUS=$(echo "$BOOKING" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
CUSTOMER=$(echo "$BOOKING" | grep -o '"customerName":"[^"]*"' | cut -d'"' -f4)

echo "Status: $STATUS"
echo "Customer: $CUSTOMER"

# Test 3: Hide a completed booking
echo ""
echo "4️⃣ Find and hide a completed booking..."

COMPLETED=$(curl -s "$BASE_URL/provider/bookings?page=1&per_page=50&status=completed" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

HIDE_ID=$(echo "$COMPLETED" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$HIDE_ID" ]; then
  echo "⚠️  No completed bookings found to hide"
else
  echo "Hiding booking ID: $HIDE_ID"
  
  HIDE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/provider/bookings/$HIDE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json")
  
  MESSAGE=$(echo "$HIDE_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
  echo "Response: $MESSAGE"
  
  # Test 4: Verify hidden booking is gone
  echo ""
  echo "5️⃣ Verify booking is hidden (should not appear)..."
  
  CHECK=$(curl -s "$BASE_URL/provider/bookings?page=1&per_page=100" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json")
  
  # Count how many times booking ID appears
  STILL_VISIBLE=$(echo "$CHECK" | grep -o "\"id\":$HIDE_ID" | wc -l)
  
  if [ "$STILL_VISIBLE" -eq 0 ]; then
    echo "✅ Booking $HIDE_ID successfully hidden!"
  else
    echo "❌ Booking $HIDE_ID still visible (found $STILL_VISIBLE times)!"
    echo "Available bookings:"
    echo "$CHECK" | grep -o '"id":[0-9]*' | sort -u | head -10
  fi
fi

echo ""
echo "✅ All tests completed!"
