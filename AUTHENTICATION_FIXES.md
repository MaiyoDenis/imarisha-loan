# Authentication Issues - Root Cause Analysis & Fixes

## Problem Summary
When user logs in and clicks on AI Dashboard (or other protected dashboards), the app redirects back to login after ~5 seconds.

**Main Dashboards Work**: Main Dashboard works because `/api/dashboard/stats` is NOT protected by `@jwt_required()`
**Protected Dashboards Fail**: Executive, AI Analytics, Forecast, Risk, Member Analytics all fail because they require JWT authentication

---

## Issues Found

### 1. ✅ FIXED: Missing `datetime` import in `backend/app/routes/ai_analytics.py`
**File**: `backend/app/routes/ai_analytics.py`
**Problem**: The `from datetime import datetime` was at the END of the file (line 257) instead of at the top. This caused `NameError` when `/api/ai-analytics/summary` endpoint tried to call `datetime.utcnow()` on line 239.
**Status**: FIXED - Import moved to line 3

---

### 2. ✅ FIXED: Missing `case` function import in `backend/app/services/ai_analytics_service.py`
**File**: `backend/app/services/ai_analytics_service.py`
**Problem**: The `case` function from SQLAlchemy was used but not imported (line 49-51), causing `NameError`.
**Status**: FIXED - Added `case` to import on line 6

---

### 3. ✅ FIXED: Missing `verify_jwt_in_request` import in `backend/app/services/jwt_service.py`
**File**: `backend/app/services/jwt_service.py`
**Problem**: 
- Line 269 calls `verify_jwt_in_request(optional=True)` but it's not imported at the top
- It's only imported inside a function on line 294
- Causes `NameError` when `get_current_user()` is called
**Status**: FIXED - Added to imports on line 16, removed duplicate from line 294

---

### 4. 🔴 CRITICAL: JWT Secret Key Regenerated on Every App Initialization
**File**: `backend/app/services/jwt_service.py` (line 68)
**Problem**: 
```python
app.config['JWT_SECRET_KEY'] = app.config.get('JWT_SECRET_KEY', secrets.token_hex(32))
```
This generates a NEW random secret key every time the app starts if `JWT_SECRET_KEY` is not in app.config.

**Why This Breaks Authentication**:
1. User logs in → Tokens created with SECRET_KEY_A
2. Any restart/reload of the Flask app → NEW SECRET_KEY_B is generated
3. User's tokens (signed with SECRET_KEY_A) are now invalid
4. JWT validation fails with 401 Unauthorized
5. Token refresh attempt fails (can't verify refresh token either)
6. User redirected to login

**Symptoms**: 
- After login, first API call works
- If app restarts or reloads between login and navigation, auth fails
- ~5 second delay is from retry logic attempting token refresh

**Fix**:
```python
# JWT configuration - use app's SECRET_KEY for consistency across restarts
if 'JWT_SECRET_KEY' not in app.config:
    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY', secrets.token_hex(32))
```

This uses the Flask app's `SECRET_KEY` (defined in `config.py` as a consistent value) instead of generating a random one each time.

---

### 5. JWT Token Refresh Endpoint Structure Issue
**File**: `backend/app/routes/auth.py` (lines 145-174)
**Problem**: 
The `/api/auth/refresh` endpoint uses an unusual pattern with a decorator applied to an inner function. While this technically works, it's not the standard Flask pattern and could cause issues.

**Current Implementation**:
```python
@bp.route('/refresh', methods=['POST'])
def refresh():
    @jwt_required(refresh=True)
    def _refresh():
        # ... logic
    return _refresh()
```

**Recommended Pattern**:
```python
@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    # ... logic
```

---

## How Authentication Flow Works

1. **Login** (`POST /api/auth/login`)
   - User sends username/password
   - Backend validates and creates access_token and refresh_token
   - Frontend stores both in localStorage

2. **API Request** (any protected endpoint)
   - Frontend sends: `Authorization: Bearer <access_token>`
   - Backend validates token signature using JWT_SECRET_KEY
   - If valid, request succeeds
   - If invalid/expired, returns 401

3. **Token Refresh** (when 401 is received)
   - Frontend sends: `POST /api/auth/refresh` with `Authorization: Bearer <refresh_token>`
   - Backend validates refresh_token and creates new access_token
   - Frontend stores new access_token and retries original request

**The Critical Point**: Both token creation and validation must use the SAME secret key. If the secret key changes between login and API call, validation fails.

---

## Files Already Fixed

✅ `backend/app/routes/ai_analytics.py` - datetime import added
✅ `backend/app/services/ai_analytics_service.py` - case import added
✅ `backend/app/services/jwt_service.py` - verify_jwt_in_request import added

---

## Files Still Need Fixing

🔴 `backend/app/services/jwt_service.py` (line 68)
- Change: `app.config['JWT_SECRET_KEY'] = app.config.get('JWT_SECRET_KEY', secrets.token_hex(32))`
- To: Use consistent app.config['SECRET_KEY'] instead of generating random key

Optional improvement:
🟡 `backend/app/routes/auth.py` (lines 145-174)
- Refactor `/refresh` endpoint to use standard decorator pattern

---

## Testing After Fixes

1. Start backend fresh
2. Login successfully
3. Click on AI Analytics Dashboard
4. Verify all 4 charts/tables load without redirecting to login
5. Refresh page - should stay logged in
6. Try other protected dashboards (Executive, Operations, Risk, Forecast, Member Analytics)

---

## Environment Configuration

The app uses `config.py` which loads `SECRET_KEY` from:
1. Environment variable: `SECRET_KEY` env var
2. Or default: `'you-will-never-guess'`

This is what should be used for JWT signing instead of a random key.
