# Ethernet CRM - API Endpoints Summary

Quick reference guide for all available API endpoints.

## 📍 Base URL
```
http://localhost:3000/api/v1
```

---

## 🟢 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Check if server is running |
| GET | `/leads/health` | ❌ | Check leads module status |

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description | Returns |
|--------|----------|------|-------------|---------|
| POST | `/auth/register` | ❌ | Create new account | User + Tokens |
| POST | `/auth/login` | ❌ | Login with credentials | User + Tokens |
| GET | `/auth/profile` | ✅ | Get current user info | User Details |
| POST | `/auth/refresh` | ❌ | Refresh expired token | New Tokens |
| POST | `/auth/logout` | ✅ | Logout user | Success Message |

### Register/Login Request Body
```json
{
  "name": "John Doe",                    // Required
  "employeCode": "EMP001",               // Optional (but need one)
  "phoneNumber": "9876543210",           // Optional (but need one)
  "email": "john@example.com",           // Optional (but need one)
  "password": "password123"              // Required (min 6 chars)
}
```

**Note:** At least one of `employeCode`, `phoneNumber`, or `email` is required.

---

## 👥 User Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users` | ✅ | Admin | List all users (paginated) |
| GET | `/users/:id` | ✅ | Any | Get specific user details |
| PUT | `/users/:id` | ✅ | Any | Update user information |
| DELETE | `/users/:id` | ✅ | Admin | Delete user permanently |

### Get All Users Query Parameters
```
?page=1              // Page number (default: 1)
&limit=10            // Items per page (default: 10)
&search=john         // Search by name or email
```

### Update User Request Body
```json
{
  "name": "Updated Name",      // Optional
  "email": "new@example.com",  // Optional
  "role": "admin",             // Optional (user/admin)
  "isActive": true             // Optional (true/false)
}
```

---

## 💰 Expense Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/leads/expense/add` | ⚠️ | Submit new expense claim |
| GET | `/leads/expense` | ⚠️ | List expenses (paginated) |
| POST | `/leads/expense/approve/:id` | ⚠️ | Approve or reject expense |

### Add Expense (multipart/form-data)
```
user: {"employeCode":"EMP001","name":"John"}
category: Food | Travel | Accommodation
amount: 100 (number, > 0)
distanceTravelled: 35 (number, in km)
billImages: file1.jpg (max 2 files)
billImages: file2.jpg
```

### Food Expense Rules
- Distance < 30 km → **Rejected**
- Amount > Rs. 120 → **Rejected**
- After 9 PM + Distance < 30 km → **Rejected**

### Get Expenses Query Parameters
```
?page=1              // Page number
&limit=10            // Items per page
&employeCode=EMP001  // Filter by employee (optional)
```

### Approve/Reject Expense Request Body
```json
{
  "status": "Approved"  // or "Rejected"
}
```

---

## 📋 Survey Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/leads/survey` | ❌ | List all survey responses |
| POST | `/leads/survey/add` | ❌ | Submit new survey |
| GET | `/leads/survey/summary` | ❌ | Get survey statistics |

### Add Survey Request Body
```json
{
  "serviceRating": "Excellent",           // Required: Excellent|Good|Average|Poor
  "heardFrom": "Social Media",            // Optional
  "likedFeatures": ["Fast", "Easy"],      // Optional (array)
  "suggestions": "Great service!",        // Optional
  "customerName": "Jane Smith",           // Optional
  "customerEmail": "jane@example.com"     // Optional
}
```

### Survey Summary Response
```json
{
  "totalResponses": 150,
  "ratings": {
    "Excellent": 80,
    "Good": 50,
    "Average": 15,
    "Poor": 5
  },
  "heardFrom": {
    "Social Media": 60,
    "Friend": 40
  },
  "likedFeaturesCount": {
    "Easy to use": 90,
    "Fast": 75
  }
}
```

---

## 👔 Executive Management (EM)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/leads/em/users` | ⚠️ | Create user with role & modules |
| GET | `/leads/em/users` | ⚠️ | List all users with permissions |
| GET | `/leads/em/users/:id` | ⚠️ | Get user with role & modules |

### Create EM User Request Body
```json
{
  "name": "Admin User",                   // Required
  "employeCode": "ADMIN001",              // Optional (but need one)
  "phoneNumber": "9876543210",            // Optional (but need one)
  "email": "admin@example.com",           // Optional (but need one)
  "password": "admin123",                 // Required (min 6 chars)
  "roleId": 1,                            // Required (must exist)
  "moduleIds": [1, 2, 3]                  // Required (array, must exist)
}
```

### Response Structure
```json
{
  "id": 1,
  "name": "Admin User",
  "employeCode": "ADMIN001",
  "Role": {
    "id": 1,
    "name": "Administrator"
  },
  "Modules": [
    {"id": 1, "name": "User Management"},
    {"id": 2, "name": "Expense Management"}
  ]
}
```

---

## 🎭 Role Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/role` | ⚠️ | Create new role |
| GET | `/role` | ⚠️ | List all roles |

### Create Role Request Body
```json
{
  "name": "Manager",                              // Required (unique)
  "description": "Manages team and approvals"     // Optional
}
```

### Common Role Examples
```
1. Administrator - Full system access
2. Manager - Team & approval management
3. Employee - Basic user access
4. Viewer - Read-only access
5. Finance - Expense approval only
```

