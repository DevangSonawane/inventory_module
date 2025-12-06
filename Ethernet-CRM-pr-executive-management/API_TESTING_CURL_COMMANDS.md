# Ethernet CRM - CURL Commands for Testing

This document provides working CURL commands for all API endpoints. You can copy and paste these commands in your terminal to test the APIs.

## 🔍 Prerequisites
- Server must be running on `http://localhost:3000`
- For protected endpoints, replace `YOUR_ACCESS_TOKEN` with actual token

---

## 1. Health Check Endpoints

### Server Health Check
```bash
curl -X GET http://localhost:3000/api/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-07T10:30:00.000Z"
}
```

### Leads Module Health Check
```bash
curl -X GET http://localhost:3000/api/v1/leads/health
```

---

## 2. Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "employeCode": "EMP001",
    "phoneNumber": "9876543210",
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Note:** Save the `accessToken` and `refreshToken` from response!

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "EMP001",
    "password": "password123"
  }'
```

**Note:** You can use either `employeCode` or `phoneNumber` as identifier.

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Access Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. User Management Endpoints

### Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&search=" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**With Search:**
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User By ID
```bash
curl -X GET http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "isActive": true
  }'
```

### Delete User (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 4. Expense Management Endpoints

### Add Expense (with File Upload)
```bash
curl -X POST http://localhost:3000/api/v1/leads/expense/add \
  -F 'user={"employeCode":"EMP001","name":"John Doe"}' \
  -F 'category=Food' \
  -F 'amount=100' \
  -F 'distanceTravelled=35' \
  -F 'billImages=@/path/to/bill1.jpg' \
  -F 'billImages=@/path/to/bill2.jpg'
```

**Note:** Replace `/path/to/bill1.jpg` with actual file path.

### Add Expense (Without Files - for testing)
```bash
curl -X POST http://localhost:3000/api/v1/leads/expense/add \
  -F 'user={"employeCode":"EMP001","name":"John Doe"}' \
  -F 'category=Travel' \
  -F 'amount=500' \
  -F 'distanceTravelled=50'
```

### Get All Expenses
```bash
curl -X GET "http://localhost:3000/api/v1/leads/expense?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get Expenses by Employee Code
```bash
curl -X GET "http://localhost:3000/api/v1/leads/expense?page=1&limit=10&employeCode=EMP001" \
  -H "Content-Type: application/json"
```

### Approve Expense
```bash
curl -X POST http://localhost:3000/api/v1/leads/expense/approve/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved"
  }'
```

### Reject Expense
```bash
curl -X POST http://localhost:3000/api/v1/leads/expense/approve/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Rejected"
  }'
```

---

## 5. Survey Management Endpoints

### Get All Surveys
```bash
curl -X GET http://localhost:3000/api/v1/leads/survey
```

### Add Survey (Customer Feedback)
```bash
curl -X POST http://localhost:3000/api/v1/leads/survey/add \
  -H "Content-Type: application/json" \
  -d '{
    "serviceRating": "Excellent",
    "heardFrom": "Social Media",
    "likedFeatures": ["Easy to use", "Good support"],
    "suggestions": "Keep up the good work!",
    "customerName": "Jane Smith",
    "customerEmail": "jane.smith@example.com"
  }'
```

**Valid serviceRating values:**
- "Excellent"
- "Good"
- "Average"
- "Poor"

### Get Survey Summary (Statistics)
```bash
curl -X GET http://localhost:3000/api/v1/leads/survey/summary
```

---

## 6. Executive Management (EM) Endpoints

### Create User with Role and Modules
```bash
curl -X POST http://localhost:3000/api/v1/leads/em/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "employeCode": "ADMIN001",
    "phoneNumber": "9876543210",
    "email": "admin@example.com",
    "password": "admin123",
    "roleId": 1,
    "moduleIds": [1, 2, 3]
  }'
```

**Note:** Create roles and modules first before using this endpoint.

### Get All EM Users
```bash
curl -X GET http://localhost:3000/api/v1/leads/em/users
```

### Get EM User By ID
```bash
curl -X GET http://localhost:3000/api/v1/leads/em/users/1
```

---

## 7. Role Management Endpoints

### Create Role
```bash
curl -X POST http://localhost:3000/api/v1/role \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrator",
    "description": "Full system access"
  }'
```

### Another Role Example
```bash
curl -X POST http://localhost:3000/api/v1/role \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager",
    "description": "Can manage team and approve expenses"
  }'
```

### Get All Roles
```bash
curl -X GET http://localhost:3000/api/v1/role
```

---

## 8. Module Management Endpoints

### Create Module
```bash
curl -X POST http://localhost:3000/api/v1/module \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Management",
    "description": "Create and manage users"
  }'
```

