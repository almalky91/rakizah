# Task 5.5 Completion: Create Authorization Helper Functions

## Summary

Successfully created authorization helper functions for Next.js API routes. These reusable middleware functions integrate with NextAuth to enforce authentication and authorization rules across all API endpoints.

## Files Created

### 1. `/src/lib/auth-helpers.ts` (Main Implementation)
Created three core authorization functions:

- **`requireAuth(req, res)`**: Validates that a user is authenticated
  - Returns `Session` if authenticated
  - Sends `401 Unauthorized` if not authenticated
  - Uses `getServerSession()` from NextAuth

- **`requireRole(req, res, allowedRoles[])`**: Validates user has required role
  - Returns `Session` if user has one of the allowed roles
  - Sends `401 Unauthorized` if not authenticated
  - Sends `403 Forbidden` if insufficient permissions
  - Supports multiple roles (e.g., `['teacher', 'admin']`)

- **`requireOwnership(req, res, resourceOwnerId)`**: Validates resource ownership
  - Returns `Session` if user owns the resource
  - Admins automatically bypass ownership checks
  - Sends `401 Unauthorized` if not authenticated
  - Sends `403 Forbidden` if user doesn't own resource

### 2. `/src/lib/auth-helpers.test.ts` (Unit Tests)
Comprehensive test suite covering all scenarios:

- ✅ Authentication validation (authenticated vs. unauthenticated)
- ✅ Role-based access control (correct role, wrong role, no role)
- ✅ Ownership validation (owner, non-owner, admin bypass)
- ✅ Error response formats (401, 403)
- ✅ Edge cases (null session, missing user)

### 3. `/src/lib/AUTH_HELPERS_USAGE.md` (Documentation)
Complete usage guide including:

- Function signatures and parameters
- 4 detailed usage examples
- Authorization flow diagrams
- Error response formats
- Best practices
- Requirements mapping

## Key Features

### Type Safety
- Full TypeScript integration with NextAuth types
- Strongly-typed `Session` return values
- Proper null handling with type guards

### Error Handling
- Consistent error response formats
- Helpful error messages with context
- HTTP status codes (401 for auth, 403 for authz)

### Admin Bypass
- Admins automatically pass ownership checks
- Maintains RBAC while providing admin flexibility
- Documented in all functions

### Integration Points
- Uses `getServerSession()` from NextAuth
- Imports `authOptions` from NextAuth configuration
- Compatible with existing session structure
- Ready for immediate use in API routes

## Requirements Satisfied

✅ **Requirement 10.1**: Session validation using NextAuth's `getServerSession()`  
✅ **Requirement 10.6**: Resource ownership validation with admin bypass  
✅ **Requirement 20.6**: Role-based access control for API routes  
✅ **Requirements 4.1, 4.2**: NextAuth integration for authentication  
✅ **Requirements 7.2, 7.3**: Authorization for API route operations  

## Acceptance Criteria Verification

✅ File created at `src/lib/auth-helpers.ts`  
✅ `requireAuth()` checks valid session and returns session or null  
✅ `requireRole()` validates user has one of allowed roles  
✅ `requireOwnership()` validates user owns resource (admins bypass check)  
✅ All functions handle error responses (401 for unauthorized, 403 for forbidden)  
✅ Functions are TypeScript-typed for Next.js API routes  
✅ Functions use NextAuth's `getServerSession()` to retrieve session data  

## Usage Example

```typescript
// Example: Protecting a resource update endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import { requireOwnership } from '@/lib/auth-helpers';
import { db, quizzes } from '@/db';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the resource
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, req.query.id as string))
    .limit(1);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  // Verify ownership (admins can edit any resource)
  const session = await requireOwnership(req, res, quiz.teacherId);
  if (!session) return; // Error response already sent

  // Proceed with update
  await db
    .update(quizzes)
    .set(req.body)
    .where(eq(quizzes.id, req.query.id as string));

  return res.status(200).json({ message: 'Quiz updated' });
}
```

## Next Steps

These helper functions are now ready to be used in subsequent tasks:

- **Task 6.x**: Profile management API routes
- **Task 7.x**: Quiz management API routes
- **Task 8.x**: Video management API routes
- **Task 9.x**: Game management API routes
- **Task 10.x**: Skills management API routes

Each API route will use these helpers to enforce proper authentication and authorization.

## Testing

Unit tests have been created in `auth-helpers.test.ts`. To run the tests:

```bash
npm run test -- auth-helpers.test.ts
```

The tests verify:
- All success paths (authenticated, correct role, ownership)
- All failure paths (unauthenticated, wrong role, not owner)
- Admin bypass behavior
- Error response formats

## Notes

- All functions follow the pattern: return `Session` on success, `null` on failure
- Error responses are automatically sent, so callers should `return` after null check
- The functions integrate seamlessly with existing NextAuth setup
- Admin role has special privileges in `requireOwnership()`
- Functions are designed for Next.js API routes specifically (not App Router)

## Validation

✅ TypeScript compilation: No errors  
✅ Type checking: All types properly defined  
✅ Integration: Compatible with existing NextAuth setup  
✅ Documentation: Complete usage guide provided  
✅ Testing: Comprehensive unit test suite created  

---

**Task Status**: ✅ COMPLETED

All acceptance criteria have been met. The authorization helper functions are production-ready and fully integrated with the NextAuth configuration.
