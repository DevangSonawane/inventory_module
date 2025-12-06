# 📚 Ethernet CRM - Complete API Documentation

Welcome to the Ethernet CRM API Documentation! This guide will help you understand and test all the APIs in this project.

## 📂 Documentation Files

This repository contains comprehensive API documentation in multiple formats:

### 1. 📮 **Postman Collection** (Recommended for Beginners)
**File**: `Ethernet-CRM-Postman-Collection.json`

✅ **Best for**: Interactive testing, learning APIs, frontend development  
✅ **Features**:
- 28 fully documented API endpoints
- Automatic token management
- Example requests and responses
- Detailed descriptions for each endpoint
- Pre-configured base URL and variables

**How to use**: Import into Postman and start testing immediately!

---

### 2. 📖 **Postman Guide for Interns**
**File**: `POSTMAN_GUIDE.md`

✅ **Best for**: Learning how to use the Postman collection  
✅ **Contains**:
- Step-by-step setup instructions
- How to import and configure collection
- Authentication flow explained
- Common workflows and use cases
- Troubleshooting guide
- Best practices

**Start here if**: You're new to APIs or Postman

---

### 3. 💻 **CURL Commands Reference**
**File**: `API_TESTING_CURL_COMMANDS.md`

✅ **Best for**: Command-line testing, automation, CI/CD  
✅ **Contains**:
- Ready-to-use CURL commands for all endpoints
- Complete workflow examples
- Bash script for automated testing
- Tips for using CURL effectively

**Start here if**: You prefer terminal/command-line tools

---

### 4. 📋 **API Endpoints Summary**
**File**: `API_ENDPOINTS_SUMMARY.md`

✅ **Best for**: Quick reference, API overview  
✅ **Contains**:
- All endpoints in table format
- Request/response formats
- Permission matrix
- Common use cases
- Error codes reference

**Start here if**: You need a quick lookup or overview

---

## 🚀 Quick Start (3 Steps)

### For Postman Users (Recommended)

1. **Import Collection**
   ```
   Open Postman → Import → Select "Ethernet-CRM-Postman-Collection.json"
   ```

2. **Start Server**
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Test API**
   ```
   Open "Health Check → Server Health Check" → Click "Send"
   ```

**Done!** ✅ Read `POSTMAN_GUIDE.md` for detailed instructions.

---

### For Terminal Users

1. **Start Server**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Test API**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Use CURL Commands**
   ```
   Open "API_TESTING_CURL_COMMANDS.md" and copy commands
   ```

**Done!** ✅

---

## 🎯 What Can You Do With These APIs?

### 👤 User Management
- Register new users
- Login and authentication
- View and update user profiles
- Manage user accounts (admin)

### 💰 Expense Tracking
- Submit expense claims with bill images
- View all expenses with pagination
- Approve or reject expenses
- Filter expenses by employee

### 📊 Survey System
- Collect customer feedback (no authentication required)
- View all survey responses
- Get aggregated statistics and analytics

### 🔐 Role-Based Access Control (RBAC)
- Create custom roles
- Define modules/features
- Assign roles and modules to users
- Manage permissions

### 🏥 Health Monitoring
- Check server status
- Monitor individual modules
- System health checks

---

## 📊 API Statistics

| Category | Count | Auth Required |
|----------|-------|---------------|
| Health Check | 2 | ❌ |
| Authentication | 5 | Mixed |
| User Management | 4 | ✅ |
| Expense Management | 3 | ⚠️ |
| Survey Management | 3 | ❌ |
| Executive Management | 3 | ⚠️ |
| Role Management | 2 | ⚠️ |
| Module Management | 2 | ⚠️ |
| **Total** | **28** | **Mixed** |

**Legend:**
- ✅ = Authentication Required
- ❌ = Public Endpoint
- ⚠️ = Should be implemented

---

## 🔑 Authentication Overview

### Token Types

```
┌─────────────────────────────────────────┐
│  Access Token                           │
│  • Valid for 15 minutes                 │
│  • Used for API requests                │
│  • Include in Authorization header      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Refresh Token                          │
│  • Valid for 7 days                     │
│  • Used to get new access token         │
│  • Store securely                       │
└─────────────────────────────────────────┘
```

