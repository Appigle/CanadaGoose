# CORS Troubleshooting Guide

## 🚨 CORS Issue: Frontend can't access Backend API

### **Problem Description:**

Your frontend running on `localhost:5173` is getting CORS errors when trying to access the backend API at `http://s25cicd.xiaopotato.top/api/healthcheck`.

### **Root Cause:**

The backend CORS configuration was only allowing requests from `http://s25cicd.xiaopotato.top`, but your development frontend runs on `localhost:5173`.

---

## ✅ **Solution Implemented:**

### **1. Updated CORS Configuration**

The backend now dynamically handles CORS based on environment:

- **Development Mode**: Allows all localhost origins
- **Production Mode**: Only allows production domains

### **2. Environment-Based CORS**

```javascript
// In development, be more permissive
if (process.env.NODE_ENV === 'development') {
  // Allow all localhost origins during development
  if (
    !origin ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    return callback(null, true);
  }
}
```

---

## 🚀 **How to Use:**

### **Option 1: Use Development Script (Recommended)**

```bash
cd server
./start-dev.sh
```

### **Option 2: Manual Environment Setup**

```bash
cd server
export NODE_ENV=development
npm run dev
```

### **Option 3: Update .env File**

```bash
cd server
# Edit .env file and set:
NODE_ENV=development
```

---

## 🔧 **What Was Fixed:**

### **Before (CORS Error):**

```javascript
// Only allowed production domain
origin: 'http://s25cicd.xiaopotato.top';
```

### **After (CORS Fixed):**

```javascript
// Development: Allows localhost:5173
// Production: Still allows s25cicd.xiaopotato.top
origin: function (origin, callback) {
  if (process.env.NODE_ENV === 'development') {
    // Allow localhost during development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
  }
  // Production origins
  const allowedOrigins = ['http://s25cicd.xiaopotato.top'];
  // ... rest of logic
}
```

---

## 🌐 **Allowed Origins by Environment:**

### **Development Mode (`NODE_ENV=development`):**

- ✅ `http://localhost:5173` (Vite dev server)
- ✅ `http://localhost:3000` (Local backend)
- ✅ `http://127.0.0.1:5173`
- ✅ `http://127.0.0.1:3000`
- ✅ `http://s25cicd.xiaopotato.top` (Production)

### **Production Mode (`NODE_ENV=production`):**

- ✅ `http://s25cicd.xiaopotato.top`
- ✅ `https://s25cicd.xiaopotato.top`
- ❌ `http://localhost:5173` (Blocked)

---

## 🧪 **Testing the Fix:**

### **1. Start Development Server:**

```bash
cd server
./start-dev.sh
```

### **2. Test from Frontend:**

```bash
cd ../client
npm run dev
```

### **3. Check Browser Console:**

- No more CORS errors
- API requests should work from localhost:5173

### **4. Test API Endpoint:**

```bash
curl 'http://s25cicd.xiaopotato.top/api/healthcheck' \
  -H 'Origin: http://localhost:5173' \
  -H 'Content-Type: application/json'
```

---

## 🔍 **Troubleshooting Steps:**

### **If CORS still doesn't work:**

1. **Check Environment Variable:**

   ```bash
   echo $NODE_ENV
   # Should show: development
   ```

2. **Verify Server Logs:**

   ```bash
   # Look for CORS logs in server console
   # Should see: "CORS blocked request from: [origin]"
   ```

3. **Check .env File:**

   ```bash
   cat .env | grep NODE_ENV
   # Should show: NODE_ENV=development
   ```

4. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Then restart with: ./start-dev.sh
   ```

---

## 📋 **Files Modified:**

1. **`server/app.js`** - Updated CORS configuration
2. **`server/setup-dev-env.sh`** - Development environment setup
3. **`server/start-dev.sh`** - Development server starter
4. **`server/CORS_TROUBLESHOOTING.md`** - This guide

---

## 🎯 **Expected Result:**

After implementing the fix:

- ✅ Frontend on `localhost:5173` can access backend API
- ✅ No CORS errors in browser console
- ✅ API requests work from development environment
- ✅ Production CORS still works for `s25cicd.xiaopotato.top`
- ✅ Environment-based CORS configuration

---

## 🚀 **Quick Start:**

```bash
# 1. Navigate to server directory
cd server

# 2. Start development server with CORS enabled
./start-dev.sh

# 3. In another terminal, start frontend
cd ../client
npm run dev

# 4. Test API calls from localhost:5173
# Should work without CORS errors!
```

---

## 📞 **Need Help?**

If you're still experiencing CORS issues:

1. Check the server logs for CORS messages
2. Verify `NODE_ENV=development` is set
3. Ensure you're using the development start script
4. Check browser console for specific error messages

The CORS configuration is now flexible and should handle both development and production environments seamlessly!
