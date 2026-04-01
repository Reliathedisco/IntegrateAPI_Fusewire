# Fiverr Demo Safety Checklist

Use this checklist before recording or sharing your editor.

## 1) Hide real secrets

- Do not open `.env.local`, `.env`, or any file containing secrets.
- Use `.env.example` for screenshots or walkthroughs.
- Keep the terminal clear of history and environment output.

## 2) Quick scan for secret strings

Run this before recording:

```
rg "(sk_live|sk_test|rk_live|rk_test|whsec_|clerk_[a-z0-9_]*|resend_[a-z0-9_]*|openai|supabase|neon|database_url|api_key|api-key|secret|token)" \
  --glob "*.{ts,tsx,js,jsx,md,json,sql,css,env,example}"
```

Only show placeholder values. Rotate any key that was ever visible.

## 3) Safe screen capture

- Close all tabs that could show secrets.
- Avoid showing output from commands that print env vars.
- Prefer clean panes or a fresh terminal session.

## 4) Optional demo branch (clean slate)

If you want a dedicated demo branch with only placeholders, create one and
record there:

```
git checkout -b fiverr-demo
```
