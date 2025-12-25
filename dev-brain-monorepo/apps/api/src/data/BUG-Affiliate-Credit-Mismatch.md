# BUG-104: Affiliate Credits Not Applying on Mobile
**Severity:** High | **Environment:** Production

## Description
Users coming from Instagram (mobile) are not being credited to affiliates.

## Investigation
- **Root Cause:** The `SameSite` attribute on the affiliate cookie was set to `Strict`, preventing it from being read when navigating from external social apps.
- **Fix Needed:** Change cookie policy to `SameSite=Lax`.
- **Logic File:** `apps/api/src/middleware/affiliate-tracker.ts`