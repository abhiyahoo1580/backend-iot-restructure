# 🍪 Cookie Authentication Migration Checklist

## ✅ Completed Changes

### 1. **Core Authentication Setup**
- [x] Installed `cookie-parser` package
- [x] Added `cookie-parser` middleware to `index.js`
- [x] CORS configured with `credentials: true`
- [x] Updated `tokenVerification.js` to check cookies first, then headers

### 2. **Login/Logout Endpoints**
- [x] Updated `POST /login/login` to set cookie
- [x] Updated `POST /login/login/oauth` to set cookie
- [x] Added `POST /login/logout` endpoint
- [x] Removed token from response body (keeping user details)

---

## 🔧 Changes Needed

### 3. **Controllers Using Direct Token Access**

#### **HIGH PRIORITY** - Currently Breaking with Cookies

| File | Line | Issue | Status |
|------|------|-------|--------|
| `server/api/compnay/controller.js` | Line 8 | Direct `req.headers.authorization` access | ❌ TODO |
| `server/api/OEMUser/controller.js` | Line 722 | Token verification in `verifyPasswordSetupToken` | ⚠️ CHECK |
| `server/api/OEMUser/controller.js` | Line 798 | Token verification in `setPasswordWithToken` | ⚠️ CHECK |

---

## 📋 Detailed Action Items

### **Action 1: Fix `compnay/controller.js`**
**File:** `server/api/compnay/controller.js`  
**Function:** `getCompanyDetail()`  
**Issue:** Directly reads `req.headers.authorization`

**Current Code:**
```javascript
let token = req.headers.authorization.split(" ")[1];
var decoded = JWT.decode(token);
```

**Solution Options:**
1. **Use `req.user` from middleware** (Recommended)
   - The route should use `tokenVerification` middleware
   - Access `req.user.companyId` directly
   
2. **Add cookie check** (If not using middleware)
   ```javascript
   let token;
   if (req.cookies && req.cookies.token) {
       token = req.cookies.token;
   } else if (req.headers.authorization) {
       token = req.headers.authorization.split(" ")[1];
   }
   var decoded = JWT.decode(token);
   ```

**Recommendation:** Option 1 - Use `req.user` from middleware ✅

---

### **Action 2: Review OEMUser Token Methods**
**File:** `server/api/OEMUser/controller.js`

**Functions to Check:**
1. `verifyPasswordSetupToken()` - Line ~722
2. `setPasswordWithToken()` - Line ~798

**Context:** These handle password reset/setup tokens sent via email links.

**Action Needed:**
- ✅ These are OK as-is (token comes from query params/body, not auth)
- Password setup tokens are different from auth tokens
- No changes needed

---

### **Action 3: Verify Route Protection**
**Check:** All routes should use `tokenVerification` middleware

**Already Protected Routes (using `tokenVerification`):**
- ✅ `/subject/*`
- ✅ `/lcdconfig/*`
- ✅ `/lcdDifference/*`
- ✅ `/tod/*`
- ✅ `/alertConfig/*`
- ✅ `/group/meter/*`
- ✅ `/historical/*`
- And many more...

**Routes to Check:**
- ⚠️ `/compnay/detail/get` - Needs verification

---

## 🎯 Priority Tasks

### Immediate (Must Fix)
1. **Fix `compnay/controller.js`** - Replace direct token access with `req.user`
2. **Verify route has middleware** - Ensure `/compnay/detail/get` uses `tokenVerification`

### Review (Optional)
3. Check if any other controllers decode tokens manually
4. Test all protected endpoints with cookies

---

## 🔍 Search Patterns Used

To find all token-related code:
```bash
# Direct authorization header access
grep -r "req.headers.authorization" server/api/

# JWT operations
grep -r "jwt.verify\|jwt.sign\|JWT.decode" server/api/

# Token decoding
grep -r "decoded\." server/api/
```

---

## ✅ Testing Checklist

After fixes:
- [ ] Login with cookies works
- [ ] Logout clears cookie
- [ ] Protected routes work with cookie
- [ ] Company detail endpoint works
- [ ] Password reset still works (uses different token)
- [ ] Backward compatibility with Authorization header

---

## 📝 Notes

### About `req.user`
After `tokenVerification` middleware runs, `req.user` contains:
```javascript
{
  emailId: "user@example.com",
  companyId: "123"
}
```

### Token Types
1. **Auth Token** (cookie) - For authenticated requests
2. **Password Setup Token** (email link) - For password reset
3. **OAuth Token** (Google) - For OAuth login

Only #1 needs cookie support!

---

## 🚀 Next Steps

1. Run this search to find any other direct token access:
   ```bash
   grep -rn "req.headers.authorization" server/
   ```

2. Fix `compnay/controller.js`

3. Test the complete flow

4. Update frontend to use cookies
