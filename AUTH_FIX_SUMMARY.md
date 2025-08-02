# NextAuth.js Django JWT Integration Fix

## Problem Identified

Based on your debug test results, the authentication system was failing with a 500 Internal Server Error during NextAuth session creation, even though the Django JWT authentication was working correctly. The issue was that NextAuth.js expected user profile data along with the JWT tokens, but Django only returned tokens.

## Root Cause

- Django JWT endpoint (`/auth/jwt/create/`) returns only: `{ "refresh": "...", "access": "..." }`
- NextAuth.js needs user profile data (id, name, email) to create a session
- The mismatch was causing session creation to fail with 500 errors

## Solution Implemented

### 1. Enhanced Authentication Flow (`src/lib/auth.ts`)

**Before:** Single request to JWT endpoint
**After:** Two-step authentication process:

1. **Step 1:** Get JWT tokens from Django

    ```typescript
    const jwtRes = await fetch(USER_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    ```

2. **Step 2:** Use access token to fetch user profile
    ```typescript
    const userDetailsRes = await fetch(USER_DETAILS_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtTokens.access}`,
        },
    })
    ```

### 2. Improved User Object Structure

**Before:** Inconsistent user data structure
**After:** Properly formatted user object:

```typescript
const authResult = {
    id: userDetails.id?.toString() || userDetails.email,
    name: userDetails.name || userDetails.username || userDetails.email.split('@')[0],
    email: userDetails.email,
    image: userDetails.image || userDetails.avatar || null,
    access: jwtTokens.access,
    refresh: jwtTokens.refresh,
}
```

### 3. Enhanced Callback Functions

**JWT Callback:** Now properly stores all user data including tokens

```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.name = user.name
    token.email = user.email
    token.image = user.image
    token.access = user.access
    token.refresh = user.refresh
  }
  return token
}
```

**Session Callback:** Creates properly structured session object

```typescript
async session({ session, token }) {
  if (token) {
    session.user = {
      id: token.id as string,
      name: token.name as string,
      email: token.email as string,
      image: token.image as string,
    }
    session.access = token.access
    session.refresh = token.refresh
  }
  return session
}
```

### 4. Updated Type Definitions (`src/types/next-auth.d.ts`)

**Before:** Inconsistent type definitions
**After:** Proper TypeScript support:

```typescript
declare module 'next-auth' {
    interface Session extends DefaultSession {
        access: string
        refresh: string
        user: {
            id: string
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        id: string
        access: string
        refresh: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        name: string
        email: string
        image: string
        access: string
        refresh: string
    }
}
```

## Testing and Verification

### 1. Manual Testing

Once the dev server is running:

1. Navigate to `/login`
2. Enter valid credentials for your Django backend
3. Check browser developer tools for debug logs:
    - `[DEBUG] Attempting to fetch JWT tokens...`
    - `[DEBUG] JWT tokens received successfully`
    - `[DEBUG] Attempting to fetch user details...`
    - `[DEBUG] User details fetched successfully`
    - `[DEBUG] Authorization successful, returning user data`

### 2. Check Session Data

After successful login, you can verify the session contains:

```javascript
// In any component or page
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
console.log(session) // Should contain user, access, and refresh tokens
```

### 3. API Testing

Test the authentication endpoints directly:

```bash
# Test JWT creation (should work as before)
curl -X POST http://127.0.0.1:8000/auth/jwt/create/ \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Test user profile fetch (should work with returned access token)
curl -X GET http://127.0.0.1:8000/auth/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Automated Test

Run the included test script:

```bash
node test-auth-fix.js
```

## Key Benefits

1. **Robust Authentication:** Two-step process ensures both tokens and user data are available
2. **Better Error Handling:** Clear debug logs for troubleshooting
3. **Type Safety:** Proper TypeScript definitions prevent runtime errors
4. **Backwards Compatible:** Doesn't break existing authentication patterns
5. **Secure:** Uses Bearer token authentication for user profile requests

## Environment Requirements

Ensure these environment variables are set:

- `NEXT_PUBLIC_BACKEND_URL` (defaults to http://127.0.0.1:8000)
- `AUTH_SECRET` or `NEXTAUTH_SECRET` or `SECRET`

## Troubleshooting

If you still encounter issues:

1. **Check Django Endpoints:** Ensure `/auth/jwt/create/` and `/auth/users/me/` are working
2. **Verify CORS:** Make sure Django allows requests from your Next.js domain
3. **Check Debug Logs:** Look for `[DEBUG]` messages in browser console
4. **Test API Directly:** Use curl or Postman to test endpoints independently

## Next Steps

1. Remove debug logging in production by setting `debug: false` in NextAuth config
2. Consider implementing token refresh logic for long-lived sessions
3. Add error boundaries for better user experience during auth failures
4. Implement logout functionality to clear tokens from both client and server
