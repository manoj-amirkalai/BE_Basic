# Authentication System Guide

## Overview

This is a complete JWT-based authentication system with user registration, login, and protected routes.

---

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a8f2c1234567890abcdef",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2026-03-14T10:30:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Username or Email already exists"
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a8f2c1234567890abcdef",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Verify Token (Protected Route)

**Endpoint:** `GET /api/auth/verify`

**Request Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": "65a8f2c1234567890abcdef",
    "email": "john@example.com",
    "username": "john_doe",
    "iat": 1710416500,
    "exp": 1711021300
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

---

## How to Make Protected Routes

### Example: Protecting Your Items Routes

In `server.js`, all routes using the middleware are protected:

```javascript
app.use("/api/items", verifyToken, router);
```

Now any request to `/api/items/*` requires a valid token.

### Using User Info from Token in Controllers

The token payload is attached to `req.user` in your controller:

```javascript
// In your controller (controllers.js)
const getUserItems = async (req, res) => {
  try {
    const userId = req.user.userId; // Get from token
    const userEmail = req.user.email;

    // Use userId to fetch items for this specific user
    const items = await Item.find({ userId: userId });

    res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      items: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};
```

---

## Frontend Usage

### 1. Register

```javascript
const register = async () => {
  const response = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "john_doe",
      email: "john@example.com",
      password: "securePassword123",
      confirmPassword: "securePassword123",
    }),
  });

  const data = await response.json();
  if (data.success) {
    // Save token to localStorage
    localStorage.setItem("token", data.token);
    console.log("User registered and logged in");
  }
};
```

### 2. Login

```javascript
const login = async () => {
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "john@example.com",
      password: "securePassword123",
    }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("token", data.token);
    console.log("Login successful");
  }
};
```

### 3. Making Protected API Calls

```javascript
const fetchItems = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/api/items", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Send token in header
    },
  });

  const data = await response.json();
  console.log(data);
};
```

---

## Project Structure

```
BE_Basic/
├── middleware/
│   └── authMiddleware.js      ← Token verification middleware
├── models/
│   ├── modelSchema.js
│   └── userSchema.js          ← User model with password hashing
├── controllers/
│   ├── controllers.js
│   └── authController.js      ← Register & login logic
├── routes/
│   ├── itemsRoutes.js
│   └── authRoutes.js          ← Auth endpoints
├── server.js                   ← Updated with auth routes
└── package.json
```

---

## Key Features

✅ **Password Hashing** - Uses bcryptjs with salt rounds (10)
✅ **JWT Tokens** - 7-day expiration by default
✅ **Protected Routes** - Middleware checks token on every API call
✅ **User Validation** - Email uniqueness, password confirmation
✅ **Error Handling** - Comprehensive error messages
✅ **User Info Access** - `req.user` contains login info in protected routes

---

## Environment Variables (Optional)

Update `authMiddleware.js` and `authController.js` to use environment variables:

Create a `.env` file:

```
JWT_SECRET=your_super_secret_key_12345_change_in_production
PORT=3000
```

Then update the files:

```javascript
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";
```

---

## Testing with Postman/Insomnia

1. **Register**: POST to `http://localhost:3000/api/auth/register`
2. **Copy the token** from response
3. **Login**: POST to `http://localhost:3000/api/auth/login`
4. **Verify**: GET to `http://localhost:3000/api/auth/verify`
   - Add header: `Authorization: Bearer <your_token_here>`

---

## Flow Diagram

```
User Registration/Login
        ↓
    Validate Input
        ↓
    Hash Password (bcrypt)
        ↓
    Save to MongoDB
        ↓
    Generate JWT Token (7 days)
        ↓
    Return Token to Frontend
        ↓
    Frontend stores token (localStorage)
        ↓
    For each API request, send: Authorization: Bearer <token>
        ↓
    Middleware verifies token
        ↓
    If valid → access granted & req.user populated
    If invalid → 401 Unauthorized
```
