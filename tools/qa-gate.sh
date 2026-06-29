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

step "1/6 typecheck réel (tsc -p, ratchet vs baseline)"
# ⚠️ `tsc --noEmit` seul est un NO-OP ici : le tsconfig.json racine a `files:[]` + `references`,
# donc sans `-p`/`-b` rien n'est vérifié. On checke les VRAIS projets. La base a des erreurs de
# type préexistantes (cf. tools/tsc-baseline.txt) → on applique un « ratchet » : interdit toute
# régression, tolère la baseline connue. Quand on en corrige, décrémenter le fichier baseline.
TSC_BASELINE=$(tr -dc '0-9' < tools/tsc-baseline.txt)
npx tsc -p tsconfig.node.json --noEmit || fail "tsc (projet node)"
tsc_now=$(npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep -c 'error TS')
echo "  erreurs de type (app) : $tsc_now — baseline tolérée : ${TSC_BASELINE:-0}"
if [ "$tsc_now" -gt "${TSC_BASELINE:-0}" ]; then
  fail "régression de type ($tsc_now > ${TSC_BASELINE:-0}) — voir 'npx tsc -p tsconfig.app.json --noEmit'"
fi
if [ "$tsc_now" -lt "${TSC_BASELINE:-0}" ]; then
  echo "  ↓ baseline améliorable : mets à jour tools/tsc-baseline.txt à $tsc_now"
fi

step "2/6 vitest run"
npx vitest run || fail "vitest"

step "3/6 vite build"
npx vite build || fail "build"

step "4/6 npm run validate"
npm run validate || fail "validate (données)"

step "5/6 cohérence doc (statut dérivé, pas narré — G-2)"
# Anti-dérive : les compteurs « état courant » de CLAUDE.md doivent refléter le réel. Empêche de
# committer une prose qui ment (events/versets recopiés à la main). Régénérer : node tools/status.mjs
node tools/status.mjs --check || fail "doc stale (cf. node tools/status.mjs --check)"

step "6/6 lint-diff par fichier touché vs HEAD"
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
  # ⚠️ `console.log(nombre)` COLORISE quand stdout est un TTY (`\033[33m1\033[39m`) → la comparaison
  #    `-gt` plus bas recevait des codes ANSI, échouait en silence et tombait sur ✓ (régression MASQUÉE).
  #    `process.stdout.write(String(n))` n'émet jamais de couleur → entier propre garanti, TTY ou pipe.
  count_errs() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s);process.stdout.write(String(r.reduce((n,f)=>n+(f.errorCount||0),0)))}catch{process.stdout.write("0")}})'; }
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
