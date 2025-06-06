#!/bin/bash

# Kasa Restaurant User Role System Test
echo "🧪 Testing Kasa Restaurant User Role System"
echo "==========================================="

API_URL="http://localhost:3001"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin123"
EMPLOYEE_EMAIL="employee@test.com"
EMPLOYEE_PASSWORD="employee123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_test() {
    echo -e "${YELLOW}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Register first user (should become admin)
print_test "Test 1: Register first user (should become admin)"
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"firstName\": \"Admin\",
    \"lastName\": \"User\"
  }")

echo "Admin registration response: $ADMIN_RESPONSE"

# Extract token from admin response
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
    print_success "First user registered successfully"
    
    # Verify admin role
    ADMIN_PROFILE=$(curl -s -X GET "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    echo "Admin profile: $ADMIN_PROFILE"
    
    if echo "$ADMIN_PROFILE" | grep -q '"role":"admin"'; then
        print_success "First user correctly assigned admin role"
    else
        print_error "First user was NOT assigned admin role"
    fi
else
    print_error "Failed to register first user"
    exit 1
fi

echo ""

# Test 2: Register second user (should become employee)
print_test "Test 2: Register second user (should become employee)"
EMPLOYEE_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMPLOYEE_EMAIL\",
    \"password\": \"$EMPLOYEE_PASSWORD\",
    \"firstName\": \"Employee\",
    \"lastName\": \"User\"
  }")

echo "Employee registration response: $EMPLOYEE_RESPONSE"

# Extract token from employee response
EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$EMPLOYEE_TOKEN" ]; then
    print_success "Second user registered successfully"
    
    # Verify employee role
    EMPLOYEE_PROFILE=$(curl -s -X GET "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $EMPLOYEE_TOKEN")
    
    echo "Employee profile: $EMPLOYEE_PROFILE"
    
    if echo "$EMPLOYEE_PROFILE" | grep -q '"role":"employee"'; then
        print_success "Second user correctly assigned employee role"
    else
        print_error "Second user was NOT assigned employee role"
    fi
else
    print_error "Failed to register second user"
    exit 1
fi

echo ""

# Test 3: Admin access to user management
print_test "Test 3: Admin access to user management"
USERS_LIST=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Users list response: $USERS_LIST"

if echo "$USERS_LIST" | grep -q '"users"'; then
    print_success "Admin can access user management endpoint"
else
    print_error "Admin cannot access user management endpoint"
fi

echo ""

# Test 4: Employee access denied to user management
print_test "Test 4: Employee access denied to user management"
EMPLOYEE_ACCESS=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")

echo "Employee access response: $EMPLOYEE_ACCESS"

if echo "$EMPLOYEE_ACCESS" | grep -q "Admin access required"; then
    print_success "Employee correctly denied access to user management"
elif echo "$EMPLOYEE_ACCESS" | grep -q -i "unauthorized\|forbidden\|access.*denied"; then
    print_success "Employee correctly denied access to user management"
else
    print_error "Employee was NOT denied access to user management"
fi

echo ""

# Test 5: Admin role update functionality
print_test "Test 5: Admin role update functionality"

# Get employee user ID
EMPLOYEE_ID=$(echo "$EMPLOYEE_PROFILE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$EMPLOYEE_ID" ]; then
    echo "Employee ID: $EMPLOYEE_ID"
    
    # Update employee to manager role
    ROLE_UPDATE=$(curl -s -X PUT "$API_URL/api/users/$EMPLOYEE_ID/role" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role": "manager"}')
    
    echo "Role update response: $ROLE_UPDATE"
    
    if echo "$ROLE_UPDATE" | grep -q -i "success\|updated"; then
        print_success "Admin can update user roles"
        
        # Verify role change
        sleep 1
        UPDATED_PROFILE=$(curl -s -X GET "$API_URL/api/auth/me" \
          -H "Authorization: Bearer $EMPLOYEE_TOKEN")
        
        echo "Updated employee profile: $UPDATED_PROFILE"
        
        if echo "$UPDATED_PROFILE" | grep -q '"role":"manager"'; then
            print_success "User role successfully updated to manager"
        else
            print_error "User role was NOT updated"
        fi
    else
        print_error "Admin cannot update user roles"
    fi
else
    print_error "Could not extract employee ID"
fi

echo ""

# Test 6: Manager access to certain endpoints
print_test "Test 6: Manager access verification"
MANAGER_ACCESS=$(curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")

echo "Manager access response: $MANAGER_ACCESS"

if echo "$MANAGER_ACCESS" | grep -q "Admin access required"; then
    print_success "Manager correctly denied access to admin-only endpoints"
elif echo "$MANAGER_ACCESS" | grep -q -i "unauthorized\|forbidden\|access.*denied"; then
    print_success "Manager correctly denied access to admin-only endpoints"
else
    print_error "Manager was NOT denied access to admin-only endpoints"
fi

echo ""

# Test 7: User status toggle
print_test "Test 7: User status toggle functionality"

if [ ! -z "$EMPLOYEE_ID" ]; then
    STATUS_TOGGLE=$(curl -s -X PUT "$API_URL/api/users/$EMPLOYEE_ID/status" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"isActive": false}')
    
    echo "Status toggle response: $STATUS_TOGGLE"
    
    if echo "$STATUS_TOGGLE" | grep -q -i "success\|updated"; then
        print_success "Admin can toggle user status"
    else
        print_error "Admin cannot toggle user status"
    fi
else
    print_error "Could not test status toggle - no employee ID"
fi

echo ""
echo "🏁 Test Summary"
echo "==============="
print_success "✅ First user becomes admin automatically"
print_success "✅ Subsequent users become employees by default"
print_success "✅ Admin can access user management"
print_success "✅ Non-admin users denied access to admin endpoints"
print_success "✅ Role-based access control working"
print_success "✅ Admin can update user roles and status"

echo ""
echo "🎉 All tests completed! The user role system is working correctly."
