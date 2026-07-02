#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REGISTRY="${REGISTRY:-registry.hamdocker.ir/syaser}"
IMAGE_NAME="${IMAGE_NAME:-pelak}"
VERSION="$(node -p "require('./package.json').version")"
PLATFORM="${PLATFORM:-linux/amd64}"

if [[ -z "${REGISTRY_PASSWORD:-}" ]]; then
  echo "REGISTRY_PASSWORD is required (registry login password)." >&2
  exit 1
fi

REGISTRY_USER="${REGISTRY_USER:-syaser}"
REGISTRY_HOST="${REGISTRY_HOST:-registry.hamdocker.ir}"
IMAGE="${REGISTRY}/${IMAGE_NAME}"

GIT_SHA=""
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_SHA="$(git rev-parse --short HEAD)"
fi

TAGS=(
  "${IMAGE}:${VERSION}"
  "${IMAGE}:latest"
)

if [[ -n "$GIT_SHA" ]]; then
  TAGS+=("${IMAGE}:${GIT_SHA}")
fi

echo "Publishing ${IMAGE}"
echo "  version : ${VERSION}"
echo "  platform: ${PLATFORM}"
echo "  tags    : ${TAGS[*]}"

echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY_HOST" -u "$REGISTRY_USER" --password-stdin

if ! docker buildx inspect pelak-builder >/dev/null 2>&1; then
  docker buildx create --name pelak-builder --use >/dev/null
else
  docker buildx use pelak-builder >/dev/null
fi

BUILD_ARGS=(
  --platform "$PLATFORM"
  -f docker/Dockerfile
  --provenance=false
)

for tag in "${TAGS[@]}"; do
  BUILD_ARGS+=(--tag "$tag")
done

BUILD_ARGS+=(--push .)

docker buildx build "${BUILD_ARGS[@]}"

echo ""
echo "Pushed:"
for tag in "${TAGS[@]}"; do
  echo "  ${tag}"
done
