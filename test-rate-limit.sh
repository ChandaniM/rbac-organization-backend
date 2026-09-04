#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Testing Rate Limiting..."
echo ""

# Check if server is running
if ! lsof -i :3000 &> /dev/null; then
    echo -e "${RED}❌ Server not running on port 3000${NC}"
    echo "Start with: npm run dev:all"
    exit 1
fi

echo "Sending 7 login requests (limit is 5 per 15 min)..."
echo ""

for i in {1..7}; do
    echo -n "Request $i: "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST http://localhost:3000/api/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}' 2>/dev/null)
    
    if [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Allowed (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" == "429" ]; then
        echo -e "${RED}❌ Rate Limited (HTTP 429)${NC}"
    else
        echo -e "${YELLOW}⚠️  Unexpected response (HTTP $HTTP_CODE)${NC}"
    fi
    
    sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Expected: First 5 allowed, last 2 blocked"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Check Redis keys:"
echo "docker exec -it rbac-redis redis-cli KEYS \"ratelimit:*\""
echo ""
