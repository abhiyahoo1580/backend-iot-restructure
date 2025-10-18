# Cookie-Based Authentication Implementation

## Overview
Successfully migrated the backend from JWT token in response body to **httpOnly cookie-based authentication** for enhanced security.

---

## Changes Made

### 1. **Package Installation**
- ✅ Installed `cookie-parser` package for handling cookies

### 2. **Server Configuration (`index.js`)**
- ✅ Added `cookie-parser` middleware
- ✅ CORS already configured with `credentials: true` (required for cookies)

### 3. **Login Routes (`server/api/login/route.js`)**
Updated both login methods to set cookies:

**Changes:**
- JWT token is now set as an **httpOnly cookie** named `token`
- Token is **removed from response body** for security
- Cookie configuration:
  - `httpOnly: true` - Prevents JavaScript access (XSS protection)
  - `secure: true` - Only sent over HTTPS in production
  - `sameSite: 'none'` - Required for cross-origin requests
  - `maxAge: 43200000` - 12 hours expiration

**Endpoints:**
- `POST /login/login` - Regular login
- `POST /login/login/oauth` - OAuth login
- `POST /login/logout` - New logout endpoint (clears cookie)

### 4. **Token Verification (`server/utils/tokenVerification.js`)**
Updated existing middleware to check cookies:

**Changes:**
- Checks for token in cookies **first**
- Falls back to Authorization header for **backward compatibility**
- Attaches decoded user info to `req.user`
- Better error handling

### 5. **New Auth Middleware (`server/middleware/auth.js`)**
Created additional middleware options:

**Functions:**
- `verifyToken` - Strict authentication (401 if no token)
- `optionalAuth` - Allows requests without token

---

## Security Benefits

1. **XSS Protection**: httpOnly cookies cannot be accessed by JavaScript
2. **CSRF Protection**: sameSite attribute helps prevent CSRF attacks
3. **Secure Transmission**: Cookies only sent over HTTPS in production
4. **No Token Exposure**: Token not visible in response body or localStorage

---

## Frontend Changes Required

### Before (Token in localStorage):
```javascript
// Login
const response = await fetch('/login/login', {
  method: 'POST',
  body: JSON.stringify({ email_id, password })
});
const data = await response.json();
localStorage.setItem('token', data.data.token);

// API Request
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### After (Cookie-based):
```javascript
// Login - Cookie is set automatically
const response = await fetch('/login/login', {
  method: 'POST',
  credentials: 'include', // Important: Send cookies
  body: JSON.stringify({ email_id, password })
});
const data = await response.json();
// No need to store token - it's in cookie!

// API Request - Cookie sent automatically
fetch('/api/endpoint', {
  credentials: 'include' // Important: Send cookies
});

// Logout
fetch('/login/logout', {
  method: 'POST',
  credentials: 'include'
});
```

---

## Key Points for Frontend

1. **Add `credentials: 'include'`** to all fetch/axios requests
2. **Remove token storage** from localStorage/sessionStorage
3. **Remove Authorization headers** - cookies are automatic
4. **Update axios config** (if using axios):
```javascript
axios.defaults.withCredentials = true;
```

---

## Backward Compatibility

The token verification middleware still supports Authorization header, so:
- Old clients using header auth will continue to work
- New clients can use cookie-based auth
- Gradual migration is possible

---

## Testing

1. **Login**: Check browser DevTools → Application → Cookies for `token` cookie
2. **Protected Routes**: Token automatically sent with requests
3. **Logout**: Cookie should be cleared
4. **Expiration**: Cookie expires after 12 hours

---

## Production Considerations

1. Set `NODE_ENV=production` for secure cookies
2. Ensure HTTPS is enabled
3. Configure allowed origins in CORS properly
4. Monitor cookie size (JWT tokens can be large)

---

## Files Modified

1. `/index.js` - Added cookie-parser middleware
2. `/server/api/login/route.js` - Set cookies on login, added logout
3. `/server/utils/tokenVerification.js` - Check cookies for token
4. `/server/middleware/auth.js` - New authentication middleware (optional)
5. `/package.json` - Added cookie-parser dependency
