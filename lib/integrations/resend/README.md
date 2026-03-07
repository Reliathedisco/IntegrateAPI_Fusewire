# Resend Integration

## Setup

1. Get your API key from [Resend](https://resend.com/api-keys)
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_...
   ```

## Usage

```typescript
import { sendEmail } from '@/lib/integrations/resend/client';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our app!</h1>',
});
```