# Manual Testing Guide for Registration API

This guide provides manual testing instructions for the user registration API endpoint.

## Prerequisites

1. MySQL database is running and accessible
2. Database schema has been created (profiles and user_roles tables exist)
3. Environment variables are configured:
   - `DATABASE_HOST`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`
   - `DATABASE_PORT`

## Test Cases

### Test 1: Successful Registration

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "generated-uuid",
    "email": "testuser@example.com",
    "fullName": "Test User"
  }
}
```

**Database Verification:**
```sql
-- Check profile was created
SELECT * FROM profiles WHERE email = 'testuser@example.com';

-- Check user_role was created with 'student' role
SELECT ur.* FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'testuser@example.com';

-- Verify password hash starts with $2b$ (bcrypt format)
SELECT LEFT(password_hash, 4) FROM profiles WHERE email = 'testuser@example.com';
```

---

### Test 2: Invalid Email

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

### Test 3: Short Password

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "short",
    "fullName": "Test User"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### Test 4: Short Full Name

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser3@example.com",
    "password": "password123",
    "fullName": "A"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "fullName",
      "message": "Full name must be at least 2 characters"
    }
  ]
}
```

---

### Test 5: Duplicate Email

**Request (register same email twice):**
```bash
# First registration
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "password123",
    "fullName": "Duplicate User"
  }'

# Second registration with same email
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "password456",
    "fullName": "Another User"
  }'
```

**Expected Response for Second Request (400):**
```json
{
  "error": "Email already registered"
}
```

---

### Test 6: Wrong HTTP Method

**Request:**
```bash
curl -X GET http://localhost:5173/api/auth/register
```

**Expected Response (405):**
```json
{
  "error": "Method not allowed"
}
```

---

### Test 7: Missing Required Fields

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "password",
      "message": "Required"
    },
    {
      "field": "fullName",
      "message": "Required"
    }
  ]
}
```

---

### Test 8: Bcrypt Hash Verification

After registering a user, verify the password hash format and bcrypt cost factor:

**Database Query:**
```sql
SELECT password_hash FROM profiles WHERE email = 'testuser@example.com';
```

**Expected Format:**
```
$2b$12$... (bcrypt hash starting with $2b$12$)
```

The `$12$` indicates the bcrypt cost factor is 12, as required.

**Verify Password Can Be Validated:**
```javascript
// You can use bcrypt.compare to verify the hash
const bcrypt = require('bcrypt');
const isValid = await bcrypt.compare('password123', 'retrieved-hash-from-database');
console.log(isValid); // Should be true
```

---

## Integration with NextAuth

After successful registration, verify the user can log in using NextAuth:

**Request:**
```bash
curl -X POST http://localhost:5173/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

**Expected:** User should be able to authenticate successfully and receive a session token.

---

## Cleanup

After testing, clean up test data:

```sql
-- Delete test users
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@example.com'
);

DELETE FROM profiles WHERE email LIKE '%@example.com';
```

---

## Postman Collection

You can import these tests into Postman or create a collection with the following structure:

```json
{
  "info": {
    "name": "User Registration API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Successful Registration",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"testuser@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
        },
        "url": "http://localhost:5173/api/auth/register"
      }
    },
    {
      "name": "Invalid Email",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"invalid-email\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
        },
        "url": "http://localhost:5173/api/auth/register"
      }
    }
  ]
}
```

---

## Notes

- If you're testing against a production-like environment, use unique test email addresses to avoid conflicts
- Always verify database state after each test to ensure data integrity
- Monitor server logs for any unexpected errors during testing
- Ensure the MySQL database connection pool is properly configured to handle concurrent requests
