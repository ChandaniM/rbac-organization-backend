#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🧪 Testing Request Deduplication..."
echo ""

# Check if server is running
if ! lsof -i :3000 &> /dev/null; then
    echo -e "${RED}❌ Server not running on port 3000${NC}"
    echo "Start with: npm run dev:all"
    exit 1
fi

echo -e "${YELLOW}Scenario: 10 users refresh dashboard simultaneously${NC}"
echo ""
echo "Without deduplication: 10 DB queries"
echo "With deduplication: 1 DB query, 10 responses share the result"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get auth token (you'll need to replace this with actual token)
echo "Note: You need a valid JWT token for this test"
echo "Get token by logging in first:"
echo "  curl -X POST http://localhost:3000/api/login -d '{\"email\":\"...\",\"password\":\"...\"}'"
echo ""
read -p "Enter your JWT token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}No token provided. Exiting.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Sending 10 concurrent requests to /api/dashboard...${NC}"
echo ""

# Create temporary directory for responses
TEMP_DIR=$(mktemp -d)

# Send 10 concurrent requests
for i in {1..10}; do
    (
        START=$(date +%s%3N)
        HTTP_CODE=$(curl -s -o "$TEMP_DIR/response_$i.json" -w "%{http_code}" \
            http://localhost:3000/api/dashboard \
            -H "Authorization: Bearer $TOKEN" 2>/dev/null)
        END=$(date +%s%3N)
        TIME=$((END - START))
        
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "Request $i: ${GREEN}✅ Success${NC} (${TIME}ms)"
        else
            echo -e "Request $i: ${RED}❌ Failed${NC} (HTTP $HTTP_CODE)"
        fi
    ) &
done

# Wait for all background jobs
wait

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check your server logs for:
echo -e "${YELLOW}Check your server console logs for:${NC}"
echo ""
echo "[Deduplication] New request: abc123..."
echo "[Deduplication] Request merged: abc123... (x9)"
echo "[Dashboard] Executing DB query for system admin metrics (only once!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify all responses are identical
echo -e "${BLUE}Verifying all 10 responses are identical...${NC}"
HASH1=$(md5 -q "$TEMP_DIR/response_1.json" 2>/dev/null || md5sum "$TEMP_DIR/response_1.json" | cut -d' ' -f1)

ALL_SAME=true
for i in {2..10}; do
    HASH=$(md5 -q "$TEMP_DIR/response_$i.json" 2>/dev/null || md5sum "$TEMP_DIR/response_$i.json" | cut -d' ' -f1)
    if [ "$HASH" != "$HASH1" ]; then
        ALL_SAME=false
        break
    fi
done

if $ALL_SAME; then
    echo -e "${GREEN}✅ All 10 responses are identical (shared result)${NC}"
else
    echo -e "${YELLOW}⚠️  Responses differ (might be expected if data changed)${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${BLUE}Check deduplication stats:${NC}"
echo "curl http://localhost:3000/api/monitoring/deduplication-stats \\"
echo "  -H \"Authorization: Bearer $TOKEN\""
echo ""
