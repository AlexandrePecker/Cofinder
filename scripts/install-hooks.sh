#!/usr/bin/env bash
#
# Install repo git hooks into .git/hooks (run once after cloning).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cp "$ROOT/scripts/git-hooks/pre-commit" "$ROOT/.git/hooks/pre-commit"
chmod +x "$ROOT/.git/hooks/pre-commit"
echo "Installed pre-commit hook (RLS audit)."
