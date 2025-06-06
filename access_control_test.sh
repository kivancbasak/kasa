#!/bin/bash

# Quick test to verify admin-only access control
echo "🔒 Testing Admin-Only Access Control"
echo "===================================="

API_URL="http://localhost:3001"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_test() {
    echo -e "${YELLOW}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Register first user (admin)
print_test "Registering admin user..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123", "firstName": "Admin", "lastName": "User"}')

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Register second user (employee)
print_test "Registering employee user..."
EMPLOYEE_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "employee@test.com", "password": "employee123", "firstName": "Employee", "lastName": "User"}')

EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test admin access
print_test "Testing admin access to user management..."
ADMIN_ACCESS=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$ADMIN_ACCESS" | grep -q '"users"'; then
    print_success "Admin can access user management"
else
    print_error "Admin cannot access user management"
    echo "Response: $ADMIN_ACCESS"
fi

# Test employee access (should be denied)
print_test "Testing employee access to user management..."
EMPLOYEE_ACCESS=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")

echo "Employee access response: $EMPLOYEE_ACCESS"

if echo "$EMPLOYEE_ACCESS" | grep -q "Admin access required"; then
    print_success "Employee correctly denied access (Admin access required)"
elif echo "$EMPLOYEE_ACCESS" | grep -q -i "unauthorized\|forbidden\|access.*required"; then
    print_success "Employee correctly denied access"
else
    print_error "Employee was NOT denied access"
fi

# Update employee to manager
print_test "Updating employee to manager role..."
EMPLOYEE_ID=$(echo "$EMPLOYEE_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
ROLE_UPDATE=$(curl -s -X PUT "$API_URL/api/users/$EMPLOYEE_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "manager"}')

# Test manager access (should still be denied for admin-only endpoint)
print_test "Testing manager access to user management..."
MANAGER_ACCESS=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")

echo "Manager access response: $MANAGER_ACCESS"

if echo "$MANAGER_ACCESS" | grep -q "Admin access required"; then
    print_success "Manager correctly denied access to admin-only endpoint"
elif echo "$MANAGER_ACCESS" | grep -q -i "unauthorized\|forbidden\|access.*required"; then
    print_success "Manager correctly denied access"
else
    print_error "Manager was NOT denied access to admin-only endpoint"
fi

echo ""
echo "🏁 Access Control Test Complete"