### Authentication Flow

```
1. Register or Login
   ↓
2. Receive Tokens
   • accessToken
   • refreshToken
   ↓
3. Use Access Token for Requests
   Authorization: Bearer <accessToken>
   ↓
4. When Access Token Expires (15 min)
   ↓
5. Refresh Token
   POST /auth/refresh
   ↓
6. Receive New Tokens
   ↓
7. Continue Using APIs
```

---

## 🏗️ API Architecture

### Base URL
```
http://localhost:3000/api/v1
```

### Production URL (Example)
```
https://api.yourcompany.com/api/v1
```

### Endpoint Structure
```
/api/v1/{module}/{resource}/{action}

Examples:
/api/v1/auth/login
/api/v1/users/:id
/api/v1/leads/expense/add
/api/v1/leads/survey/summary
```

---

## 📝 Request & Response Format

### Standard Request (JSON)
```http
POST /api/v1/auth/login
Content-Type: application/json
Authorization: Bearer <token>

{
  "identifier": "EMP001",
  "password": "password123"
}
```

### File Upload Request
```http
POST /api/v1/leads/expense/add
Content-Type: multipart/form-data

user: {"employeCode":"EMP001","name":"John"}
category: Food
amount: 100
billImages: [file1.jpg, file2.jpg]
```

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🎓 Learning Path for Interns

### Week 1: Basics
- [ ] Import Postman collection
- [ ] Test health check endpoints
- [ ] Register and login
- [ ] Get user profile
- [ ] Understand tokens

**Goal**: Understand authentication flow

### Week 2: CRUD Operations
- [ ] List users (pagination)
- [ ] Get user by ID
- [ ] Update user
- [ ] Test error cases

**Goal**: Master basic CRUD operations

### Week 3: Business Logic
- [ ] Submit expenses with files
- [ ] View expenses with filters
- [ ] Approve/reject expenses
- [ ] Submit surveys
- [ ] View survey analytics

**Goal**: Understand business workflows

### Week 4: Advanced Features
- [ ] Create roles and modules
- [ ] Assign permissions to users
- [ ] Test role-based access
- [ ] Handle token refresh
- [ ] Error handling

**Goal**: Master advanced features

---

## 🔍 Testing Checklist

### Before Testing
- [ ] Server is running on port 3000
- [ ] Database connection is established
- [ ] You have Postman installed (or terminal access)
- [ ] You've imported the collection (if using Postman)

### For Each Endpoint
- [ ] Check if authentication is required
- [ ] Have valid access token (if needed)
- [ ] Understand required fields
- [ ] Know the expected response
- [ ] Test error cases

### After Testing
- [ ] Verify response format
- [ ] Check HTTP status code
- [ ] Validate response data
- [ ] Test error scenarios
- [ ] Document any issues

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection refused"
**Problem**: Can't connect to server  
**Solution**:
```bash
# Check if server is running
curl http://localhost:3000/api/v1/health

# Start server
cd server && npm start

# Check port is not in use
lsof -i :3000
```

### Issue 2: "401 Unauthorized"
**Problem**: Token missing or expired  
**Solution**:
```
1. Login again to get fresh token
2. Use refresh endpoint with refreshToken
3. Check Authorization header is included
4. Verify token format: "Bearer <token>"
```

### Issue 3: "400 Bad Request"
**Problem**: Invalid request data  
**Solution**:
```
1. Read error message (tells you what's wrong)
2. Check required fields in documentation
3. Validate data types and formats
4. Compare with example request
```

### Issue 4: "404 Not Found"
**Problem**: Endpoint or resource doesn't exist  
**Solution**:
```
1. Verify endpoint URL spelling
2. Check if resource ID exists
3. Ensure base URL is correct
4. Review endpoint in documentation
```

### Issue 5: Tokens not auto-saving (Postman)
**Problem**: Have to manually copy tokens  
**Solution**:
```
1. Check test scripts are enabled
2. Settings → General → Auto-persist variables
3. Manually set once in collection variables
4. Re-import collection
```

---

## 💡 Pro Tips

