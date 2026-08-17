# Authorization Helper Functions - Usage Guide

This document provides examples of how to use the authorization helper functions in Next.js API routes.

## Overview

The `auth-helpers.ts` module provides three main functions for authentication and authorization:

1. **`requireAuth()`** - Ensures user is logged in
2. **`requireRole()`** - Ensures user has specific role(s)
3. **`requireOwnership()`** - Ensures user owns a resource (admins bypass this)

All functions automatically handle error responses (401 Unauthorized, 403 Forbidden) and return `null` when authorization fails.

## Import

```typescript
import { requireAuth, requireRole, requireOwnership } from '@/lib/auth-helpers';
```

## Usage Examples

### Example 1: Basic Authentication

Require any authenticated user to access an endpoint:

```typescript
// src/pages/api/profile/me.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth-helpers';
import { db, profiles } from '@/db';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Require authentication
  const session = await requireAuth(req, res);
  if (!session) return; // 401 response already sent

  // Get user profile from database
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  return res.status(200).json({ data: profile });
}
```

### Example 2: Role-Based Access Control

Restrict endpoint to specific roles (e.g., teachers and admins only):

```typescript
// src/pages/api/quizzes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { db, quizzes } from '@/db';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Public endpoint - no auth required
    const allQuizzes = await db.select().from(quizzes);
    return res.status(200).json({ data: allQuizzes });
  }

  if (req.method === 'POST') {
    // Only teachers and admins can create quizzes
    const session = await requireRole(req, res, ['teacher', 'admin']);
    if (!session) return; // 401 or 403 response already sent

    const { title, questions } = req.body;

    const newQuiz = await db.insert(quizzes).values({
      id: crypto.randomUUID(),
      teacherId: session.user.id,
      title,
      questions,
    });

    return res.status(201).json({ data: newQuiz, message: 'Quiz created' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Example 3: Resource Ownership Validation

Ensure user owns a resource before allowing updates/deletes:

```typescript
// src/pages/api/quizzes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireOwnership } from '@/lib/auth-helpers';
import { db, quizzes } from '@/db';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Public read access
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id as string))
      .limit(1);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.status(200).json({ data: quiz });
  }

  if (req.method === 'PUT') {
    // First, get the quiz to check ownership
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id as string))
      .limit(1);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Verify ownership (admins bypass this check)
    const session = await requireOwnership(req, res, quiz.teacherId);
    if (!session) return; // 401 or 403 response already sent

    // Update the quiz
    const { title, questions } = req.body;
    await db
      .update(quizzes)
      .set({ title, questions })
      .where(eq(quizzes.id, id as string));

    return res.status(200).json({ message: 'Quiz updated successfully' });
  }

  if (req.method === 'DELETE') {
    // Similar ownership check for deletion
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id as string))
      .limit(1);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const session = await requireOwnership(req, res, quiz.teacherId);
    if (!session) return;

    await db.delete(quizzes).where(eq(quizzes.id, id as string));

    return res.status(200).json({ message: 'Quiz deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Example 4: Combined Authorization

Combine role check with ownership validation:

```typescript
// src/pages/api/teachers/[id]/skills.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { requireRole, requireOwnership } from '@/lib/auth-helpers';
import { db, teacherSkills } from '@/db';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: teacherId } = req.query;

  if (req.method === 'GET') {
    // Any authenticated teacher can view
    const session = await requireRole(req, res, ['teacher', 'admin']);
    if (!session) return;

    const skills = await db
      .select()
      .from(teacherSkills)
      .where(eq(teacherSkills.teacherId, teacherId as string));

    return res.status(200).json({ data: skills });
  }

  if (req.method === 'PUT') {
    // First check if user is teacher or admin
    const session = await requireRole(req, res, ['teacher', 'admin']);
    if (!session) return;

    // Then check if they own this resource (admins can edit any)
    const ownershipSession = await requireOwnership(
      req,
      res,
      teacherId as string
    );
    if (!ownershipSession) return;

    // Update teacher's skills
    const { skillIds } = req.body;
    // ... update logic here

    return res.status(200).json({ message: 'Skills updated' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

## Authorization Flow Summary

### `requireAuth(req, res)`
- ✅ Authenticated user → Returns `Session`
- ❌ Not authenticated → Returns `null`, sends `401 Unauthorized`

### `requireRole(req, res, ['role1', 'role2'])`
- ✅ Authenticated + Has role → Returns `Session`
- ❌ Not authenticated → Returns `null`, sends `401 Unauthorized`
- ❌ Wrong role → Returns `null`, sends `403 Forbidden`

### `requireOwnership(req, res, resourceOwnerId)`
- ✅ Authenticated + Owns resource → Returns `Session`
- ✅ Authenticated + Is admin → Returns `Session` (bypasses ownership check)
- ❌ Not authenticated → Returns `null`, sends `401 Unauthorized`
- ❌ Not owner + Not admin → Returns `null`, sends `403 Forbidden`

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized: Authentication required"
}
```

### 403 Forbidden (Insufficient Role)
```json
{
  "error": "Forbidden: Insufficient permissions",
  "required": ["teacher", "admin"],
  "current": "student"
}
```

### 403 Forbidden (Not Owner)
```json
{
  "error": "Forbidden: You do not own this resource"
}
```

## Best Practices

1. **Check authorization early** - Call auth helpers at the start of your handler
2. **Always return after null check** - The helpers send responses, so return immediately
3. **Use appropriate helper** - Don't use `requireOwnership` for role-only checks
4. **Admin bypass** - Remember admins automatically pass ownership checks
5. **Public endpoints** - Don't call auth helpers for public read operations
6. **Type safety** - The helpers return strongly-typed Session objects

## Testing

See `auth-helpers.test.ts` for comprehensive unit tests covering all scenarios.

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **10.1**: Session validation using NextAuth
- **10.6**: Resource ownership validation
- **20.6**: Role-based access control
- **4.1, 4.2**: NextAuth integration
- **7.2, 7.3**: API route authorization

## Related Files

- `/src/pages/api/auth/[...nextauth].ts` - NextAuth configuration
- `/types/next-auth.d.ts` - TypeScript type definitions
- `/src/lib/auth-helpers.test.ts` - Unit tests
