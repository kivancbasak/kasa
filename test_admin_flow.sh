#!/bin/bash

echo "🔥 Testing Kasa Admin User Flow"
echo "================================"

# API Base URL
API_URL="http://localhost:3001/api"

echo ""
echo "📝 Step 1: Register first user (should become admin automatically)"
ADMIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User", 
    "email": "admin@kasa.com",
    "password": "admin123"
  }' \
  $API_URL/auth/register)

echo "Admin Registration Response:"
echo $ADMIN_RESPONSE | jq '.'

# Extract token
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')

echo ""
echo "🔍 Step 2: Verify admin user profile"
PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/auth/me)
echo "Admin Profile:"
echo $PROFILE_RESPONSE | jq '.'

echo ""
echo "👥 Step 3: Test admin access to user list"
USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/users)
echo "Users List Response:"
echo $USERS_RESPONSE | jq '.'

echo ""
echo "📝 Step 4: Register second user (should become employee automatically)"
EMPLOYEE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Employee",
    "email": "john@kasa.com", 
    "password": "employee123"
  }' \
  $API_URL/auth/register)

echo "Employee Registration Response:"
echo $EMPLOYEE_RESPONSE | jq '.'

# Extract employee token
EMPLOYEE_TOKEN=$(echo $EMPLOYEE_RESPONSE | jq -r '.token')

echo ""
echo "🚫 Step 5: Test employee access to user list (should be denied)"
EMPLOYEE_ACCESS_RESPONSE=$(curl -s -H "Authorization: Bearer $EMPLOYEE_TOKEN" $API_URL/users)
echo "Employee Access Response:"
echo $EMPLOYEE_ACCESS_RESPONSE | jq '.'

echo ""
echo "👥 Step 6: Admin views updated user list"
UPDATED_USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/users)
echo "Updated Users List:"
echo $UPDATED_USERS_RESPONSE | jq '.'

echo ""
echo "✅ Admin Flow Test Complete!"
