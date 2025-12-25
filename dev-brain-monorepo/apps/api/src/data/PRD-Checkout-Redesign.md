# PRD: Checkout Flow Optimization
**Status:** Draft | **Author:** Product Team

## Overview
We are migrating from a multi-page checkout to a **Single Page Checkout** to reduce friction.

## Key Logic Locations
- **Affiliate Logic:** Managed in `apps/api/src/modules/affiliates/calculator.ts`. It calculates commissions based on the `UTM_SOURCE` cookie.
- **Tax Calculation:** External service call via `TaxJar` in `packages/services/tax.service.ts`.

## Debugging Next.js RSC
For debugging Server Side Components in the checkout:
- Check the Node.js console, not the browser console.
- Use `cookies()` from `next/headers` to verify session persistence.