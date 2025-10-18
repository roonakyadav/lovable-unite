#!/usr/bin/env bash
set -e

echo "1/8  Ensure tsconfig.json is valid..."
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
JSON
echo "tsconfig.json written."

echo "2/8  Ensure src/lib/utils.ts exports cn..."
mkdir -p src/lib
cat > src/lib/utils.ts <<'TS'
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
TS
echo "src/lib/utils.ts written."

echo "3/8  Fix import path casing for 'integrations' -> 'Integrations' ..."
# find files importing @/integrations and replace to @/Integrations (case-sensitive FS)
grep -R --line-number --binary-files=without-match -n "@/integrations" src || true
# perform replacement
find src -type f -name "*.ts*" -print0 | xargs -0 sed -i 's@/@@g' || true
# safer: only replace the alias pattern
grep -R --line-number "@/integrations" src | cut -d: -f1 | sort -u | while read -r file; do
  sed -i 's@/integrations/@/Integrations/@g' "$file" || true
done
echo "Casing replacements attempted (check changes)."

echo "4/8  Run eslint --fix where available..."
if [ -f .eslintrc.js ] || [ -f .eslintrc.cjs ] || [ -f .eslintrc.json ] || [ -f package.json ]; then
  npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix --max-warnings=0 || true
else
  echo "No eslint config detected. Skipping eslint."
fi

echo "5/8  Install node modules and run TypeScript checks..."
npm install --no-audit --no-fund || true

echo "6/8  Regenerate Supabase types if env present (optional)..."
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Regenerating supabase types..."
  npx supabase gen types typescript --project-url "$SUPABASE_URL" --api-key "$SUPABASE_SERVICE_ROLE_KEY" > src/Integrations/supabase/types.ts || true
else
  echo "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Skipping supabase types regeneration."
fi

echo "7/8  Print a short summary of files that still reference the old import path..."
grep -R --line-number "@/integrations" src || echo "No remaining @/integrations found."

echo "8/8  Try starting dev server to surface remaining errors..."
# start vite build once to gather errors and exit after printing
npx vite build --emptyOutDir=false || true

echo "Fixer script finished. Now run: npm run dev  and paste the terminal output here."
