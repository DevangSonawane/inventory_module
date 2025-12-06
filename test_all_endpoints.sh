#!/bin/bash

# API Testing Script for Inventory Management System
# This script tests all API endpoints

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""
TEST_RESULTS=()
PASSED=0
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test result
print_result() {
    local endpoint=$1
    local method=$2
    local status=$3
    local message=$4
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $method $endpoint - $message"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $method $endpoint - $message"
        ((FAILED++))
    fi
    TEST_RESULTS+=("$status|$method|$endpoint|$message")
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    local description=$5
    
    local url="$BASE_URL$endpoint"
    local headers=(-H "Content-Type: application/json")
    
    if [ -n "$TOKEN" ]; then
        headers+=(-H "Authorization: Bearer $TOKEN")
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" "$url")
    elif [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${headers[@]}" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${headers[@]}" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        print_result "$endpoint" "$method" "PASS" "$description"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 0
    else
        print_result "$endpoint" "$method" "FAIL" "Expected $expected_status, got $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

echo "=========================================="
echo "  Inventory Management API Test Suite"
echo "=========================================="
echo ""

# Step 1: Register/Login to get token
echo "🔐 Step 1: Authentication"
echo "---------------------------"

# Try to register a test user (might fail if exists, that's ok)
register_response=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"API Test User","employeCode":"APITEST001","email":"apitest@test.com","password":"test123456"}')

# Login to get token
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"APITEST001","password":"test123456"}')

TOKEN=$(echo "$login_response" | jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}✗${NC} Failed to get authentication token"
    echo "Login response: $login_response"
    exit 1
fi

echo -e "${GREEN}✓${NC} Authentication successful"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Health Check Endpoints
echo "🏥 Step 2: Health Check Endpoints"
echo "-----------------------------------"
test_endpoint "GET" "/health" "" 200 "Server health check"
test_endpoint "GET" "/inventory/health" "" 200 "Inventory module health check"
echo ""

# Step 3: Master Data - Stock Areas
echo "📦 Step 3: Stock Areas"
echo "----------------------"
test_endpoint "GET" "/inventory/stock-areas" "" 200 "Get all stock areas"

# Create a stock area
create_stock_area='{"areaName":"Test Warehouse","locationCode":"WH-TEST","address":"123 Test St"}'
stock_area_response=$(curl -s -X POST "$BASE_URL/inventory/stock-areas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$create_stock_area")
STOCK_AREA_ID=$(echo "$stock_area_response" | jq -r '.data.area_id // empty')

if [ -n "$STOCK_AREA_ID" ] && [ "$STOCK_AREA_ID" != "null" ]; then
    print_result "/inventory/stock-areas" "POST" "PASS" "Created stock area"
    ((PASSED++))
    test_endpoint "GET" "/inventory/stock-areas/$STOCK_AREA_ID" "" 200 "Get stock area by ID"
    test_endpoint "PUT" "/inventory/stock-areas/$STOCK_AREA_ID" '{"areaName":"Updated Warehouse"}' 200 "Update stock area"
else
    print_result "/inventory/stock-areas" "POST" "FAIL" "Failed to create stock area"
    ((FAILED++))
fi
echo ""

# Step 4: Master Data - Materials
echo "🔧 Step 4: Materials"
echo "-------------------"
test_endpoint "GET" "/inventory/materials" "" 200 "Get all materials"

