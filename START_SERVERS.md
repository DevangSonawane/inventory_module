# 🚀 How to Start Frontend and Backend

## Quick Start (Two Terminal Windows)

### Terminal 1 - Backend Server
```bash
cd Ethernet-CRM-pr-executive-management/server
npm start
```

### Terminal 2 - Frontend
```bash
cd inventory_module
npm run dev
```

---

## Detailed Instructions

### Prerequisites
1. **Node.js** installed (v14 or higher)
2. **MySQL** database running
3. **.env file** configured in the server directory

### Step 1: Start Backend Server

1. Open Terminal/Command Prompt
2. Navigate to server directory:
   ```bash
   cd Ethernet-CRM-pr-executive-management/server
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Make sure you have a `.env` file with database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   DB_PORT=3306
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174
   ```
5. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

**Expected Output:**
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server is running on http://0.0.0.0:3000
🌐 Accessible API endpoints:
   • Localhost: http://localhost:3000/api/v1
```

### Step 2: Start Frontend

1. Open a **NEW** Terminal/Command Prompt window
2. Navigate to frontend directory:
   ```bash
   cd inventory_module
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

**Expected Output:**
```
  VITE v5.4.21  ready in 473 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Verify Everything is Working

### 1. Check Backend
Open browser and go to:
- http://localhost:3000/api/v1/health
- Should return: `{"success":true,"message":"Server is running",...}`

### 2. Check Frontend
Open browser and go to:
- http://localhost:5173 (or http://localhost:5174 if 5173 is in use)
- Should see the inventory module interface

### 3. Check Connection
Open browser console (F12) and look for:
- `✅ Backend connection successful!` message

---

## Using npm scripts (Alternative)

### Option 1: Manual (Recommended)
Run each server in separate terminals as shown above.

### Option 2: Using concurrently (if installed)
You can install `concurrently` to run both in one terminal:
```bash
# From root directory
npm install -g concurrently

# Then run:
concurrently "cd Ethernet-CRM-pr-executive-management/server && npm start" "cd inventory_module && npm run dev"
```

---

## Troubleshooting

### Backend won't start
- ✅ Check if MySQL is running
- ✅ Verify `.env` file exists and has correct credentials
- ✅ Check if port 3000 is already in use
- ✅ Run `npm install` in server directory

### Frontend won't start
- ✅ Check if port 5173/5174 is already in use
- ✅ Run `npm install` in inventory_module directory
- ✅ Check for any error messages in terminal

### Connection issues
- ✅ Make sure backend is running first
- ✅ Check CORS settings in `server/src/app.js`
- ✅ Verify API_BASE_URL in `inventory_module/src/utils/constants.js`
- ✅ Check browser console for errors

### Database connection errors
- ✅ Verify MySQL is running: `mysql -u root -p`
- ✅ Check database credentials in `.env`
- ✅ Ensure database exists: `CREATE DATABASE your_database_name;`

---

## Ports Used

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173 (or 5174 if 5173 is busy)

---

## Development Tips

1. **Backend auto-reload**: Use `npm run dev` instead of `npm start` (requires nodemon)
2. **Frontend hot-reload**: Vite automatically reloads on file changes
3. **Check logs**: Both servers log to terminal - watch for errors
4. **Database sync**: Backend automatically syncs models in development mode

---

## Quick Commands Reference

```bash
# Backend
cd Ethernet-CRM-pr-executive-management/server
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with auto-reload

# Frontend
cd inventory_module
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

---

**Need Help?** Check the console logs for specific error messages!




