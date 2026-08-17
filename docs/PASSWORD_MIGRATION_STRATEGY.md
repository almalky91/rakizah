# Password Migration Strategy

## Overview

This document outlines the strategy for migrating user passwords from Supabase Auth to NextAuth during the Supabase to Next.js migration. The strategy addresses security, user experience, and technical implementation considerations.

## Migration Approach: Password Reset (Recommended)

### Rationale

We recommend **forcing all users to reset their passwords** during migration for the following reasons:

1. **Security Best Practice**: Password reset ensures that all passwords are re-hashed with our chosen algorithm (bcrypt, cost factor 12) and eliminates any potential security issues from hash migration.

2. **Hash Incompatibility Risk**: Supabase uses bcrypt for password hashing, but extracting raw hashes requires service role access and may introduce compatibility issues with NextAuth's authentication flow.

3. **Clean Break**: Starting fresh with password hashes eliminates any legacy security concerns and ensures all passwords meet current security standards.

4. **User Re-engagement**: Password reset provides an opportunity to notify users about the platform migration and any new features.

### Implementation Plan

#### Phase 1: Pre-Migration (1 week before)

1. **Email Notification Campaign**
   - Send advance notice to all users about upcoming migration
   - Inform users they will need to reset passwords
   - Provide timeline and support contact information
   - Include instructions on how to reset password after migration

2. **Data Preparation**
   - Export all user emails from Supabase
   - Identify users who need password reset notifications
   - Prepare email templates for password reset

#### Phase 2: Migration Day

1. **Database Migration**
   - Migrate all user data from Supabase to MySQL
   - Set `password_hash` field to NULL for all existing users
   - Add `password_reset_required` flag or track via NULL password_hash

2. **Password Reset Token Generation**
   - Generate secure password reset tokens for all users
   - Store tokens in `password_reset_tokens` table with:
     - Token hash (for security)
     - User ID
     - Expiration timestamp (24 hours recommended)
     - Creation timestamp
     - Used status (boolean)

3. **Email Distribution**
   - Send password reset emails to all users with reset links
   - Include token in secure URL: `/reset-password?token=<token>`
   - Provide clear instructions and support information

#### Phase 3: Post-Migration

1. **Monitoring**
   - Track password reset completion rates
   - Monitor support requests
   - Identify users who need assistance

2. **Follow-up Notifications**
   - Send reminder emails after 3 days for users who haven't reset
   - Send final reminder after 7 days
   - Provide support for users having difficulty

3. **Account Lockout Strategy** (Optional)
   - Consider temporary account deactivation for users who don't reset after 30 days
   - Provide easy reactivation via password reset email

## Password Reset Flow

### User Experience Flow

```
1. User receives password reset email
   ↓
2. User clicks reset link with token
   ↓
3. User lands on password reset page
   ↓
4. User enters new password (min 8 chars, complexity rules)
   ↓
5. System validates token and updates password
   ↓
6. User is redirected to login page
   ↓
7. User logs in with new password
```

### Technical Flow

```
1. Generate secure random token (32 bytes)
   ↓
2. Hash token with SHA-256 for storage
   ↓
3. Store hashed token in database with expiration
   ↓
4. Send email with plain token in URL
   ↓
5. User submits new password with token
   ↓
6. Validate token (exists, not expired, not used)
   ↓
7. Hash new password with bcrypt (cost 12)
   ↓
8. Update user's password_hash
   ↓
9. Mark token as used
   ↓
10. Invalidate all other tokens for user (optional)
```

## Database Schema for Password Reset

```sql
CREATE TABLE password_reset_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of token
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

## Security Best Practices

### Token Security

1. **Random Token Generation**: Use cryptographically secure random number generator (crypto.randomBytes)
2. **Token Hashing**: Store hashed tokens in database, not plain text
3. **Token Expiration**: 24-hour expiration for reset tokens
4. **One-Time Use**: Mark tokens as used after successful password reset
5. **Token Cleanup**: Periodically delete expired tokens (cron job)

### Password Requirements

1. **Minimum Length**: 8 characters
2. **Complexity**: Recommend (not require) mix of uppercase, lowercase, numbers, symbols
3. **Common Password Check**: Block common passwords (optional)
4. **Bcrypt Hashing**: Cost factor 12 (adjustable based on performance)

### Rate Limiting

1. **Password Reset Requests**: Limit to 3 requests per email per hour
2. **Reset Attempts**: Limit to 5 failed attempts per token before invalidation
3. **Account Lockout**: Consider temporary lockout after multiple failed reset attempts

## API Endpoints

### POST /api/auth/request-reset

Request a password reset token (sends email).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent if account exists"
}
```

**Notes:**
- Always returns success message (security: don't reveal if email exists)
- Rate limited to prevent abuse

### POST /api/auth/reset-password

Reset password using token.

**Request Body:**
```json
{
  "token": "secure-random-token-here",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successful"
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired token"
}
```

### GET /api/auth/validate-reset-token?token=...

Validate if a reset token is valid (for frontend validation).

**Response (Valid):**
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Token expired or invalid"
}
```

## Email Notification Templates

### Pre-Migration Announcement Email

**Subject:** Important: Rakizah Platform Migration - Action Required

**Body:**
```
Dear [User Name],

