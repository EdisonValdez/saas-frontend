# Authentication Debugging Guide

## 🚀 Debug Features Implemented

This implementation adds comprehensive debugging to identify and resolve the 500 Internal Server Error during login.

### 1. Enhanced Error Logging

**Location**: `src/lib/actions/login.ts`

-   Detailed logging of login attempts
-   Environment variable validation
-   Full error stack traces
-   SignIn result analysis

### 2. NextAuth Debug Mode

**Location**: `src/lib/auth.ts`

-   Force-enabled debug mode
-   Comprehensive callback logging
-   Event tracking for auth flow
-   Enhanced error reporting in authorization

### 3. Direct Authentication Testing

**Location**: `src/lib/auth-fallback.ts`

-   Bypass NextAuth for direct backend testing
-   Backend connection validation
-   Raw response inspection

### 4. Debug API Endpoints

**Location**: `src/app/api/debug-auth/route.ts`

-   `GET /api/debug-auth` - Environment and connection info
-   `POST /api/debug-auth` - Direct authentication testing

### 5. Interactive Debug Panel

**Location**: `src/components/auth/user-auth-form.tsx`

-   Development-only debug panel
-   Real-time testing buttons
-   JSON result display

## 🔍 How to Debug the Login Issue

### Step 1: Check Environment Setup

```bash
# Access the debug endpoint (browser or curl)
GET http://localhost:3000/api/debug-auth
```

This will show:

-   Environment variables status
-   Backend connection test
-   Current configuration

### Step 2: Test Backend Connection

Use the debug panel in the login form or test directly:

```javascript
// In browser console
fetch('/api/debug-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType: 'connection' }),
})
    .then((r) => r.json())
    .then(console.log)
```

### Step 3: Test Direct Authentication

```javascript
// In browser console
fetch('/api/debug-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'yourpassword',
    }),
})
    .then((r) => r.json())
    .then(console.log)
```

### Step 4: Monitor Server Logs

Check the development server console for detailed debug output:

-   `[DEBUG]` prefixed messages show the authentication flow
-   Look for specific failure points
-   Check for network errors, JSON parsing issues, or backend responses

## 🔧 Common Issues and Solutions

### 1. Backend Not Running

**Symptoms**: Connection refused errors
**Solution**: Start your Django backend on `http://127.0.0.1:8000`

### 2. Wrong Backend URL

**Symptoms**: 404 or connection errors
**Solution**: Set `NEXT_PUBLIC_BACKEND_API_URL` environment variable

### 3. CORS Issues

**Symptoms**: CORS policy errors in browser
**Solution**: Configure Django CORS settings

### 4. Authentication Endpoint Mismatch

**Symptoms**: 404 on `/auth/jwt/create/`
**Solution**: Verify Django URL patterns

### 5. Invalid JSON Responses

**Symptoms**: JSON parsing errors
**Solution**: Check Django serializer responses

## 📊 Debug Output Examples

### Successful Authentication

```json
{
    "success": true,
    "status": 200,
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### Backend Connection Failed

```json
{
    "success": false,
    "error": "fetch failed",
    "backendUrl": "http://127.0.0.1:8000"
}
```

### Invalid Credentials

```json
{
    "success": false,
    "status": 401,
    "data": {
        "detail": "No active account found with the given credentials"
    }
}
```

## 🎯 Next Steps

1. **Try the debug panel** on the login page (development only)
2. **Check server console** for detailed error logs
3. **Test backend connection** using the debug tools
4. **Verify environment variables** are correctly set
5. **Test direct authentication** to isolate NextAuth issues

## 🔄 Temporary Workarounds

If backend is not available, you can:

1. **Mock the backend response** in the auth handler
2. **Skip authentication** temporarily for development
3. **Use static user data** for frontend testing

## 📝 Environment Variables Required

```env
# Required for NextAuth
AUTH_SECRET=your-secret-key-here
NEXTAUTH_SECRET=your-secret-key-here

# Backend API (optional - defaults to http://127.0.0.1:8000)
NEXT_PUBLIC_BACKEND_API_URL=http://your-backend-url

# Development
NODE_ENV=development
```

## 🚨 After Debugging

Once the issue is resolved:

1. Disable debug mode in production
2. Remove debug panel from login form
3. Clean up console.log statements if desired
4. Keep error handling improvements

---

**Note**: All debug features are designed to be development-safe and include comprehensive error handling.
