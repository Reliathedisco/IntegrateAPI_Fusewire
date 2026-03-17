Output integrateapi-demo.mp4

Set Theme "Catppuccin Mocha"
Set FontSize 32
Set Width 1280
Set Height 720
Set Margin 40
Set WindowBar Colorful
Set BorderRadius 12
Set TypingSpeed 60ms
Set CursorBlink true

Hide
Type "rm -rf /tmp/integrateapi-demo && mkdir -p /tmp/integrateapi-demo && cd /tmp/integrateapi-demo"
Enter
Type "cat > integrateapi <<'EOF'"
Enter
Type "#!/usr/bin/env bash"
Enter
Type "set -euo pipefail"
Enter
Type "cmd=\"${1:-}\""
Enter
Type "shift || true"
Enter
Type "case \"$cmd\" in"
Enter
Type "  login)"
Enter
Type "    printf \"%s\" \"? Email: \""
Enter
Type "    read -r email"
Enter
Type "    echo \"→ Sent a verification code to $email\""
Enter
Type "    printf \"%s\" \"? Code: \""
Enter
Type "    read -r code"
Enter
Type "    echo \"✓ Authentication successful\""
Enter
Type "    ;;"
Enter
Type "  list)"
Enter
Type "    cat <<'OUT'"
Enter
Type "Available integrations:"
Enter
Type "  Stripe"
Enter
Type "  Clerk"
Enter
Type "  Supabase"
Enter
Type "  OpenAI"
Enter
Type "OUT"
Enter
Type "    ;;"
Enter
Type "  add)"
Enter
Type "    name=\"${1:-}\""
Enter
Type "    if [[ \"$name\" != \"stripe\" ]]; then"
Enter
Type "      echo \"Unknown integration: $name\" >&2"
Enter
Type "      exit 1"
Enter
Type "    fi"
Enter
Type "    echo \"✓ Installing Stripe integration\""
Enter
Type "    mkdir -p lib app/api/webhooks/stripe"
Enter
Type "    cat > lib/stripe.ts <<'TS'"
Enter
Type "import Stripe from \"stripe\";"
Enter
Type "export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? \"\", {"
Enter
Type "  apiVersion: \"2025-02-24.acacia\","
Enter
Type "});"
Enter
Type "TS"
Enter
Type "    cat > app/api/webhooks/stripe/route.ts <<'TS'"
Enter
Type "export async function POST(req: Request) {"
Enter
Type "  return new Response(JSON.stringify({ received: true }), {"
Enter
Type "    headers: { \"content-type\": \"application/json\" },"
Enter
Type "  });"
Enter
Type "}"
Enter
Type "TS"
Enter
Type "    echo \"\""
Enter
Type "    echo \"Next: add these to .env.local\""
Enter
Type "    echo \"STRIPE_SECRET_KEY=sk_live_REDACTED\""
Enter
Type "    echo \"STRIPE_WEBHOOK_SECRET=whsec_REDACTED\""
Enter
Type "    echo \"\""
Enter
Type "    echo \"✓ Added: lib/stripe.ts\""
Enter
Type "    echo \"✓ Added: app/api/webhooks/stripe/route.ts\""
Enter
Type "    ;;"
Enter
Type "  doctor)"
Enter
Type "    echo \"✓ Auth: logged in\""
Enter
Type "    echo \"✓ Project: looks like Next.js\""
Enter
Type "    echo \"✓ Env vars: configured\""
Enter
Type "    ;;"
Enter
Type "  *)"
Enter
Type "    echo \"Usage: integrateapi <login|list|add|doctor>\" >&2"
Enter
Type "    exit 1"
Enter
Type "    ;;"
Enter
Type "esac"
Enter
Type "EOF"
Enter
Type "chmod +x integrateapi"
Enter
Type "export PATH=/tmp/integrateapi-demo:$PATH"
Enter
Type "clear"
Enter
Show

Type "integrateapi login"
Enter
Sleep 300ms
Type "demo@integrateapi.io"
Enter
Sleep 200ms
Type "000000"
Enter
Sleep 700ms

Type "integrateapi list"
Enter
Sleep 700ms

Type "integrateapi add stripe"
Enter
Sleep 900ms

Type "ls -R"
Enter
Sleep 900ms

Type "sed -n '1,40p' lib/stripe.ts"
Enter
Sleep 900ms

Type "sed -n '1,40p' app/api/webhooks/stripe/route.ts"
Enter
Sleep 900ms

Type "integrateapi doctor"
Enter
Sleep 1s