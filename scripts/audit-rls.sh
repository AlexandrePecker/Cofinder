#!/usr/bin/env bash
#
# audit-rls.sh — enforce the HM Supabase RLS rule.
#
# Every table created in the `public` schema MUST, in the SAME migration file:
#   1) ENABLE ROW LEVEL SECURITY, and
#   2) define at least one CREATE POLICY.
# Every view in `public` MUST be declared WITH (security_invoker = true).
#
# Why "same migration": a table that ships without RLS is world-readable through
# PostgREST the moment it exists. Splitting the policy into a later migration leaves
# a window (and relies on discipline) where the table is exposed. Discipline fails;
# this gate does not.
#
# Usage: scripts/audit-rls.sh [migrations_dir]
set -euo pipefail

MIGRATIONS_DIR="${1:-supabase/migrations}"
fail=0

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "audit-rls: no migrations directory at '$MIGRATIONS_DIR' — nothing to audit."
  exit 0
fi

shopt -s nullglob
files=("$MIGRATIONS_DIR"/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "audit-rls: no migration files — nothing to audit."
  exit 0
fi

for file in "${files[@]}"; do
  # Flatten: drop line comments, collapse newlines/whitespace into a single spaced
  # string so multi-line statements (CREATE VIEW ... WITH (...)) match reliably.
  blob=$(sed -E 's/--.*$//' "$file" | tr '\n' ' ' | tr -s ' ')

  # --- Tables created in public ---
  tables=$(echo "$blob" \
    | grep -ioE "create table (if not exists )?(public\.)?\"?[a-z_][a-z0-9_]*\"?" \
    | sed -E 's/create table (if not exists )?//I; s/public\.//I; s/"//g' \
    | sort -u || true)

  for t in $tables; do
    if ! echo "$blob" | grep -iqE "alter table (public\.)?\"?${t}\"? enable row level security"; then
      echo "❌ $file: table '$t' created without ENABLE ROW LEVEL SECURITY in the same migration"
      fail=1
    fi
    if ! echo "$blob" | grep -iqE "create policy [^;]* on (public\.)?\"?${t}\"?"; then
      echo "❌ $file: table '$t' has no CREATE POLICY in the same migration"
      fail=1
    fi
  done

  # --- Views in public must use security_invoker ---
  views=$(echo "$blob" \
    | grep -ioE "create (or replace )?view (public\.)?\"?[a-z_][a-z0-9_]*\"?" \
    | sed -E 's/create (or replace )?view //I; s/public\.//I; s/"//g' \
    | sort -u || true)

  for v in $views; do
    if ! echo "$blob" | grep -iqE "view (public\.)?\"?${v}\"? with \([^)]*security_invoker[[:space:]]*=[[:space:]]*true"; then
      echo "❌ $file: view '$v' is not declared WITH (security_invoker = true)"
      fail=1
    fi
  done
done

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "audit-rls FAILED. Fix the migration(s) above: enable RLS + add a policy in the same"
  echo "file as the CREATE TABLE, and declare views WITH (security_invoker = true)."
  exit 1
fi

echo "✅ audit-rls passed: all public tables have RLS + a policy; views use security_invoker."
