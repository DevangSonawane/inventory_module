# Ethernet CRM - Postman Collection Guide for Interns

## 📋 Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Import Collection](#import-collection)
- [Configure Environment](#configure-environment)
- [Using the Collection](#using-the-collection)
- [API Endpoints Summary](#api-endpoints-summary)
- [Authentication Flow](#authentication-flow)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This Postman collection contains **all API endpoints** for the Ethernet CRM system. It's designed to be beginner-friendly with detailed descriptions, examples, and automatic token management.

### What's Included
- ✅ 28 API endpoints across 8 modules
- ✅ Detailed descriptions for each endpoint
- ✅ Example requests and responses
- ✅ Automatic token management
- ✅ Validation rules and error cases
- ✅ Use case examples

---

## 🚀 Getting Started

### Prerequisites
1. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)
2. **Server running** - Make sure your backend server is running on `http://localhost:3000`
3. **Database connected** - Ensure database connection is established

### Check if Server is Running
Open your browser or Postman and visit:
```
http://localhost:3000/api/v1/health
```
You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-07T10:30:00.000Z"
}
```

---

## 📥 Import Collection

### Step 1: Open Postman
Launch Postman application on your computer.

### Step 2: Import the Collection
1. Click **"Import"** button (top left)
2. Click **"Upload Files"**
3. Select `Ethernet-CRM-Postman-Collection.json` from the project folder
4. Click **"Import"**

### Step 3: Verify Import
You should see a new collection called **"Ethernet CRM API Collection"** in your Collections tab with 8 folders.

---

## ⚙️ Configure Environment

### Collection Variables
The collection uses three variables that are automatically managed:

| Variable | Description | Auto-Managed |
|----------|-------------|--------------|
| `baseUrl` | API base URL | ✅ Pre-configured |
| `accessToken` | JWT access token | ✅ Auto-saved on login |
| `refreshToken` | JWT refresh token | ✅ Auto-saved on login |

### View/Edit Variables
1. Click on the collection name
2. Go to **"Variables"** tab
3. You can see and edit the `baseUrl` if needed (default: `http://localhost:3000/api/v1`)

---

## 📖 Using the Collection

### Your First API Call

#### 1. Test Server Health
- Open: **Health Check → Server Health Check**
- Click **"Send"**
- ✅ You should get a 200 OK response

#### 2. Register a New User
- Open: **Authentication → Register New User**
- Review the example body
- Modify the data (change email, phone, etc.)
- Click **"Send"**
- ✅ Tokens are automatically saved!

#### 3. Get Your Profile
- Open: **Authentication → Get User Profile**
- Click **"Send"**
- ✅ You'll see your user information

**That's it!** You're now ready to use all endpoints.

---

## 🔐 Authentication Flow

### Understanding Authentication

#### Public Endpoints (No Token Required)
- ✅ Health checks
- ✅ Register
- ✅ Login
- ✅ Refresh token
- ✅ Add survey

#### Protected Endpoints (Token Required)
- 🔒 All other endpoints

### How Tokens Work

```
┌─────────────┐
│   Register  │ ──────┐
│   or Login  │       │
└─────────────┘       │
                      ▼
              ┌───────────────┐
              │  Get Tokens   │
              │ • accessToken │  (valid 15 min)
              │ • refreshToken│  (valid 7 days)
              └───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Make API     │
              │  Requests     │
              └───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Token Expired?│
              └───────────────┘
                   │        │
                   Yes      No
                   │        │
                   ▼        └─> Continue
            ┌──────────┐
            │ Refresh  │
            │ Token    │
            └──────────┘
```

### Automatic Token Management

The collection includes test scripts that automatically:
1. ✅ Extract tokens from login/register responses
2. ✅ Save them to collection variables
3. ✅ Include them in subsequent requests
4. ✅ Update them after refresh

**You don't need to manually copy-paste tokens!**

---

## 📚 API Endpoints Summary

### 1. Health Check (2 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Check server status | ❌ |
| `/leads/health` | GET | Check leads module | ❌ |

### 2. Authentication (5 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/register` | POST | Create new account | ❌ |
| `/auth/login` | POST | Login to account | ❌ |
| `/auth/profile` | GET | Get user profile | ✅ |
| `/auth/refresh` | POST | Refresh tokens | ❌ |
| `/auth/logout` | POST | Logout user | ✅ |

### 3. User Management (4 endpoints)
| Endpoint | Method | Description | Auth | Role |
|----------|--------|-------------|------|------|
| `/users` | GET | List all users | ✅ | Admin |
| `/users/:id` | GET | Get user by ID | ✅ | Any |
| `/users/:id` | PUT | Update user | ✅ | Any |
| `/users/:id` | DELETE | Delete user | ✅ | Admin |

### 4. Expense Management (3 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/leads/expense/add` | POST | Submit expense | ⚠️ |
| `/leads/expense` | GET | List expenses | ⚠️ |
| `/leads/expense/approve/:id` | POST | Approve/reject | ⚠️ |

### 5. Survey Management (3 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/leads/survey` | GET | List all surveys | ❌ |
| `/leads/survey/add` | POST | Submit survey | ❌ |
| `/leads/survey/summary` | GET | Get statistics | ❌ |

### 6. Executive Management (3 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/leads/em/users` | POST | Create user with roles | ⚠️ |
| `/leads/em/users` | GET | List users with roles | ⚠️ |
| `/leads/em/users/:id` | GET | Get user with roles | ⚠️ |

### 7. Role Management (2 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/role` | POST | Create role | ⚠️ |
| `/role` | GET | List all roles | ⚠️ |

### 8. Module Management (2 endpoints)
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/module` | POST | Create module | ⚠️ |
| `/module` | GET | List all modules | ⚠️ |

**Legend:**
- ✅ = Authentication Required
- ❌ = No Authentication
- ⚠️ = Should require auth (to be implemented)

---

## 🔄 Common Workflows

### Workflow 1: Complete User Registration & Profile

```
1. Register New User
   POST /auth/register
   ↓
2. Verify Profile
   GET /auth/profile
   ↓
3. Update Profile (if needed)
   PUT /users/:id
```

### Workflow 2: Expense Submission & Approval

```
1. Create User
   POST /auth/register
   ↓
2. Submit Expense with Bills
   POST /leads/expense/add
   (Include: category, amount, distance, billImages)
   ↓
3. View All Expenses
   GET /leads/expense?page=1&limit=10
   ↓
4. Approve/Reject Expense
   POST /leads/expense/approve/:id
   (Body: {"status": "Approved"})
```

### Workflow 3: Survey Collection & Analytics

```
1. Submit Survey (Customer)
   POST /leads/survey/add
   (No auth required)
   ↓
2. View All Surveys
   GET /leads/survey
   ↓
3. Get Statistics
   GET /leads/survey/summary
   (Shows ratings, features, sources)
```

### Workflow 4: User Management with RBAC

```
1. Create Role
   POST /role
   (Body: {"name": "Manager", "description": "..."})
   ↓
2. Create Modules
   POST /module
   (Body: {"name": "Expense Management", "description": "..."})
   ↓
3. Create User with Role & Modules
   POST /leads/em/users
   (Body: {..., "roleId": 1, "moduleIds": [1,2,3]})
   ↓
4. View User with Permissions
   GET /leads/em/users/:id
```

### Workflow 5: Token Refresh

```
1. Login
   POST /auth/login
   ↓
2. Use accessToken for requests
   (Works for 15 minutes)
   ↓
3. When Token Expires (401 Error)
   POST /auth/refresh
   (Body: {"refreshToken": "..."})
   ↓
4. Continue with New Token
```

---

## 🐛 Troubleshooting

### Problem: "Could not get response" / Connection Error

**Solution:**
1. Check if server is running: `http://localhost:3000/api/v1/health`
2. Verify `baseUrl` in collection variables
3. Check if you're using the correct port (default: 3000)

### Problem: 401 Unauthorized Error

**Solution:**
1. Check if endpoint requires authentication
2. Verify you're logged in (have valid token)
3. Check `accessToken` in collection variables
4. Try refreshing token: **Authentication → Refresh Access Token**
5. If refresh fails, login again

### Problem: 403 Forbidden Error

**Solution:**
- You don't have permission (need admin role)
- Check endpoint permissions in description
- Login with admin account

### Problem: 404 Not Found Error

**Solution:**
1. Check the URL path is correct
2. Verify the resource (user, expense, etc.) exists
3. Check ID parameter is valid

### Problem: 400 Bad Request / Validation Error

**Solution:**
1. Read the error message - it tells you what's wrong
2. Check required fields in endpoint description
3. Verify data format (email format, phone number length, etc.)
4. Look at example request body

### Problem: 409 Conflict Error

**Solution:**
- Resource already exists (e.g., user with same email)
- Use different values or update existing resource

### Problem: Tokens Not Auto-Saving

**Solution:**
1. Check if test scripts are enabled (Settings → General → Automatically persist variable values)
2. Manually copy token from response and paste in collection variables
3. Re-import the collection

---

## ✅ Best Practices

### For Testing APIs

1. **Always Start with Health Check**
   - Verify server is running before testing other endpoints

2. **Test in Order**
   - Register/Login first
   - Then test protected endpoints

3. **Use Valid Data**
   - Follow validation rules in descriptions
   - Use realistic test data

4. **Check Response Status**
   - 200/201 = Success
   - 400 = Your request is wrong
   - 401 = Need to login
   - 403 = No permission
   - 404 = Not found
   - 500 = Server error

5. **Read Error Messages**
   - Error responses contain helpful information
   - They tell you exactly what's wrong

### For Development

1. **Save Example Responses**
   - Click "Save Response" to save examples
   - Useful for frontend development

2. **Use Folders for Organization**
   - Collection is already organized by feature
   - Add your own test cases in folders

3. **Create Environments**
   - Create separate environments for:
     - Local (http://localhost:3000)
     - Development (https://dev.example.com)
     - Production (https://api.example.com)

4. **Use Variables**
   - Store user IDs, expense IDs in variables
   - Reuse them across requests

5. **Write Tests**
   - Add test scripts to validate responses
   - Example: Check if status is 200

### For Collaboration

1. **Export & Share**
   - Export collection and share with team
   - Keep it updated with new endpoints

2. **Document Changes**
   - Add notes when you modify requests
   - Update descriptions if behavior changes

3. **Use Comments**
   - Comment on requests for team members
   - Ask questions or provide feedback

---

## 📝 Quick Reference Card

### Essential Endpoints for Daily Use

```
┌─────────────────────────────────────────────────────────┐
│  START HERE (No Auth Needed)                           │
├─────────────────────────────────────────────────────────┤
│  ✓ POST /auth/register     - Create account            │
│  ✓ POST /auth/login        - Login                     │
│  ✓ GET  /health            - Check server              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  AFTER LOGIN (Need Token)                              │
├─────────────────────────────────────────────────────────┤
│  ✓ GET  /auth/profile      - My profile                │
│  ✓ GET  /users             - All users (admin)         │
│  ✓ POST /leads/expense/add - Submit expense            │
│  ✓ GET  /leads/expense     - View expenses             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TOKEN MANAGEMENT                                       │
├─────────────────────────────────────────────────────────┤
│  ✓ POST /auth/refresh      - Get new tokens            │
│  ✓ POST /auth/logout       - Logout                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ADMIN TASKS                                            │
├─────────────────────────────────────────────────────────┤
│  ✓ POST /role              - Create role               │
│  ✓ POST /module            - Create module             │
│  ✓ POST /leads/em/users    - User with permissions     │
│  ✓ POST /leads/expense/approve/:id - Approve expense   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PUBLIC (Customer Facing)                              │
├─────────────────────────────────────────────────────────┤
│  ✓ POST /leads/survey/add  - Submit feedback           │
│  ✓ GET  /leads/survey/summary - View statistics        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Learning Resources

### Understanding REST APIs
- **GET**: Retrieve data (like SELECT in SQL)
- **POST**: Create new data (like INSERT)
- **PUT**: Update existing data (like UPDATE)
- **DELETE**: Remove data (like DELETE)

### Understanding Status Codes
- **2xx**: Success (200 OK, 201 Created)
- **4xx**: Client error (400 Bad Request, 401 Unauthorized, 404 Not Found)
- **5xx**: Server error (500 Internal Server Error)

### Understanding Headers
- **Content-Type**: What type of data you're sending
  - `application/json` - JSON data
  - `multipart/form-data` - File uploads
- **Authorization**: Your access token
  - `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📞 Support

### Need Help?

1. **Check the Endpoint Description**
   - Each request has detailed documentation
   - Includes examples and error cases

2. **Review This Guide**
   - Most common issues are covered in troubleshooting

3. **Check Console Logs**
   - Postman console shows detailed request/response info
   - View → Show Postman Console

4. **Ask Your Team Lead**
   - Provide the endpoint URL
   - Share the error message
   - Show what you've tried

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Test all API endpoints
- ✅ Understand authentication
- ✅ Debug issues
- ✅ Develop frontend integrations
- ✅ Learn API best practices

**Happy Testing! 🚀**

---

*Last Updated: November 7, 2024*  
*Version: 1.0*  
*Maintained by: Ethernet CRM Team*

