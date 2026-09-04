#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing System Design Features..."
echo ""

# Test 1: Check if Docker is installed
echo "1️⃣  Checking Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Test 2: Check if Redis is running
echo ""
echo "2️⃣  Checking Redis..."
if docker ps | grep -q rbac-redis; then
    echo -e "${GREEN}✅ Redis container is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not running. Starting now...${NC}"
    docker-compose up -d
    sleep 3
fi

# Test 3: Test Redis connection
echo ""
echo "3️⃣  Testing Redis connection..."
if docker exec rbac-redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo -e "${GREEN}✅ Redis is responding to commands${NC}"
else
    echo -e "${RED}❌ Redis is not responding${NC}"
    exit 1
fi

# Test 4: Check Redis data
echo ""
echo "4️⃣  Checking Redis data..."
KEY_COUNT=$(docker exec rbac-redis redis-cli DBSIZE 2>/dev/null | grep -o '[0-9]*')
echo -e "${GREEN}✅ Redis has $KEY_COUNT keys${NC}"

# Test 5: Check if server is running
echo ""
echo "5️⃣  Checking if API server is running..."
if lsof -i :3000 &> /dev/null; then
    echo -e "${GREEN}✅ API server is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  API server not running. Start with: npm run dev:all${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 System Status Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Docker:      ${GREEN}✅ Installed${NC}"
echo -e "Redis:       ${GREEN}✅ Running${NC}"
echo -e "Redis Keys:  ${GREEN}$KEY_COUNT${NC}"

if lsof -i :3000 &> /dev/null; then
    echo -e "API Server:  ${GREEN}✅ Running${NC}"
else
    echo -e "API Server:  ${YELLOW}⚠️  Not Running${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🎯 Next Steps:"
if ! lsof -i :3000 &> /dev/null; then
    echo "   1. Start your app: npm run dev:all"
fi
echo "   2. Test rate limiting: bash test-rate-limit.sh"
echo "   3. View Redis data: docker exec -it rbac-redis redis-cli KEYS \"*\""
echo ""
