#!/usr/bin/env bash
set -euo pipefail

OWNER="${GITHUB_OWNER:-wang-xinchun}"
REPO="${GITHUB_REPO:-wang-xinchun.github.io}"
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
REMOTE_URL="https://github.com/${OWNER}/${REPO}.git"
API_URL="https://api.github.com"

if [[ -z "${TOKEN}" ]]; then
  cat >&2 <<'MSG'
Missing GitHub token.

Set a token with repo permissions before running:

  export GITHUB_TOKEN=your_token_here
  bash publish_to_github.sh

MSG
  exit 1
fi

api() {
  curl -fsS \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@"
}

if ! api "${API_URL}/repos/${OWNER}/${REPO}" >/dev/null 2>&1; then
  echo "Creating GitHub repository ${OWNER}/${REPO}..."
  api \
    -X POST \
    "${API_URL}/user/repos" \
    -d "{\"name\":\"${REPO}\",\"private\":false,\"description\":\"Personal research website for Xinchun Wang\",\"has_issues\":true,\"has_projects\":false,\"has_wiki\":false}" \
    >/dev/null
else
  echo "Repository ${OWNER}/${REPO} already exists."
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${REMOTE_URL}"
else
  git remote add origin "${REMOTE_URL}"
fi

AUTH_HEADER="$(printf 'x-access-token:%s' "${TOKEN}" | base64 | tr -d '\n')"

echo "Pushing main branch..."
git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic ${AUTH_HEADER}" push -u origin main

echo "Enabling GitHub Pages from main:/ ..."
pages_status="$(
  curl -sS -o /tmp/github_pages_response.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${API_URL}/repos/${OWNER}/${REPO}/pages" \
    -d '{"source":{"branch":"main","path":"/"}}'
)"

if [[ "${pages_status}" == "201" || "${pages_status}" == "204" ]]; then
  echo "GitHub Pages enabled."
elif [[ "${pages_status}" == "409" || "${pages_status}" == "422" ]]; then
  echo "GitHub Pages may already be enabled or still initializing."
else
  echo "Could not enable GitHub Pages automatically. HTTP ${pages_status}:"
  sed -n '1,120p' /tmp/github_pages_response.json
fi

echo
echo "Repository: https://github.com/${OWNER}/${REPO}"
echo "Website:    https://${OWNER}.github.io/"

