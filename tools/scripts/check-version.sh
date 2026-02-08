#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Must run from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi

ERRORS=0

# Read versions from package.json files
ROOT_VERSION=$(node -e "console.log(require('./package.json').version)")
BACKEND_VERSION=$(node -e "console.log(require('./backend/package.json').version)")
FRONTEND_VERSION=$(node -e "console.log(require('./frontend/package.json').version)")

echo "📋 Version Check"
echo "──────────────────────────────────"
echo -e "  Root package.json:     ${ROOT_VERSION}"
echo -e "  Backend package.json:  ${BACKEND_VERSION}"
echo -e "  Frontend package.json: ${FRONTEND_VERSION}"

# Check all package.json versions match each other
if [ "$ROOT_VERSION" != "$BACKEND_VERSION" ] || [ "$ROOT_VERSION" != "$FRONTEND_VERSION" ]; then
    echo ""
    echo -e "${RED}✗ package.json versions do not match${NC}"
    [ "$ROOT_VERSION" != "$BACKEND_VERSION" ] && echo -e "  ${RED}root ($ROOT_VERSION) ≠ backend ($BACKEND_VERSION)${NC}"
    [ "$ROOT_VERSION" != "$FRONTEND_VERSION" ] && echo -e "  ${RED}root ($ROOT_VERSION) ≠ frontend ($FRONTEND_VERSION)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}✓ All package.json versions match${NC}"
fi

# Check git tag if present
GIT_TAG=$(git describe --exact-match --tags 2>/dev/null || echo "")
if [ -n "$GIT_TAG" ]; then
    TAG_VERSION="${GIT_TAG#v}"  # Strip leading 'v'
    echo ""
    echo -e "  Git tag:               ${GIT_TAG} (${TAG_VERSION})"

    if [ "$TAG_VERSION" != "$ROOT_VERSION" ]; then
        echo -e "  ${RED}✗ Git tag ($GIT_TAG) does not match package.json ($ROOT_VERSION)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "  ${GREEN}✓ Git tag matches package.json${NC}"
    fi
fi

# Check release branch name if on a release branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [[ "$CURRENT_BRANCH" =~ ^release/ ]]; then
    BRANCH_VERSION="${CURRENT_BRANCH#release/v}"  # Strip 'release/v'
    echo ""
    echo -e "  Release branch:        ${CURRENT_BRANCH} (${BRANCH_VERSION})"

    # Allow branch to be a prefix: release/v1.0 matches 1.0.0, release/v1.0.0 matches 1.0.0
    if [[ "$ROOT_VERSION" == "$BRANCH_VERSION"* ]]; then
        echo -e "  ${GREEN}✓ Branch name matches package.json${NC}"
    else
        echo -e "  ${RED}✗ Branch ($CURRENT_BRANCH) does not match package.json ($ROOT_VERSION)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo "──────────────────────────────────"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ ${ERRORS} version mismatch(es) found${NC}"
    echo ""
    echo -e "${YELLOW}To fix, update all package.json files to the same version:${NC}"
    echo "  npm version <version> --no-git-tag-version --prefix ."
    echo "  npm version <version> --no-git-tag-version --prefix backend"
    echo "  npm version <version> --no-git-tag-version --prefix frontend"
    exit 1
else
    echo -e "${GREEN}✓ All versions consistent${NC}"
fi
