#!/bin/bash
set -euo pipefail
BASE="${BASE:-http://localhost:3000}"
JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

echo "[1] register student"
if [ -n "${USER_ID:-}" ]; then
  echo "USER_ID=$USER_ID (reusing from env, skipping register)"
  : "${EMAIL:?pass EMAIL alongside USER_ID when resuming}"
else
  TS="$(date +%s)"
  EMAIL="smoke${TS}@gmail.com"
  REG="$(curl -s -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
    -d "{\"firstName\":\"Smoke\",\"lastName\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"country\":\"Bosnia\",\"city\":\"Sarajevo\"}")"
  echo "$REG"
  USER_ID="$(echo "$REG" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(String(j.userId??j.user?.id??''))}catch{}})")"
  echo "USER_ID=$USER_ID"
fi

if [ -z "${CODE:-}" ]; then
  echo "NOTE: CODE env var missing — cannot verify email via API."
  echo "To continue: CODE=123456 scripts/smoke.sh (get code from API server log)"
  echo "Stopping here (dry-run OK)."
  exit 0
fi

echo "[2] verify email"
curl -s -X POST "$BASE/api/auth/verify-email" -H 'Content-Type: application/json' \
  -d "{\"userId\":$USER_ID,\"code\":\"$CODE\"}"
echo

echo "[3] login"
LOGIN="$(curl -s -c "$JAR" -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")"
echo "$LOGIN"
echo "$LOGIN" | grep -q '"user"' || { echo "FAIL: login did not return a user"; exit 1; }

echo "[4] GET /api/modules"
curl -s -b "$JAR" "$BASE/api/modules"
echo

echo "[5] POST play quiz 1"
PLAY="$(curl -s -b "$JAR" -X POST "$BASE/api/quizzes/1/play")"
echo "$PLAY"
ATTEMPT_ID="$(echo "$PLAY" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(String(j.attemptId??''))}catch{}})")"
echo "ATTEMPT_ID=$ATTEMPT_ID"

echo "[6] POST submit empty answers"
SUBMIT="$(curl -s -b "$JAR" -X POST "$BASE/api/quizzes/1/submit" -H 'Content-Type: application/json' \
  -d "{\"attemptId\":$ATTEMPT_ID,\"answers\":[]}")"
echo "$SUBMIT"
echo "$SUBMIT" | grep -q '"score"' || { echo "FAIL: submit did not return a score"; exit 1; }

echo "[7] GET leaderboard"
curl -s -b "$JAR" "$BASE/api/leaderboard"
echo
echo "SMOKE OK"
