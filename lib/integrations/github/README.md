# GitHub Integration

## Setup

1. Create a personal access token at [GitHub Settings](https://github.com/settings/tokens)
2. Add to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

## Usage

```typescript
import { getRepos, createIssue } from '@/lib/integrations/github/client';

// Get repos
const repos = await getRepos();

// Create issue
await createIssue('owner', 'repo', {
  title: 'Bug report',
  body: 'Description here',
  labels: ['bug'],
});
```