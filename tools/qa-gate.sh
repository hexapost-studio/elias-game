#!/usr/bin/env bash
#
# qa-gate.sh — Porte QA unique d'Élias, SANS navigateur (pas de Playwright).
#
# Lance, en fail-fast, les 4 portes du projet puis un diff lint PAR FICHIER touché
# vs HEAD (la base ESLint est déjà rouge → on compare au lieu d'exiger zéro global).
# N'écrit jamais dans le repo. Code retour 0 = vert (le lead peut committer).
#
#   bash tools/qa-gate.sh
#
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

fail() { echo "❌ PORTE QA ROUGE — $1"; exit 1; }
step() { echo "── $1 ──"; }

step "1/5 tsc --noEmit"
npx tsc --noEmit || fail "tsc"

step "2/5 vitest run"
npx vitest run || fail "vitest"

step "3/5 vite build"
npx vite build || fail "build"

step "4/5 npm run validate"
npm run validate || fail "validate (données)"

step "5/5 lint-diff par fichier touché vs HEAD"
# Fichiers .ts/.tsx modifiés (suivis) + non suivis, hors supprimés.
# (lecture portable — pas de `mapfile`, absent de bash 3.2 / macOS)
FILES=()
while IFS= read -r line; do
  [ -n "$line" ] && FILES+=("$line")
done < <(
  { git diff --name-only --diff-filter=d HEAD -- '*.ts' '*.tsx';
    git ls-files --others --exclude-standard -- '*.ts' '*.tsx'; } | sort -u
)

if [ ${#FILES[@]} -eq 0 ]; then
  echo "  (aucun .ts/.tsx touché)"
else
  # Compte d'erreurs (severity 2) ESLint sur un flux JSON.
  count_errs() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s);console.log(r.reduce((n,f)=>n+(f.errorCount||0),0))}catch{console.log(0)}})'; }
  regressions=0
  for f in "${FILES[@]}"; do
    after=$(npx eslint "$f" -f json 2>/dev/null | count_errs)
    if git cat-file -e "HEAD:$f" 2>/dev/null; then
      before=$(git show "HEAD:$f" | npx eslint --stdin --stdin-filename "$f" -f json 2>/dev/null | count_errs)
    else
      before=0  # fichier neuf → aucune erreur tolérée
    fi
    if [ "${after:-0}" -gt "${before:-0}" ]; then
      echo "  ⨯ $f : $before → $after (RÉGRESSION)"
      regressions=$((regressions+1))
    else
      echo "  ✓ $f : $before → $after"
    fi
  done
  [ "$regressions" -eq 0 ] || fail "dette lint ajoutée sur $regressions fichier(s)"
fi

echo "✅ PORTE QA VERTE — prêt à committer."