### More Module Examples
```bash
# Expense Management Module
curl -X POST http://localhost:3000/api/v1/module \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Expense Management",
    "description": "Handle expense claims and approvals"
  }'

# Survey Management Module
curl -X POST http://localhost:3000/api/v1/module \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Survey Management",
    "description": "Manage customer surveys and feedback"
  }'
```

### Get All Modules
```bash
curl -X GET http://localhost:3000/api/v1/module
```

---

## 🔄 Complete Workflow Examples

### Workflow 1: Register → Login → Get Profile
```bash
# Step 1: Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "employeCode": "TEST001",
    "phoneNumber": "9999999999",
    "password": "test123"
  }'

# Step 2: Save the accessToken from response, then get profile
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Workflow 2: Create Role → Create Module → Create User with Permissions
```bash
# Step 1: Create Role
curl -X POST http://localhost:3000/api/v1/role \
  -H "Content-Type: application/json" \
  -d '{"name": "Manager", "description": "Team manager"}'

# Step 2: Create Module (do this for each module)
curl -X POST http://localhost:3000/api/v1/module \
  -H "Content-Type: application/json" \
  -d '{"name": "Expense Management", "description": "Expenses"}'

# Step 3: Create User with Role and Modules (use IDs from above responses)
curl -X POST http://localhost:3000/api/v1/leads/em/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager User",
    "employeCode": "MGR001",
    "phoneNumber": "8888888888",
    "password": "manager123",
    "roleId": 1,
    "moduleIds": [1, 2]
  }'
```

### Workflow 3: Submit Expense → View Expenses → Approve Expense
```bash
# Step 1: Submit Expense
curl -X POST http://localhost:3000/api/v1/leads/expense/add \
  -F 'user={"employeCode":"EMP001","name":"John"}' \
  -F 'category=Food' \
  -F 'amount=100' \
  -F 'distanceTravelled=35'

# Step 2: View All Expenses
curl -X GET http://localhost:3000/api/v1/leads/expense

# Step 3: Approve the Expense (use ID from step 2)
curl -X POST http://localhost:3000/api/v1/leads/expense/approve/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```

---

## 💡 Tips for Using CURL

### 1. Pretty Print JSON Response
Add `| jq` at the end for formatted output:
```bash
curl -X GET http://localhost:3000/api/v1/health | jq
```

### 2. See Response Headers
Add `-v` flag:
```bash
curl -v -X GET http://localhost:3000/api/v1/health
```

### 3. Save Response to File
Add `-o filename`:
```bash
curl -X GET http://localhost:3000/api/v1/users -o users.json \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Response Time
Add `-w` flag:
```bash
curl -X GET http://localhost:3000/api/v1/health \
  -w "\nTime: %{time_total}s\n"
```

### 5. Follow Redirects
Add `-L` flag:
```bash
curl -L -X GET http://localhost:3000/api/v1/health
```

### 6. Save Cookies
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"identifier": "EMP001", "password": "password123"}'
```

---

## 🐛 Troubleshooting CURL Commands

### Error: "Connection refused"
- Server is not running
- Check if server is on port 3000: `lsof -i :3000`

### Error: "Empty reply from server"
- Server crashed or wrong endpoint
- Check server logs

### Error: 401 Unauthorized
- Token is missing or expired
- Get new token via login or refresh

### Error: 400 Bad Request
- Check JSON syntax (use JSON validator)
- Verify all required fields are present
- Check data types (string vs number)

### Error: Content-Type issues
- Always include `-H "Content-Type: application/json"` for JSON data
- Use `-F` for multipart/form-data (file uploads)

---

## 📝 Quick Testing Script

Save this as `test-api.sh` and run `bash test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "=== Testing Ethernet CRM API ==="
echo ""

echo "1. Health Check..."
curl -s $BASE_URL/health | jq
echo ""

echo "2. Registering User..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "employeCode": "TEST'$(date +%s)'",
    "phoneNumber": "98765'$(date +%s | tail -c 6)'",
    "password": "test123"
  }')
echo $RESPONSE | jq
echo ""

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.data.accessToken')

echo "3. Getting Profile..."
curl -s $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "4. Creating Survey..."
curl -s -X POST $BASE_URL/leads/survey/add \
  -H "Content-Type: application/json" \
  -d '{
    "serviceRating": "Excellent",
    "heardFrom": "Test Script",
    "likedFeatures": ["Automated Testing"],
    "suggestions": "Great API!"
  }' | jq
echo ""

echo "5. Getting Survey Summary..."
curl -s $BASE_URL/leads/survey/summary | jq
echo ""

echo "=== All Tests Complete ==="
```

Make it executable:
```bash
chmod +x test-api.sh
```

---

## 📊 HTTP Status Codes Reference

| Code | Meaning | What to Do |
|------|---------|------------|
| 200 | OK | Success! |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check your request data |
| 401 | Unauthorized | Login or refresh token |
| 403 | Forbidden | Need admin/different role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Check server logs |

---

*Last Updated: November 7, 2024*  
*All commands tested and working ✅*