---

## 📦 Module Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/module` | ⚠️ | Create new module |
| GET | `/module` | ⚠️ | List all modules |

### Create Module Request Body
```json
{
  "name": "Expense Management",                    // Required (unique)
  "description": "Handle expense claims"           // Optional
}
```

### Common Module Examples
```
1. User Management - Create/edit users
2. Expense Management - Handle expenses
3. Survey Management - Manage surveys
4. Reports - View reports
5. Settings - System configuration
6. Dashboard - View analytics
```

---

## 🔑 Authentication Guide

### Token Types

| Token Type | Validity | Use Case |
|------------|----------|----------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 7 days | Get new access token |

### How to Use Tokens

#### 1. Get Tokens
```bash
POST /auth/login
# Response includes accessToken and refreshToken
```

#### 2. Use Access Token
```bash
# Add to Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. When Access Token Expires
```bash
POST /auth/refresh
# Send refreshToken in body
# Get new accessToken and refreshToken
```

#### 4. Logout
```bash
POST /auth/logout
# Invalidates refresh token
```

---

## 🎯 Common Use Cases

### 1. User Registration Flow
```
1. POST /auth/register
   → Returns: user + tokens
   
2. GET /auth/profile
   → Returns: user details
```

### 2. Expense Submission Flow
```
1. POST /auth/login
   → Get tokens

2. POST /leads/expense/add
   → Submit expense with bills

3. GET /leads/expense
   → View submitted expenses

4. POST /leads/expense/approve/:id
   → Manager approves/rejects
```

### 3. Survey Collection Flow
```
1. POST /leads/survey/add
   → Customer submits feedback (no auth)

2. GET /leads/survey
   → View all responses

3. GET /leads/survey/summary
   → View statistics
```

### 4. Role-Based User Creation Flow
```
1. POST /role
   → Create role (e.g., "Manager")

2. POST /module
   → Create modules (e.g., "Expenses")

3. POST /leads/em/users
   → Create user with role & modules

4. GET /leads/em/users/:id
   → View user with permissions
```

---

## 📊 Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Actual data here
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🚨 Error Codes & Solutions

| Code | Error | Solution |
|------|-------|----------|
| 400 | Bad Request | Check request body format and required fields |
| 401 | Unauthorized | Login or refresh token |
| 403 | Forbidden | Need admin role or different permissions |
| 404 | Not Found | Resource doesn't exist or wrong ID |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Server Error | Check server logs, contact support |

---

## 🔒 Permission Matrix

| Endpoint | Guest | User | Admin |
|----------|-------|------|-------|
| Health checks | ✅ | ✅ | ✅ |
| Register/Login | ✅ | ✅ | ✅ |
| Get Profile | ❌ | ✅ | ✅ |
| View Users | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |
| Add Survey | ✅ | ✅ | ✅ |
| Add Expense | ❌ | ✅ | ✅ |
| Approve Expense | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Allowed
- ❌ = Not Allowed
- ⚠️ = Should be implemented

---

## 📱 Status Codes Reference

### Success Codes
- **200 OK** - Request successful
- **201 Created** - Resource created successfully

### Client Error Codes
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists

### Server Error Codes
- **500 Internal Server Error** - Server error

---

## 💡 Best Practices

### 1. Always Include Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### 2. Use HTTPS in Production
```
https://api.yourdomain.com/api/v1
```

### 3. Handle Token Expiry
```javascript
if (response.status === 401) {
  // Refresh token
  // Retry request
}
```

### 4. Validate Before Sending
- Check required fields
- Validate data types
- Test with Postman first

### 5. Log Errors for Debugging
- Save request/response
- Note timestamp and endpoint
- Include error messages

---

## 🎓 Quick Tips for Interns

### Testing Checklist
- [ ] Server is running
- [ ] Database is connected
- [ ] Valid token (for protected endpoints)
- [ ] Correct HTTP method
- [ ] Correct Content-Type header
- [ ] Valid request body format
- [ ] All required fields included

### Debugging Steps
1. Check endpoint URL (spelling, parameters)
2. Verify HTTP method (GET/POST/PUT/DELETE)
3. Check authentication (token present and valid)
4. Validate request body (JSON format, required fields)
5. Read error message (tells you what's wrong)
6. Check server logs
7. Test in Postman first

### Common Mistakes
❌ Forgot to include Authorization header  
❌ Used wrong HTTP method  
❌ Missing required fields  
❌ Invalid JSON format  
❌ Token expired  
❌ Wrong endpoint URL  
❌ Not reading error messages  

---

## 📞 Need Help?

1. **Check Postman Collection** - Detailed descriptions for each endpoint
2. **Read Error Messages** - They tell you exactly what's wrong
3. **Test with CURL** - See `API_TESTING_CURL_COMMANDS.md`
4. **Review Guide** - See `POSTMAN_GUIDE.md` for detailed instructions
5. **Ask Team Lead** - Provide endpoint, error, and what you tried

---

## 🔗 Related Documentation

- **Postman Collection**: `Ethernet-CRM-Postman-Collection.json`
- **Complete Guide**: `POSTMAN_GUIDE.md`
- **CURL Commands**: `API_TESTING_CURL_COMMANDS.md`
- **Main README**: `README.md`

---

*Last Updated: November 7, 2024*  
*Total Endpoints: 28*  
*API Version: v1*

