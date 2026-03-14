# Authentication System - Quick Reference

## What Was Created

### 1. **User Model** (`models/userSchema.js`)

- User schema with username, email, password
- Automatic password exclusion from JSON responses

### 2. **Auth Middleware** (`middleware/authMiddleware.js`)

- `verifyToken` - Validates JWT token from request headers
- Extracts user info and attaches to `req.user`
- Returns 401 if no/invalid token

### 3. **Auth Controller** (`controllers/authController.js`)

- `register()` - Create new user with hashed password
- `login()` - Authenticate user and issue token
- `verifyTokenEndpoint()` - Test endpoint for token validation

### 4. **Auth Routes** (`routes/authRoutes.js`)

- `POST /api/auth/register` - Public endpoint
- `POST /api/auth/login` - Public endpoint
- `GET /api/auth/verify` - Protected endpoint (requires token)

### 5. **Updated Server** (`server.js`)

- Auth routes registered
- `/api/items` now protected with `verifyToken` middleware

---

## Usage Summary

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@gmail.com",
    "password": "pass123",
    "confirmPassword": "pass123"
  }'
```

Returns: `{ success: true, token: "...", user: {...} }`

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@gmail.com", "password": "pass123"}'
```

Returns: `{ success: true, token: "...", user: {...} }`

### Use Protected Route

```bash
curl -X GET http://localhost:3000/api/items \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
```

---

## In Your Controllers

```javascript
// Access logged-in user in protected routes
const userId = req.user.userId; // User's MongoDB ID
const userEmail = req.user.email; // User's email
const username = req.user.username; // User's username
```

---

## Password Reset (Optional Enhancement)

To add: Create forgot-password route that generates temporary token

---

## How It Works (Flow)

```
Frontend → Register/Login → Backend validates → Hash password → Save to DB
    ↓
Backend generates JWT (valid 7 days) → Send to Frontend
    ↓
Frontend stores token (localStorage/session)
    ↓
Frontend sends token with every API request (Authorization header)
    ↓
Backend middleware verifies token → If valid, allow request → If expired/invalid, deny
    ↓
Controller accesses user info via req.user
```

---

## Key Points

✅ Passwords are hashed before saving (bcryptjs with 10 salt rounds)
✅ Tokens expire after 7 days
✅ Token verification happens for every protected route
✅ User info is accessible in `req.user` in protected controllers
✅ All routes under `/api/items` now require authentication
✅ Auth routes (`/api/auth/register`, `/api/auth/login`) are public

---

## Troubleshooting

| Issue                           | Solution                                   |
| ------------------------------- | ------------------------------------------ |
| "No token provided"             | Add `Authorization: Bearer <token>` header |
| "Invalid token"                 | Token is expired or corrupted. Login again |
| "Passwords do not match"        | Check confirmPassword matches password     |
| "Username/Email already exists" | Use different email or username            |

---

## Files Map

```
middleware/authMiddleware.js     ← Token verification
models/userSchema.js             ← User database structure
controllers/authController.js    ← Login/Register logic
routes/authRoutes.js             ← Auth endpoints
server.js                        ← Routes configuration
AUTH_GUIDE.md                    ← Detailed documentation
MIDDLEWARE_EXAMPLES.js           ← Usage examples
```
