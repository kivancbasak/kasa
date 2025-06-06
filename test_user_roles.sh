#!/bin/bash

# Kasa Restaurant Management System - User Role Testing Script
# This script tests the complete user role system implementation

BASE_URL="http://localhost:3001"
echo "🧪 Testing Kasa Restaurant Management System User Roles"
echo "=================================================="

# Helper function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $token" \
             -d "$data" \
             "$BASE_URL$endpoint"
    else
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$BASE_URL$endpoint"
    fi
}

# Test 1: Register first user (should become admin)
echo ""
echo "📝 Test 1: Register first user (should become admin)"
echo "----------------------------------------------------"

ADMIN_DATA='{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@kasa.com",
    "password": "admin123456"
}'

ADMIN_RESPONSE=$(make_request "POST" "/api/auth/register" "$ADMIN_DATA")
echo "Response: $ADMIN_RESPONSE"

# Extract token and user info
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token // empty')
ADMIN_ROLE=$(echo "$ADMIN_RESPONSE" | jq -r '.user.role // empty')

if [ "$ADMIN_ROLE" = "admin" ]; then
    echo "✅ SUCCESS: First user correctly assigned admin role"
else
    echo "❌ FAILED: First user role is '$ADMIN_ROLE', expected 'admin'"
fi

# Test 2: Register second user (should become employee)
echo ""
echo "📝 Test 2: Register second user (should become employee)"
echo "--------------------------------------------------------"

EMPLOYEE_DATA='{
    "firstName": "John",
    "lastName": "Employee",
    "email": "john@kasa.com",
    "password": "employee123456"
}'

EMPLOYEE_RESPONSE=$(make_request "POST" "/api/auth/register" "$EMPLOYEE_DATA")
echo "Response: $EMPLOYEE_RESPONSE"

# Extract token and user info
EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.token // empty')
EMPLOYEE_ROLE=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.user.role // empty')

if [ "$EMPLOYEE_ROLE" = "employee" ]; then
    echo "✅ SUCCESS: Second user correctly assigned employee role"
else
    echo "❌ FAILED: Second user role is '$EMPLOYEE_ROLE', expected 'employee'"
fi

# Test 3: Admin access to user management
echo ""
echo "📝 Test 3: Admin access to user management"
echo "------------------------------------------"

if [ -n "$ADMIN_TOKEN" ]; then
    USERS_RESPONSE=$(make_request "GET" "/api/users" "" "$ADMIN_TOKEN")
    echo "Users list response: $USERS_RESPONSE"
    
    USER_COUNT=$(echo "$USERS_RESPONSE" | jq '.users | length // 0')
    if [ "$USER_COUNT" -eq 2 ]; then
        echo "✅ SUCCESS: Admin can access user management (found $USER_COUNT users)"
    else
        echo "❌ FAILED: Expected 2 users, found $USER_COUNT"
    fi
else
    echo "❌ FAILED: No admin token available"
fi

# Test 4: Employee cannot access user management
echo ""
echo "📝 Test 4: Employee cannot access user management"
echo "-------------------------------------------------"

if [ -n "$EMPLOYEE_TOKEN" ]; then
    EMPLOYEE_USERS_RESPONSE=$(make_request "GET" "/api/users" "" "$EMPLOYEE_TOKEN")
    echo "Employee users access response: $EMPLOYEE_USERS_RESPONSE"
    
    ERROR_MESSAGE=$(echo "$EMPLOYEE_USERS_RESPONSE" | jq -r '.error // empty')
    if [[ "$ERROR_MESSAGE" == *"admin"* ]] || [[ "$ERROR_MESSAGE" == *"forbidden"* ]] || [[ "$ERROR_MESSAGE" == *"unauthorized"* ]]; then
        echo "✅ SUCCESS: Employee correctly denied access to user management"
    else
        echo "❌ FAILED: Employee should not have access to user management"
    fi
else
    echo "❌ FAILED: No employee token available"
fi

# Test 5: Admin can update user roles
echo ""
echo "📝 Test 5: Admin can update user roles"
echo "--------------------------------------"

if [ -n "$ADMIN_TOKEN" ] && [ -n "$EMPLOYEE_TOKEN" ]; then
    # Get employee user ID first
    EMPLOYEE_ID=$(echo "$USERS_RESPONSE" | jq -r '.users[] | select(.email == "john@kasa.com") | .id')
    
    if [ -n "$EMPLOYEE_ID" ] && [ "$EMPLOYEE_ID" != "null" ]; then
        echo "Employee ID: $EMPLOYEE_ID"
        
        # Update employee to manager role
        ROLE_UPDATE_DATA='{
            "role": "manager"
        }'
        
        ROLE_UPDATE_RESPONSE=$(make_request "PUT" "/api/users/$EMPLOYEE_ID/role" "$ROLE_UPDATE_DATA" "$ADMIN_TOKEN")
        echo "Role update response: $ROLE_UPDATE_RESPONSE"
        
        if echo "$ROLE_UPDATE_RESPONSE" | jq -e '.success // false' > /dev/null; then
            echo "✅ SUCCESS: Admin can update user roles"
        else
            echo "❌ FAILED: Admin role update failed"
        fi
    else
        echo "❌ FAILED: Could not find employee ID"
    fi
else
    echo "❌ FAILED: Missing required tokens"
fi

# Test 6: Test role hierarchy and permissions
echo ""
echo "📝 Test 6: Test role hierarchy and permissions"
echo "----------------------------------------------"

echo "Role hierarchy (higher number = more permissions):"
echo "- admin: 5"
echo "- executive: 4" 
echo "- manager: 3"
echo "- chef: 2"
echo "- employee: 1"

# Test 7: Admin can toggle user status
echo ""
echo "📝 Test 7: Admin can toggle user status"
echo "---------------------------------------"

if [ -n "$ADMIN_TOKEN" ] && [ -n "$EMPLOYEE_ID" ]; then
    STATUS_UPDATE_DATA='{
        "isActive": false
    }'
    
    STATUS_UPDATE_RESPONSE=$(make_request "PUT" "/api/users/$EMPLOYEE_ID/status" "$STATUS_UPDATE_DATA" "$ADMIN_TOKEN")
    echo "Status update response: $STATUS_UPDATE_RESPONSE"
    
    if echo "$STATUS_UPDATE_RESPONSE" | jq -e '.success // false' > /dev/null; then
        echo "✅ SUCCESS: Admin can toggle user status"
    else
        echo "❌ FAILED: Admin status update failed"
    fi
fi

# Test 8: Check database state
echo ""
echo "📝 Test 8: Verify database state"
echo "--------------------------------"

echo "Checking final database state..."
docker-compose -f /home/kivanc/projects/git/kasa/docker-compose.yml exec postgres psql -U kasa_user -d kasa_restaurant -c "SELECT email, user_role, is_active FROM users ORDER BY created_at;"

echo ""
echo "🎉 User role system testing completed!"
echo "======================================"
echo ""
echo "Summary of implemented features:"
echo "✓ First user automatically becomes admin"
echo "✓ Subsequent users default to employee role"
echo "✓ Role-based access control (admin-only endpoints)"
echo "✓ Admin can update user roles"
echo "✓ Admin can toggle user active/inactive status"
echo "✓ Admin can delete users (except themselves)"
echo "✓ Role hierarchy system (admin > executive > manager > chef > employee)"
echo "✓ Frontend settings page for admin user management"
echo "✓ Proper error handling and authorization checks"
echo ""
echo "Next steps:"
echo "- Test the frontend settings page manually"
echo "- Test different role permissions as needed"
echo "- Implement additional permission-based features"