# Create a material
create_material='{"materialName":"Test Fiber Cable","productCode":"FIBER-TEST-001","materialType":"COMPONENT","uom":"PIECE(S)"}'
material_response=$(curl -s -X POST "$BASE_URL/inventory/materials" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$create_material")
MATERIAL_ID=$(echo "$material_response" | jq -r '.data.material_id // empty')

if [ -n "$MATERIAL_ID" ] && [ "$MATERIAL_ID" != "null" ]; then
    print_result "/inventory/materials" "POST" "PASS" "Created material"
    ((PASSED++))
    test_endpoint "GET" "/inventory/materials/$MATERIAL_ID" "" 200 "Get material by ID"
    test_endpoint "PUT" "/inventory/materials/$MATERIAL_ID" '{"materialName":"Updated Fiber Cable"}' 200 "Update material"
else
    print_result "/inventory/materials" "POST" "FAIL" "Failed to create material"
    ((FAILED++))
fi
echo ""

# Step 5: Inward Entries
echo "📥 Step 5: Inward Entries"
echo "-------------------------"
test_endpoint "GET" "/inventory/inward" "" 200 "Get all inward entries"

if [ -n "$STOCK_AREA_ID" ] && [ -n "$MATERIAL_ID" ]; then
    create_inward="{\"invoiceNumber\":\"INV-TEST-001\",\"partyName\":\"Test Supplier\",\"stockAreaId\":\"$STOCK_AREA_ID\",\"items\":[{\"materialId\":\"$MATERIAL_ID\",\"quantity\":100}]}"
    inward_response=$(curl -s -X POST "$BASE_URL/inventory/inward" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$create_inward")
    INWARD_ID=$(echo "$inward_response" | jq -r '.data.inward_id // empty')
    
    if [ -n "$INWARD_ID" ] && [ "$INWARD_ID" != "null" ]; then
        print_result "/inventory/inward" "POST" "PASS" "Created inward entry"
        ((PASSED++))
        test_endpoint "GET" "/inventory/inward/$INWARD_ID" "" 200 "Get inward entry by ID"
    else
        print_result "/inventory/inward" "POST" "FAIL" "Failed to create inward entry"
        ((FAILED++))
    fi
fi
echo ""

# Step 6: Material Requests
echo "📋 Step 6: Material Requests"
echo "----------------------------"
test_endpoint "GET" "/inventory/material-request" "" 200 "Get all material requests"

if [ -n "$MATERIAL_ID" ]; then
    create_mr="{\"prNumbers\":[{\"prNumber\":\"PR-TEST-001\"}],\"items\":[{\"materialId\":\"$MATERIAL_ID\",\"requestedQuantity\":50}]}"
    mr_response=$(curl -s -X POST "$BASE_URL/inventory/material-request" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$create_mr")
    MR_ID=$(echo "$mr_response" | jq -r '.data.request_id // empty')
    
    if [ -n "$MR_ID" ] && [ "$MR_ID" != "null" ]; then
        print_result "/inventory/material-request" "POST" "PASS" "Created material request"
        ((PASSED++))
        test_endpoint "GET" "/inventory/material-request/$MR_ID" "" 200 "Get material request by ID"
    else
        print_result "/inventory/material-request" "POST" "FAIL" "Failed to create material request"
        ((FAILED++))
    fi
fi
echo ""

# Step 7: Stock Transfers
echo "🔄 Step 7: Stock Transfers"
echo "---------------------------"
test_endpoint "GET" "/inventory/stock-transfer" "" 200 "Get all stock transfers"

# Create another stock area for transfer
create_stock_area2='{"areaName":"Test Warehouse 2","locationCode":"WH-TEST-2","address":"456 Test Ave"}'
stock_area2_response=$(curl -s -X POST "$BASE_URL/inventory/stock-areas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$create_stock_area2")
STOCK_AREA_ID_2=$(echo "$stock_area2_response" | jq -r '.data.area_id // empty')

if [ -n "$STOCK_AREA_ID" ] && [ -n "$STOCK_AREA_ID_2" ] && [ -n "$MATERIAL_ID" ]; then
    create_transfer="{\"fromStockAreaId\":\"$STOCK_AREA_ID\",\"toStockAreaId\":\"$STOCK_AREA_ID_2\",\"items\":[{\"materialId\":\"$MATERIAL_ID\",\"quantity\":20}]}"
    transfer_response=$(curl -s -X POST "$BASE_URL/inventory/stock-transfer" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$create_transfer")
    TRANSFER_ID=$(echo "$transfer_response" | jq -r '.data.transfer_id // empty')
    
    if [ -n "$TRANSFER_ID" ] && [ "$TRANSFER_ID" != "null" ]; then
        print_result "/inventory/stock-transfer" "POST" "PASS" "Created stock transfer"
        ((PASSED++))
        test_endpoint "GET" "/inventory/stock-transfer/$TRANSFER_ID" "" 200 "Get stock transfer by ID"
    else
        print_result "/inventory/stock-transfer" "POST" "FAIL" "Failed to create stock transfer"
        ((FAILED++))
    fi
fi
echo ""

# Step 8: Consumption
echo "📉 Step 8: Consumption"
echo "---------------------"
test_endpoint "GET" "/inventory/consumption" "" 200 "Get all consumption records"

if [ -n "$MATERIAL_ID" ] && [ -n "$STOCK_AREA_ID" ]; then
    create_consumption="{\"externalSystemRefId\":\"EXT-REF-001\",\"stockAreaId\":\"$STOCK_AREA_ID\",\"items\":[{\"materialId\":\"$MATERIAL_ID\",\"quantity\":10}]}"
    consumption_response=$(curl -s -X POST "$BASE_URL/inventory/consumption" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$create_consumption")
    CONSUMPTION_ID=$(echo "$consumption_response" | jq -r '.data.consumption_id // empty')
    
    if [ -n "$CONSUMPTION_ID" ] && [ "$CONSUMPTION_ID" != "null" ]; then
        print_result "/inventory/consumption" "POST" "PASS" "Created consumption record"
        ((PASSED++))
        test_endpoint "GET" "/inventory/consumption/$CONSUMPTION_ID" "" 200 "Get consumption by ID"
    else
        print_result "/inventory/consumption" "POST" "FAIL" "Failed to create consumption"
        ((FAILED++))
    fi
fi
echo ""

# Step 9: Stock Levels
echo "📊 Step 9: Stock Levels"
echo "-----------------------"
test_endpoint "GET" "/inventory/stock-levels" "" 200 "Get all stock levels"
test_endpoint "GET" "/inventory/stock-summary" "" 200 "Get stock summary"

if [ -n "$MATERIAL_ID" ]; then
    test_endpoint "GET" "/inventory/stock-levels/$MATERIAL_ID" "" 200 "Get stock level by material"
fi
echo ""

# Step 10: Reports
echo "📈 Step 10: Reports"
echo "-------------------"
test_endpoint "GET" "/inventory/reports/transactions" "" 200 "Get transaction history"
test_endpoint "GET" "/inventory/reports/movement" "" 200 "Get stock movement report"
test_endpoint "GET" "/inventory/reports/consumption" "" 200 "Get consumption analysis"
test_endpoint "GET" "/inventory/reports/valuation" "" 200 "Get stock valuation"
echo ""

# Step 11: Audit & Notifications
echo "🔍 Step 11: Audit & Notifications"
echo "----------------------------------"
test_endpoint "GET" "/inventory/audit-logs" "" 200 "Get audit logs"
test_endpoint "GET" "/inventory/notifications" "" 200 "Get notifications"
echo ""

# Step 12: Search
echo "🔎 Step 12: Search"
echo "------------------"
test_endpoint "GET" "/inventory/search?q=test" "" 200 "Global search"
echo ""

# Step 13: Export
echo "📤 Step 13: Export"
echo "------------------"
test_endpoint "GET" "/inventory/export/materials" "" 200 "Export materials"
test_endpoint "GET" "/inventory/export/inward" "" 200 "Export inward entries"
test_endpoint "GET" "/inventory/export/stock-levels" "" 200 "Export stock levels"
echo ""

# Step 14: Validation
echo "✅ Step 14: Validation"
echo "----------------------"
if [ -n "$MATERIAL_ID" ]; then
    test_endpoint "POST" "/inventory/validate/product-code" '{"productCode":"FIBER-TEST-001"}' 200 "Validate product code"
fi
echo ""

# Step 15: Bulk Operations
echo "📦 Step 15: Bulk Operations"
echo "---------------------------"
if [ -n "$MATERIAL_ID" ]; then
    bulk_materials="{\"materials\":[{\"materialName\":\"Bulk Test Material\",\"productCode\":\"BULK-TEST-001\",\"materialType\":\"COMPONENT\",\"uom\":\"PIECE(S)\"}]}"
    test_endpoint "POST" "/inventory/bulk/materials" "$bulk_materials" 200 "Bulk create materials"
fi
echo ""

# Summary
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