### For Efficient Testing
1. **Use Collection Variables** - Store tokens, user IDs, etc.
2. **Save Example Responses** - Helpful for frontend development
3. **Create Test Scripts** - Automate validation
4. **Use Environments** - Switch between dev/staging/prod
5. **Organize Requests** - Use folders and naming conventions

### For Development
1. **Read Error Messages** - They're very helpful!
2. **Test Happy Path First** - Then test error cases
3. **Use Postman Console** - Debug requests/responses
4. **Check Server Logs** - See what's happening backend
5. **Start Simple** - Master basics before advanced features

### For Debugging
1. **Isolate the Problem** - Test one thing at a time
2. **Compare with Working Example** - Use provided examples
3. **Check All Layers** - Network, request, response, server
4. **Use Tools** - Postman Console, Network tab, logs
5. **Ask for Help** - Provide complete error details

---

## 📚 Additional Resources

### Video Tutorials (Recommended)
- [Postman Beginner Course](https://www.youtube.com/watch?v=VywxIQ2ZXw4)
- [REST API Concepts](https://www.youtube.com/watch?v=7YcW25PHnAA)
- [JWT Authentication Explained](https://www.youtube.com/watch?v=7Q17ubqLfaM)

### Reading Material
- [HTTP Status Codes](https://httpstatuses.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [Postman Documentation](https://learning.postman.com/)

### Tools
- [JSON Formatter](https://jsonformatter.org/)
- [JWT Decoder](https://jwt.io/)
- [Postman](https://www.postman.com/)

---

## 🎯 Success Metrics

### You're Ready for Production When You Can:
- [ ] Import and use Postman collection independently
- [ ] Register, login, and manage tokens
- [ ] Test all CRUD operations successfully
- [ ] Handle errors appropriately
- [ ] Understand authentication flow
- [ ] Use pagination and filtering
- [ ] Work with file uploads
- [ ] Test role-based access
- [ ] Debug common issues
- [ ] Explain API workflows to others

---

## 📞 Getting Help

### Order of Resources
1. **Check Endpoint Description** - In Postman collection
2. **Read Error Message** - Server tells you what's wrong
3. **Search This Documentation** - Comprehensive coverage
4. **Check Server Logs** - See backend errors
5. **Ask Team Lead** - Provide details:
   - Endpoint URL
   - Request body
   - Error message
   - What you've tried

### When Asking for Help, Include:
1. What you're trying to do
2. What you've tried
3. Expected result
4. Actual result
5. Error messages (full text)
6. Screenshots (if applicable)

---

## 🔄 Keeping Documentation Updated

### When Adding New Endpoints
1. Update route files
2. Add to Postman collection
3. Update this documentation
4. Add CURL examples
5. Update endpoint count
6. Test thoroughly

### When Modifying Endpoints
1. Update Postman collection
2. Update all documentation files
3. Test existing workflows
4. Notify team of changes
5. Update version number

---

## 📊 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 7, 2024 | Initial comprehensive documentation |
| | | - 28 endpoints documented |
| | | - Postman collection created |
| | | - Complete guides added |
| | | - CURL commands included |

---

## 🎉 Conclusion

You now have access to:
- ✅ Complete Postman Collection with 28 endpoints
- ✅ Beginner-friendly guide for interns
- ✅ CURL commands for all endpoints
- ✅ Quick reference documentation
- ✅ Troubleshooting guides
- ✅ Best practices and tips

### Next Steps
1. Import Postman collection
2. Read the Postman Guide
3. Start with health check
4. Register and login
5. Explore other endpoints
6. Build your application!

### Remember
- 💪 Start with simple endpoints
- 📖 Read descriptions carefully
- 🐛 Errors are normal - learn from them
- ❓ Ask questions when stuck
- 🎯 Practice makes perfect

**Happy API Testing! 🚀**

---

## 📜 License & Support

### Project
Ethernet CRM - Internal CRM System

### Support Contact
- Technical Lead: [Your Team Lead]
- Documentation: This repository
- Issues: Report to your team lead

### Documentation Maintained By
Ethernet CRM Development Team

---

*Last Updated: November 7, 2024*  
*Documentation Version: 1.0*  
*Total Endpoints: 28*  
*Status: Production Ready* ✅

