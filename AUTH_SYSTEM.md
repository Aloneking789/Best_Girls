# Authentication System Documentation

## Overview
This document describes the authentication and authorization system implemented for the KV GIT College Admin CMS.

## Key Features

1. **Token-Based Authentication** - JWT tokens are used for authentication
2. **Automatic Route Protection** - Protected routes redirect to login if token is missing
3. **Session Persistence** - Auth data is stored in localStorage and cookies
4. **Permission Management** - User permissions are cached and accessible throughout the app
5. **Back Button Prevention** - Users cannot navigate back to dashboard after logout

## Files Created

### 1. `lib/api.ts`
**Purpose:** Centralized API logic with Authorization token handling

**Key Functions:**
- `login(payload)` - Login API call
- `apiCall<T>()` - Generic API wrapper with automatic token injection
- `saveAuthData()` - Save token and user data to storage
- `clearAuthData()` - Clear auth data on logout
- `getToken()` - Retrieve stored token
- `getUserData()` - Get cached user data with permissions
- `isAuthenticated()` - Check if user is authenticated

**Usage:**
```typescript
import { login, saveAuthData, apiCall } from '@/lib/api';

// Login
const response = await login({ 
  email: 'admin@gmail.com', 
  password: 'admin123' 
});
saveAuthData(response);

// Make API calls with automatic token injection
const data = await apiCall<any>('/endpoint', { method: 'GET' });
```

### 2. `lib/auth-context.tsx`
**Purpose:** React Context for global auth state management

**Provides:**
- `isAuthenticated` - Boolean flag for auth status
- `user` - User object with name, email, role, permissions
- `loading` - Loading state during auth check
- `logout()` - Function to logout and clear auth

**Usage:**
```typescript
import { useAuth } from '@/lib/auth-context';

export default function Component() {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <button onClick={logout}>Logout</button>
  );
}
```

### 3. `app/login/page.tsx`
**Purpose:** Login page component

**Features:**
- Email/password form
- Error handling and validation
- Loading state during login
- Redirects to dashboard on successful login
- Demo credentials displayed: `admin@gmail.com / admin123`

### 4. `middleware.ts`
**Purpose:** Route protection at the middleware level

**Behavior:**
- Routes that require auth: redirect to `/login` if no token
- Login page: redirect to `/` if token exists
- Uses cookies for server-side token verification

## Data Storage

### localStorage
```javascript
// Token
localStorage.getItem('kvgittoken')

// User & Permissions
localStorage.getItem('kvgituser')
// Returns:
{
  "id": "user_id",
  "name": "Super Admin",
  "email": "admin@gmail.com",
  "role": "ADMIN",
  "permissions": [
    "User Management",
    "Setting",
    "Page Management",
    // ... all 17 permissions
  ]
}
```

### Cookies
```javascript
// Token cookie (expires in 7 days)
kvgittoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authentication Flow

```
1. User visits app
   ↓
2. AuthProvider checks localStorage for token
   ↓
3a. Token exists → Load user data → Render dashboard
3b. No token → Redirect to login page
   ↓
4. User enters credentials
   ↓
5. Call login API with email/password
   ↓
6a. Success → Save token & user data → Redirect to dashboard
6b. Error → Show error message
   ↓
7. User clicks logout
   ↓
8. Clear all auth data → Clear history → Redirect to login
```

## Permission-Based Access

Access user permissions in your components:

```typescript
import { useAuth } from '@/lib/auth-context';

export default function ProtectedFeature() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string) => 
    user?.permissions?.includes(permission);
  
  if (!hasPermission('User Management')) {
    return <div>Access Denied</div>;
  }
  
  return <div>Protected Content</div>;
}
```

## Back Button Prevention

After logout, manual browser back navigation is prevented:
- History is cleared on logout
- `popstate` event listener prevents backwards navigation
- New history states are pushed to prevent back access
- Users are redirected to login if they try to go back

## API Endpoints

### Login
```bash
POST https://kgvit.vercel.app/api/v1/main/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": {
      "name": "ADMIN",
      "permissions": [...]
    }
  }
}
```

## Making Authenticated API Calls

```typescript
import { apiCall } from '@/lib/api';

// GET request
const users = await apiCall<any>('/users', { method: 'GET' });

// POST request
const updated = await apiCall<any>('/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
});

// The token is automatically included in Authorization header
```

## Troubleshooting

### Issue: Token not persisting across page refreshes
**Solution:** Check that localStorage and cookies are enabled in browser. AuthProvider checks both on mount.

### Issue: User can navigate back after logout
**Solution:** Back button prevention is enabled. Clear cookies and storage if issues persist:
```javascript
localStorage.clear();
document.cookie = 'kvgittoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
```

### Issue: Getting 401 Unauthorized on API calls
**Solution:** Token may have expired. The app doesn't auto-refresh tokens yet. User should logout and login again.

## Security Considerations

1. **Token Storage:** JWTs are stored in localStorage (vulnerable to XSS) and cookies (more secure)
2. **HTTPS Only:** Ensure cookies are sent over HTTPS only in production
3. **Token Expiration:** Current implementation doesn't refresh tokens automatically
4. **CORS:** API calls should be made to same-origin endpoints

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Auto-logout on token expiration
- [ ] Role-based route protection
- [ ] Permission-checking middleware
- [ ] Remember me functionality
- [ ] Two-factor authentication

## Testing

To test the system:

1. **Login:** Use `admin@gmail.com / admin123`
2. **Check Storage:** Open DevTools → Application → localStorage/cookies
3. **Verify Token:** `localStorage.getItem('kvgittoken')`
4. **Check Permissions:** `JSON.parse(localStorage.getItem('kvgituser')).permissions`
5. **Test Logout:** Click logout button
6. **Test Back:** Try to navigate back - should fail