We're upgrading the Rakizah platform to provide you with a better experience! As part of this migration, you'll need to reset your password.

What you need to do:
1. On [Migration Date], you'll receive a password reset email
2. Click the link in that email
3. Set a new password (minimum 8 characters)
4. Log in with your new password

Why are we doing this?
This migration improves security and enables new features we're excited to share with you.

When will this happen?
The migration is scheduled for [Specific Date and Time].

Need help?
Contact our support team at [Support Email] or reply to this email.

Thank you for your patience!
The Rakizah Team
```

### Password Reset Email (Post-Migration)

**Subject:** Reset Your Rakizah Password

**Body:**
```
Dear [User Name],

We've completed our platform migration! Please reset your password to continue using Rakizah.

Reset your password: [Reset Link with Token]

This link will expire in 24 hours.

Didn't request this reset? 
If you didn't request this password reset, you can safely ignore this email. Your account remains secure.

Having trouble?
Contact us at [Support Email] and we'll help you get back in.

Best regards,
The Rakizah Team
```

### Password Reset Reminder Email (Day 3)

**Subject:** Reminder: Complete Your Rakizah Password Reset

**Body:**
```
Dear [User Name],

This is a friendly reminder that you haven't reset your Rakizah password yet. You'll need to do this to access your account.

Reset your password now: [Reset Link]

This link will expire in [Time Remaining].

Need assistance?
We're here to help! Contact us at [Support Email].

Best regards,
The Rakizah Team
```

## Alternative Approach: Hash Preservation (Not Recommended)

### Why Not Recommended

1. **Complexity**: Requires extracting raw password hashes from Supabase
2. **Security Risks**: Migrating hashes may introduce vulnerabilities
3. **Service Role Access**: Requires Supabase service role key with elevated privileges
4. **Compatibility Issues**: Hash formats may not be fully compatible with NextAuth

### If Hash Preservation Is Required

If business requirements mandate preserving existing passwords:

1. **Extract Hashes**: Use Supabase service role to query auth.users table
2. **Hash Format**: Verify Supabase bcrypt format matches NextAuth expectations
3. **Migration Script**: Transfer hashes directly to password_hash field
4. **Testing**: Thoroughly test authentication with migrated hashes
5. **Fallback**: Implement password reset option for failed authentications

## Migration Checklist

### Pre-Migration
- [ ] Design email templates (announcement, reset, reminders)
- [ ] Set up email service (SendGrid, AWS SES, etc.)
- [ ] Create password_reset_tokens table in MySQL
- [ ] Implement password reset API routes
- [ ] Test password reset flow in staging
- [ ] Prepare user communication schedule
- [ ] Export user email list from Supabase

### Migration Day
- [ ] Run data migration scripts
- [ ] Generate password reset tokens for all users
- [ ] Send password reset emails to all users
- [ ] Monitor email delivery and API logs
- [ ] Prepare support team for incoming requests

### Post-Migration (Week 1)
- [ ] Monitor password reset completion rates
- [ ] Send reminder emails (Day 3, Day 7)
- [ ] Respond to support requests
- [ ] Track authentication errors and issues
- [ ] Document any problems and resolutions

### Post-Migration (Week 2-4)
- [ ] Send final reminders to remaining users
- [ ] Consider account deactivation for non-compliant users
- [ ] Analyze migration metrics and user feedback
- [ ] Clean up expired password reset tokens
- [ ] Document lessons learned

## Email Service Configuration

### Environment Variables

```bash
# Email service configuration
EMAIL_SERVICE_PROVIDER=sendgrid  # or 'ses', 'smtp'
EMAIL_FROM_ADDRESS=noreply@rakizah.com
EMAIL_FROM_NAME=Rakizah Platform
SENDGRID_API_KEY=your-sendgrid-api-key
# OR for AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-access-key
AWS_SES_SECRET_ACCESS_KEY=your-secret-key
# OR for SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

### Email Service Abstraction

```typescript
// src/lib/email-service.ts
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Implementation based on EMAIL_SERVICE_PROVIDER
  // - SendGrid: Use @sendgrid/mail
  // - AWS SES: Use AWS SDK
  // - SMTP: Use nodemailer
}
```

## Success Metrics

### Target Metrics
- **Day 1**: 40% of users reset passwords
- **Day 3**: 70% of users reset passwords
- **Day 7**: 85% of users reset passwords
- **Day 30**: 95% of users reset passwords

### Monitoring
- Track password reset request rate
- Monitor email delivery success rate
- Track authentication success/failure rates
- Monitor support ticket volume and themes
- Measure user satisfaction (optional survey)

## Rollback Plan

If critical issues arise:

1. **Immediate**: Restore Supabase database access (read-only)
2. **Short-term**: Dual authentication support (NextAuth + Supabase)
3. **Long-term**: Fix issues and re-attempt migration

## Conclusion

The password reset approach provides the most secure and straightforward path for password migration. While it requires user action, the clear communication strategy and simple reset process minimize friction and ensure all passwords meet current security standards.

For questions or concerns about this strategy, contact the development team.
