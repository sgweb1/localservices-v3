#!/bin/bash

# Test Dev Simulator - sprawdzenie czy wszystkie endpointy działają
# Wymaga: zalogowany provider w bazie

echo "================================"
echo "🧪 TEST DEV SIMULATOR"
echo "================================"
echo ""

# Kolory
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000/api/v1"
PROVIDER_EMAIL="provider@example.com"  # Email z seedera

# 1. Logowanie i pobranie tokena (używamy quick-login z /dev)
echo -e "${BLUE}🔐 Logowanie przez /dev/quick-login...${NC}"
login_response=$(curl -s -X POST "http://localhost:8000/api/v1/dev/quick-login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"$PROVIDER_EMAIL\",\"role\":\"provider\"}")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Nie udało się zalogować!${NC}"
    echo "Response: $login_response"
    exit 1
fi

echo -e "${GREEN}✅ Zalogowano! Token: ${TOKEN:0:20}...${NC}"
echo ""

# Funkcja testująca endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Accept: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body" | head -3
        return 1
    fi
}

echo "📋 1. REZERWACJE (Bookings)"
echo "----------------------------"
test_endpoint "POST" "/dev/simulate-events" "Generuj 3 rezerwacje" '{"type":"bookings","count":3}'
test_endpoint "GET" "/provider/bookings" "Lista rezerwacji providera" ""
echo ""

echo "💬 2. WIADOMOŚCI (Messages)"
echo "----------------------------"
test_endpoint "GET" "/conversations" "Lista konwersacji" ""
# test_endpoint "POST" "/conversations" "Wyślij wiadomość" '{"participant_id":2,"message":"Test message"}'
echo ""

echo "⭐ 3. OPINIE (Reviews)"
echo "----------------------------"
test_endpoint "POST" "/dev/simulate-events" "Generuj opinie" '{"type":"reviews","count":2}'
test_endpoint "GET" "/provider/reviews" "Lista opinii providera" ""
echo ""

echo "📦 4. USŁUGI (Services)"
echo "----------------------------"
test_endpoint "GET" "/provider/services" "Lista usług providera" ""
echo ""

echo "🔔 5. NOTYFIKACJE (Notifications)"
echo "----------------------------"
test_endpoint "GET" "/notifications" "Lista notyfikacji" ""
test_endpoint "GET" "/notifications/unread-count" "Liczba nieprzeczytanych" ""
echo ""

echo "📅 6. KALENDARZ (Calendar)"
echo "----------------------------"
test_endpoint "GET" "/provider/calendar" "Dane kalendarza" ""
test_endpoint "POST" "/dev/calendar/generate-bookings" "Generuj rezerwacje w kalendarzu" '{"days":7,"slotsPerDay":4}'
echo ""

echo "💳 7. SUBSKRYPCJE (Subscriptions)"
echo "----------------------------"
test_endpoint "GET" "/provider/subscription" "Aktualna subskrypcja" ""
echo ""

echo ""
echo "================================"
echo "✅ TESTY ZAKOŃCZONE"
echo "================================"
echo ""
echo "Uwaga: Niektóre endpointy mogą wymagać autoryzacji (token Sanctum)"
echo "Uruchom testy z zalogowanym userem w przeglądarce lub dodaj token do requestów"
