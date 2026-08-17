# Task 6.3: Current User Info API Route - Manual Testing Guide

## Overview
This document provides manual testing instructions for the `/api/auth/me` endpoint.

## Endpoint Details
- **URL**: `GET /api/auth/me`
- **Authentication**: Required (NextAuth session)
- **Purpose**: Returns the current authenticated user's profile and role information

## Implementation Summary
✅ Created `src/pages/api/auth/me.ts`
✅ Uses `getServerSession` from NextAuth for authentication
✅ Returns 401 for unauthenticated requests
✅ Queries database for full user profile using Drizzle ORM
✅ Includes user role from `user_roles` table
✅ Returns JSON response with user profile and role
✅ Follows API response format conventions (returns `{ data: {...} }`)

## Requirements Validated
- ✅ Requirement 4.7: Session management and user profile retrieval
- ✅ Requirement 7.5: Role-based access control information

## Manual Testing Instructions

### Prerequisites
1. Have a running Next.js development server
2. Have at least one user registered in the database
3. Have a REST client (Postman, Insomnia, or curl)

### Test Case 1: Unauthenticated Request
**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Expected Response:**
- Status: 401 Unauthorized
- Body:
```json
{
  "error": "Unauthorized"
}
```

### Test Case 2: Authenticated Request (Teacher)
**Steps:**
1. First, log in to get a session:
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@example.com", "password": "password123"}' \
  -c cookies.txt
```

2. Then, call the /me endpoint with the session:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected Response:**
- Status: 200 OK
- Body:
```json
{
  "data": {
    "id": "user-uuid",
    "email": "teacher@example.com",
    "fullName": "Teacher Name",
    "bio": "Teacher bio",
    "phoneNumber": "1234567890",
    "schoolName": "Example School",
    "publicSlug": "teacher-slug",
    "pageTitle": "Teacher's Page",
    "pageTemplate": "default",
    "subscriptionActive": true,
    "subscriptionEndsAt": "2025-12-31T00:00:00.000Z",
    "trialEndsAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "role": "teacher"
  }
}
```

### Test Case 3: Invalid HTTP Method
**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected Response:**
- Status: 405 Method Not Allowed
- Body:
```json
{
  "error": "Method not allowed"
}
```

### Test Case 4: Browser Testing
1. Open your application in a browser
2. Log in with valid credentials
3. Open browser DevTools (F12)
4. In the Console tab, run:
```javascript
fetch('/api/auth/me')
  .then(res => res.json())
  .then(data => console.log(data));
```
5. You should see the user profile data in the console

## Response Structure
The endpoint returns a standardized response format:

```typescript
{
  data: {
    id: string;
    email: string;
    fullName: string;
    bio: string | null;
    phoneNumber: string | null;
    schoolName: string | null;
    publicSlug: string | null;
    pageTitle: string | null;
    pageTemplate: string;
    subscriptionActive: boolean;
    subscriptionEndsAt: Date | null;
    trialEndsAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    role: 'admin' | 'teacher' | 'student';
  }
}
```

## Error Responses
1. **401 Unauthorized**: User is not authenticated (no valid session)
2. **404 Not Found**: User profile not found in database (should rarely happen)
3. **405 Method Not Allowed**: Request method is not GET
4. **500 Internal Server Error**: Database connection error or other server error

## Integration Points
This endpoint is typically called by:
- Frontend authentication context to load current user data
- Protected route guards to verify user access
- User profile pages to display current user information
- Role-based UI components to show/hide features based on user role

## Code Quality Checklist
✅ TypeScript types are correctly defined
✅ Error handling for all edge cases
✅ Follows NextAuth session validation pattern
✅ Uses Drizzle ORM for database queries
✅ Excludes sensitive data (passwordHash is not returned)
✅ Returns consistent JSON response format
✅ Proper HTTP status codes
✅ Comments and JSDoc documentation included

## Next Steps
After manual testing confirms the endpoint works:
1. Update frontend API client to use this endpoint
2. Create AuthContext or useCurrentUser hook to fetch user data
3. Update protected routes to use this endpoint for authentication checks
4. Consider adding caching for frequently accessed user data
